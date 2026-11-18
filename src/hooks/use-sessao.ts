import { useNavigate, useHydrated } from "@tanstack/react-router";
import { useEffect } from "react";
import { alunoDoUsuario, useEstado, usuarioAtual } from "@/lib/transporte-store";

/** Usuário logado no protótipo; manda para o login quando não há sessão. */
export function useSessao({ exigir = true } = {}) {
  const s = useEstado();
  const hidratado = useHydrated();
  const navigate = useNavigate();
  const usuario = hidratado ? usuarioAtual(s) : undefined;

  useEffect(() => {
    if (exigir && hidratado && !usuarioAtual(s)) navigate({ to: "/" });
  }, [exigir, hidratado, s, navigate]);

  return { s, hidratado, usuario, aluno: alunoDoUsuario(usuario?.id ?? null) };
}
