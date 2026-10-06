export function validateCredentials(
  username: string,
  password: string
): boolean {
  return username.trim().length > 0 && password.length >= 6;
}