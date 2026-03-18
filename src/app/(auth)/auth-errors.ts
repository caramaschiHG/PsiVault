export const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar.",
  "User already registered": "Este e-mail já possui uma conta.",
  "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
  "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos.",
  "Token has expired or is invalid": "Este link expirou ou já foi utilizado.",
  "New password should be different from the old password": "A nova senha deve ser diferente da atual.",
};

export function translateAuthError(message: string): string {
  return AUTH_ERRORS[message] ?? "Ocorreu um erro inesperado. Tente novamente.";
}
