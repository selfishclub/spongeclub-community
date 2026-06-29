import bcrypt from "bcryptjs";

const BCRYPT_ROUNDS = 10;

// bcrypt 해시는 항상 $2 로 시작 (60자). 기존 평문 PIN(4자리 숫자)과 명확히 구분된다.
export function isHashed(value: string | null | undefined): boolean {
  if (!value) return false;
  return value.startsWith("$2");
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, BCRYPT_ROUNDS);
}

export async function verifyPin(
  inputPin: string,
  stored: string | null | undefined
): Promise<boolean> {
  if (!stored) return false;
  if (isHashed(stored)) {
    return bcrypt.compare(inputPin, stored);
  }
  // 마이그레이션 호환: 아직 해시되지 않은 평문 PIN 비교.
  // 로그인 성공 시 호출 측에서 즉시 해시로 교체한다.
  return inputPin === stored;
}
