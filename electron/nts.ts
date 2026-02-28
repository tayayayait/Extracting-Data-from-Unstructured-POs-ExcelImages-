/**
 * 국세청_사업자등록정보 진위확인 및 상태조회 서비스 연동 모듈
 * 
 * 관련 문서: https://www.data.go.kr/data/15081808/openapi.do
 * 엔드포인트: https://api.odcloud.kr/api/nts-businessman/v1/status
 */

export interface NtsStatusResponse {
  request_cnt: number;
  match_cnt: number;
  status_code: string;
  data: {
    b_no: string;           // 사업자등록번호
    b_stt_cd: string;       // 납세자상태(명칭) (01: 계속사업자, 02: 휴업자, 03: 폐업자)
    b_stt: string;          // 납세자상태
    tax_type: string;       // 과세유형
    tax_type_cd: string;    // 과세유형코드
    end_dt: string;         // 폐업일(YYYYMMDD)
    utcc_yn: string;        // 단위과세전환폐업여부 (Y,N)
    tax_type_change_dt: string; // 최근과세유형전환일자(YYYYMMDD)
    invoice_apply_dt: string; // 세금계산서적용일자(YYYYMMDD)
    rbf_tax_type: string;   // 직전과세유형
    rbf_tax_type_cd: string; // 직전과세유형코드
  }[];
}

/**
 * 
 * @param bizNumber 사업자등록번호 (진위확인 대상, 하이픈 없는 10자리 문자열)
 * @param apiKey 공공데이터포털 발급 서비스키 (Encoding 된 상태 그대로 사용)
 * @returns NtsStatusResponse 형식의 JSON 객체 반환
 */
export async function checkBusinessStatus(bizNumber: string, apiKey: string): Promise<NtsStatusResponse> {
  if (!apiKey) {
    throw new Error('NTS API Key is missing. Please configure it in .env');
  }

  // 하이픈 제거
  const cleanNumber = bizNumber.replace(/-/g, '').trim();
  
  if (cleanNumber.length !== 10) {
    throw new Error('사업자등록번호는 10자리 숫자여야 합니다.');
  }

  const url = `https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${apiKey}`;

  const payload = {
    b_no: [cleanNumber]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NTS API HTTP Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data as NtsStatusResponse;
  } catch (error) {
    console.error('Failed to check business status via NTS api:', error);
    throw error;
  }
}
