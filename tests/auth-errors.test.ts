import { describe, it, expect } from "vitest";
import { translateAuthError } from "@/app/(auth)/auth-errors";

describe("translateAuthError", () => {
  it("traduz Invalid login credentials", () => {
    expect(translateAuthError("Invalid login credentials")).toBe("E-mail ou senha incorretos.");
  });

  it("traduz Email not confirmed", () => {
    expect(translateAuthError("Email not confirmed")).toBe("Confirme seu e-mail antes de entrar.");
  });

  it("traduz User already registered", () => {
    expect(translateAuthError("User already registered")).toBe("Este e-mail já possui uma conta.");
  });

  it("traduz Password should be at least 6 characters", () => {
    expect(translateAuthError("Password should be at least 6 characters")).toBe(
      "A senha deve ter pelo menos 6 caracteres."
    );
  });

  it("traduz Email rate limit exceeded", () => {
    expect(translateAuthError("Email rate limit exceeded")).toBe(
      "Muitas tentativas. Aguarde alguns minutos."
    );
  });

  it("traduz Token has expired or is invalid", () => {
    expect(translateAuthError("Token has expired or is invalid")).toBe(
      "Este link expirou ou já foi utilizado."
    );
  });

  it("traduz New password should be different from the old password", () => {
    expect(translateAuthError("New password should be different from the old password")).toBe(
      "A nova senha deve ser diferente da atual."
    );
  });

  it("retorna mensagem genérica para mensagem desconhecida", () => {
    expect(translateAuthError("qualquer outra coisa")).toBe(
      "Ocorreu um erro inesperado. Tente novamente."
    );
  });

  it("retorna mensagem genérica para string vazia", () => {
    expect(translateAuthError("")).toBe("Ocorreu um erro inesperado. Tente novamente.");
  });
});
