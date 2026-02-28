/**
 * 사업자번호 유틸리티 모듈
 *
 * - 포맷 변환 (XXX-XX-XXXXX)
 * - 체크디짓 유효성 검증
 * - 10자리 완성 여부 판단
 */

/** 숫자만 추출 */
export function stripBizNo(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

/** XXX-XX-XXXXX 형식으로 포맷 */
export function formatBizNo(raw: string): string {
  const digits = stripBizNo(raw);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

/** 숫자 10자리 입력이 완료되었는지 확인 */
export function isBizNoComplete(raw: string): boolean {
  return stripBizNo(raw).length === 10;
}

/**
 * 사업자번호 체크디짓(검증번호) 알고리즘
 *
 * 국세청 사업자등록번호 검증 로직:
 *  가중치 = [1, 3, 7, 1, 3, 7, 1, 3, 5]
 *  각 자리 × 가중치의 합 + (9번째 자리 × 5 / 10 의 정수부)
 *  이 합계의 마지막 자릿수(mod 10)와 10번째 자리(체크디짓)의 합이 10 또는 0이면 유효
 */
export function validateBizNoCheckDigit(raw: string): boolean {
  const digits = stripBizNo(raw);
  if (digits.length !== 10) return false;

  const d = digits.split("").map(Number);
  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += d[i] * weights[i];
  }
  // 9번째 자리(index 8) × 5 의 십의 자리
  sum += Math.floor((d[8] * 5) / 10);

  const remainder = sum % 10;
  const checkDigit = d[9];

  return (10 - remainder) % 10 === checkDigit;
}
