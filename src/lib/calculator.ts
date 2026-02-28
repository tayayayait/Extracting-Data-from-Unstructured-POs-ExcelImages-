import Decimal from 'decimal.js';

/**
 * 정밀 반올림 함수 (사사오입)
 * Excel의 ROUND() 작동 방식과 100% 일치시킵니다.
 * 부동 소수점 한계를 피하기 위해 Decimal.js 사용
 * 
 * @param amount 금액 또는 계산된 수치
 * @param decimalPlaces 소수점 처리 자리 (기본 0: 정수)
 */
export function roundCurrency(amount: number | string, decimalPlaces: number = 0): number {
  if (amount === undefined || amount === null || amount === '') return 0;
  try {
    return new Decimal(amount)
      .toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP)
      .toNumber();
  } catch (e) {
    console.error("Invalid amount provided to roundCurrency:", amount);
    return 0;
  }
}

/**
 * 복합 텍스트(규격 문자열)에서 W, D, H를 분리합니다.
 * 예: "30*60*90", "30x60" -> [30, 60, 90]
 */
export function parseDimensions(dimStr: string): [number, number, number] {
  if (!dimStr) return [0, 0, 0];
  
  // '*', 'x', 'X' 문자를 기준으로 분할하고 숫자 외의 문자 제거
  const parts = dimStr.split(/[\*xX]/).map(s => {
    const num = parseFloat(s.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  });
  
  const w = parts[0] || 0;
  const d = parts[1] || 0;
  const h = parts[2] || 0;
  
  return [w, d, h];
}

/**
 * 부피와 비중(Specific Gravity)을 활용한 중량(kg) 자동 계산
 * 기본 단위 가정: mm단위 입력 -> 부피 / 1,000,000 * 비중 = kg
 * 
 * @param w Width (mm)
 * @param d Depth (mm)
 * @param h Height/Thickness (mm)
 * @param specificGravity 소재별 비중 (예: 철 7.85, 알루미늄 2.7)
 */
export function calculateWeight(w: number, d: number, h: number, specificGravity: number): number {
  // 하나라도 0이면 평면이거나 직선이므로 체적 계산 불가(중량 0 처리 또는 도면상 기본단위 채택)
  if (w <= 0 || d <= 0 || (h <= 0 && w > 0 && d > 0)) {
     // 평판재나 잔재가 아닌 경우 특수 로직이 필요할 수 있으나 기본 공식 적용
  }
  
  // h가 0으로 들어온 판재(가로x세로만 있는 경우)는 보통 기본 두께가 있으나 여기선 입력된 값 위주 계산
  const effectiveH = h > 0 ? h : 1; 

  try {
    const volume = new Decimal(w).mul(d).mul(effectiveH);
    // mm^3 -> L (또는 dm^3) = / 1,000,000
    const weight = volume.mul(specificGravity).div(1000000);
    
    // 소수점 3자리까지 출력
    return weight.toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
  } catch (e) {
    return 0;
  }
}

/**
 * 단가 테이블과 계산 로직을 합쳐 최종 소계(Amount) 산출
 */
export function calculateTotalAmount(qty: number, unitPrice: number): number {
  return roundCurrency(new Decimal(qty).mul(unitPrice).toNumber(), 0);
}
