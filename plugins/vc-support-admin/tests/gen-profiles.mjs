#!/usr/bin/env node
// Document Profile 생성기 — Agent C 구조분석 결과를 YAML(JSON subset)로 고정한다.
// 값(개인정보·번호·본문)은 담지 않는다. 구조·마커·판정 규칙만 담는다.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const DIR = path.join(ROOT, "skills", "e2e03-tax-id-application", "document_profiles");

const P = [
{ profile_id: "tax_id_application_package", document_type_ko: "고유번호증 신청서류 합본",
  process_ids: ["P03"], evidence_type: "SUBMISSION_PACKAGE", file_extensions: ["pdf"], page_range: "30-40",
  visual_markers: ["1p 좌상단 법령 별지서식 근거 띠", "번호 붙은 섹션 박스(인적사항/사업장 현황/유의사항)", "페이지 하단 절반의 체크박스 격자", "중반부 관공서 발급물 스캔 삽입으로 서체·해상도 급변", "후반부 목차→사업계획서→규약(조문 번호 세로 나열)"],
  text_markers: ["사업자등록 신청서", "법인이 아닌 단체의 고유번호 신청서", "별지 제4호서식", "투자조합 세부명세", "부표", "무상사용승낙서", "사용인감계", "사업계획서", "세무서장 귀하"],
  exclude_markers: ["접수증"],
  field_candidates: [
    { field: "단체명", position: "1p 인적사항 상호(단체명) 칸", machine_extractable: "yes" },
    { field: "사업장 소재지", position: "1p 인적사항 하단 전폭 행", machine_extractable: "yes" },
    { field: "투자조합 구분", position: "1p 중단 체크박스군", machine_extractable: "partial", note: "스캔 품질에 따라 오검출" },
    { field: "총 출자금·출자좌수·1좌당 금액", position: "부표 조합 설립 사항 3열 표", machine_extractable: "yes" },
    { field: "조합원 수", position: "부표 조합원 표 행 수", machine_extractable: "partial", note: "표 행 병합으로 카운트 오류" },
    { field: "사무실 사용 근거 유형", position: "임대차 명세 + 무상사용승낙서 유무 교차", machine_extractable: "partial" },
    { field: "규약 시행일", position: "규약 말미 부칙 제1조", machine_extractable: "yes" },
    { field: "대표자 성명", position: "1p 인적사항 우측", machine_extractable: "no", note: "개인정보 — 추출·보고 금지" }],
  human_checks: ["날인·서명 실물 존재 여부", "신청서·규약·사업계획서·사용인감계 간 조합명 표기 일치", "부표 조합원 합계와 규약 별표 합계 일치", "첨부 필수서류 누락 및 인감증명서 유효기간", "개인식별정보 페이지 취급 적정성"],
  invalid_conditions: ["날인 누락", "별지 부표 미첨부", "규약·사업계획서 미포함", "스캔 페이지 누락·역순", "조합명 불일치", "인감증명서 발급 3개월 초과"],
  duplicate_key_fields: ["단체명", "사업장 소재지", "규약 시행일", "총 출자금"],
  completion_candidate_tasks: ["P03-T02", "P03-T03"], alone_completes_task: false,
  confidence: "HIGH", confidence_reason: "법령 별지 서식이라 레이아웃이 전국 공통, 텍스트 레이어 존재" },

{ profile_id: "tax_office_receipt", document_type_ko: "고유번호증 접수증",
  process_ids: ["P03"], evidence_type: "RECEIPT", file_extensions: ["pdf"], page_range: "1",
  visual_markers: ["상단 중앙 대형 세로 확장 글자 접수증", "좌상단 접수번호·접수일시 2행 라벨 스택", "중단 라벨-값 2열 테이블", "하단 좌측 안내사항 고정 장문 블록", "최하단 우측 민원접수자와 세무서명"],
  text_markers: ["접수증", "접수번호", "접수일시", "민원명", "민원인", "처리 예정 기한", "처리주무부서", "안내사항", "민원접수자"],
  exclude_markers: ["정정", "폐업"],
  field_candidates: [
    { field: "접수번호", position: "좌상단 라벨 우측", machine_extractable: "yes", note: "고정 포맷 정규식 추출 가능. 단독 유일키" },
    { field: "접수일시", position: "접수번호 아래", machine_extractable: "yes" },
    { field: "민원명", position: "중단 첫 행", machine_extractable: "yes", note: "신규·정정·폐업 판별 키" },
    { field: "민원인", position: "민원인 행", machine_extractable: "partial", note: "조합명 없이 GP 법인명만 기재된 사례 관측" },
    { field: "처리 예정 기한", position: "중단 3행", machine_extractable: "yes" },
    { field: "처리주무부서", position: "중단 4행", machine_extractable: "partial", note: "담당자명 포함 시 마스킹" },
    { field: "발행 세무서명", position: "우측 최하단", machine_extractable: "yes" }],
  human_checks: ["처리주무부서 세무서 약칭과 하단 세무서명 불일치 사례가 재사용 검증에서 재현됨 — 관할 확정은 사람", "민원명이 신규 신청인지 정정·폐업인지 확인", "조합명이 대상 펀드와 동일한지(약칭·띄어쓰기 변형)", "텍스트 레이어 없는 순수 스캔본은 육안 확인"],
  invalid_conditions: ["민원명이 대상 건과 불일치", "접수번호·접수일시 미표시", "다른 조합 접수증", "정정·폐업 접수증을 신규 발급 근거로 사용", "판독 불가"],
  duplicate_key_fields: ["접수번호"],
  completion_candidate_tasks: ["P03-T04"], alone_completes_task: false,
  confidence: "HIGH", confidence_reason: "국세청 표준 출력물. 재사용 검증에서 text marker 100% 일치",
  fallback: "text_markers 실패 시 visual_markers 기반 이미지 분류로 폴백 필수(순수 스캔본 존재)" },

{ profile_id: "tax_id_certificate_issued", document_type_ko: "발급 고유번호증",
  process_ids: ["P03"], evidence_type: "RESULT_DOCUMENT", file_extensions: ["pdf"], page_range: "1",
  visual_markers: ["상단 중앙 굵은 제목 고유번호증", "배경 워터마크", "좌측 라벨 넓은 자간(단 체 명·소 재 지)", "중하단 유의사항 박스 2개 항", "하단 중앙 발급일자와 세무서장 직인", "우하단 국세청 엠블럼"],
  text_markers: ["고유번호증", "단체명", "소재지", "발급사유", "유의사항", "세무서장"],
  exclude_markers: ["신청서", "접수증"],
  field_candidates: [
    { field: "발급사유", position: "대표자 행 아래", machine_extractable: "yes", note: "신규·정정 분기 키" },
    { field: "발급일자", position: "하단 중앙", machine_extractable: "yes" },
    { field: "발급 세무서명", position: "발급일자 아래", machine_extractable: "yes" },
    { field: "소재지", position: "단체명 아래", machine_extractable: "yes" },
    { field: "단체명", position: "라벨 우측", machine_extractable: "partial", note: "장문 조합명 줄바꿈으로 절단 발생" },
    { field: "고유번호", position: "제목 아래", machine_extractable: "no", note: "민감식별자 — 추출 가능하나 보고·저장 금지" },
    { field: "대표자 성명·생년월일", position: "같은 행 좌우", machine_extractable: "no", note: "개인정보" },
    { field: "직인 존재", position: "세무서명 우측", machine_extractable: "no", note: "이미지" }],
  human_checks: ["직인·엠블럼 실물 날인 여부", "단체명 표기가 규약·신청서와 정확히 일치하는지", "발급사유가 신규인지 정정인지", "발급 세무서가 접수 세무서와 다른 경우 사유"],
  invalid_conditions: ["직인 미표시", "화질로 판독 불가", "발급사유 불일치(정정본을 최초 발급 증빙으로 사용)", "폐업·말소 이후 문서"],
  duplicate_key_fields: ["발급일자", "발급사유"],
  completion_candidate_tasks: ["P03-T05", "P03-T06"], alone_completes_task: false,
  confidence: "HIGH", confidence_reason: "국세청 표준 발급물" },

{ profile_id: "tax_office_supplement", document_type_ko: "세무서 보완 제출용 서류",
  process_ids: ["P03"], evidence_type: "SUPPLEMENT", file_extensions: ["pdf"], page_range: "1-20",
  visual_markers: ["파일명 접미 '세무서 보완 제출용'이 가장 강한 식별자", "꺾쇠 제목 동의서 형태", "구분·투자자명·출자약정액·생년월일·기명날인 단일 표", "기명날인 열에 도장 이미지 셀", "표 최하단 합계 행", "합본에서 발췌된 쪽번호 잔존"],
  text_markers: ["세무서 보완 제출용", "업무집행조합원 선임 동의서", "출자약정액", "기명날인", "합계"],
  field_candidates: [
    { field: "보완 문서 종류", position: "파일명 접미사 + 본문 제목", machine_extractable: "partial", note: "본문에 보완 문구 없음 — 파일명 의존" },
    { field: "조합원 구분", position: "표 1열", machine_extractable: "partial", note: "세로 병합 셀로 행 매핑 깨짐" },
    { field: "출자약정액·합계", position: "표 3열 및 합계 행", machine_extractable: "partial", note: "열 정렬 붕괴로 값-행 매칭 오류" },
    { field: "투자자명·생년월일", position: "표 2·4열", machine_extractable: "no", note: "개인정보" },
    { field: "기명날인 유무", position: "표 5열", machine_extractable: "no", note: "이미지 셀" },
    { field: "대상 조합", position: "본문에 미기재 가능", machine_extractable: "no", note: "폴더 경로로만 귀속 판정" }],
  human_checks: ["어떤 보완 요구에 대한 응답인지 — 문서 내부에 단서 없음", "조합원 전원 날인 완비 여부", "합계액이 신청서 부표·규약 별표와 일치", "문서가 대상 조합의 것인지", "재제출본인지 최초본인지"],
  invalid_conditions: ["날인 누락 행 존재", "합계 불일치", "세무서 요구항목과 다른 서류", "조합 귀속 불명", "보완 기한 경과"],
  duplicate_key_fields: ["폴더 경로", "문서 제목", "합계액", "파일 수정일"],
  completion_candidate_tasks: ["P03-T02", "P03-T04"], alone_completes_task: false,
  confidence: "MEDIUM", confidence_reason: "정형 서식이 아니라 매 건 다른 문서가 등장. 파일명 규칙 의존도 높음" },

{ profile_id: "security_card_credentials", document_type_ko: "보안카드 발급 결과",
  process_ids: ["P04"], evidence_type: "SECURITY_CARD", file_extensions: ["pdf"], page_range: "1",
  visual_markers: ["극단적으로 여백이 많은 1페이지, 텍스트 2-3행", "표·로고·직인 없음 — 내용이 거의 없다는 것 자체가 식별 특징"],
  text_markers: ["보안카드"], exclude_markers: ["신청서류"],
  field_candidates: [
    { field: "조합명", position: "1행", machine_extractable: "yes" },
    { field: "발급 여부", position: "공용 폴더 내 파일 존재", machine_extractable: "yes" },
    { field: "정정 이력", position: "파일명 접미", machine_extractable: "partial" },
    { field: "로그인 자격증명", position: "2행", machine_extractable: "no", note: "평문 자격증명 — 본문 미독 원칙, 취급 금지" }],
  human_checks: ["자격증명 평문 노출로 본문 미독 정책 확정 필요", "동일 조합에 폐기·정정 복수본 존재 시 유효본 판별", "신청서류형과 발급결과형 혼동 방지"],
  invalid_conditions: ["파일명 폐기 표식", "조합명 오타본", "신청서류형을 발급 완료 증빙으로 사용", "계좌개설 전 시점 파일"],
  duplicate_key_fields: ["조합명", "파일 수정일", "정정 표식"],
  completion_candidate_tasks: [], alone_completes_task: false,
  confidence: "MEDIUM", confidence_reason: "공용 폴더 수집물이라 서식 통일성 없음. 파일명 규칙 의존",
  content_read_policy: "FORBIDDEN" },

{ profile_id: "bank_account_opening_package", document_type_ko: "계좌개설 신청서류 합본",
  process_ids: ["P07"], evidence_type: "SUBMISSION_PACKAGE", file_extensions: ["pdf"], page_range: "10-20",
  visual_markers: ["초고밀도 체크박스 격자", "각 서식 블록 우측 끝 검인·사후확인·팀원·팀장 결재 스탬프 칸", "페이지 하단 우측 서식번호와 개정일자", "각 블록 말미 신청인 날인란 반복(10개 이상)", "좌우 대칭 2단 인쇄로 동일 내용 중복 출현", "뒷부분 약관·안내문 전문"],
  text_markers: ["실제소유자확인", "전자금융서비스", "보안매체", "이체한도", "위임장", "은행보관용"],
  field_candidates: [
    { field: "신청인(조합명)", position: "각 서식 말미 신청인 우측", machine_extractable: "yes", note: "합본 전반 반복으로 교차 검증 가능" },
    { field: "대표자(GP 법인명)", position: "신청인 아래 행", machine_extractable: "yes" },
    { field: "은행명·지점명", position: "위임장 상단", machine_extractable: "yes" },
    { field: "서식 구성 목록", position: "페이지 하단 서식번호와 개정일자", machine_extractable: "yes", note: "서식 종류 판정의 강력한 신호" },
    { field: "전자금융서비스 종류·보안매체·위임 항목", position: "체크박스군", machine_extractable: "no", note: "체크 마크 미검출 — 전 항목 공란으로 읽힘" },
    { field: "이체한도", position: "이체한도 표", machine_extractable: "no", note: "한글 금액 수기 기입" },
    { field: "날인 완료 여부", position: "각 인(서명) 칸", machine_extractable: "no" }],
  human_checks: ["체크박스 상태 전량 — 실질 내용 대부분이 체크박스인데 기계 판독 실패", "한글 기입 이체한도 금액", "날인란 누락 여부(10개 이상 중 한 곳이라도 누락 시 반려)", "고객보관용·은행보관용 중 제출본 식별", "첨부서류 유효기간 3개월 준수", "조합명·GP 명의가 고유번호증·규약과 일치"],
  invalid_conditions: ["필수 날인란 공란", "은행 검인란 미기입", "첨부서류 유효기간 초과", "고유번호증 발급 전 작성본", "지점명 상이", "조합명·GP 표기 불일치"],
  duplicate_key_fields: ["조합명", "은행·지점명", "서식 개정번호 세트", "작성일자"],
  completion_candidate_tasks: [], alone_completes_task: false,
  confidence: "MEDIUM", confidence_reason: "2단 인쇄로 라벨 2회 중복 출력되어 파싱 난이도 높음. 은행별 서식 편차 미검증",
  out_of_scope_note: "P07 Skill 미구현 — 확장 준비용 Profile" }
];

fs.mkdirSync(DIR, { recursive: true });
for (const p of P) fs.writeFileSync(path.join(DIR, `${p.profile_id}.yaml`), `${JSON.stringify(p, null, 2)}\n`);
console.log(`document profiles written: ${P.length}`);
