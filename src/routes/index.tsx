import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GraduationCap, LogIn, Nfc, ShieldCheck } from "lucide-react";
import onibus from "@/assets/onibus.png";
import { USUARIOS } from "@/lib/transporte-dados";
import { validarLogin } from "@/lib/transporte-logica";
import { acoes } from "@/lib/transporte-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar · Sistema de Gestão do Transporte Escolar NFC" },
      { name: "description", content: "Acesse o sistema de transporte escolar do IFRN Pau dos Ferros como aluno ou responsável pelo transporte." },
      { property: "og:title", content: "Entrar · Sistema de Gestão do Transporte Escolar NFC" },
      { property: "og:description", content: "Confirmação de viagens, embarque por NFC e acompanhamento do ônibus escolar do IFRN Pau dos Ferros." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

const ALUNO_DEMO = USUARIOS.find((u) => u.perfil === "aluno")!;
const RESP_DEMO = USUARIOS.find((u) => u.perfil === "responsavel")!;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});

  function entrarComo(usuarioId: string) {
    acoes.entrar(usuarioId);
    navigate({ to: "/viagens" });
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const v = validarLogin(email, senha);
    if (v.email || v.senha) return setErros(v);
    const u = USUARIOS.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) return setErros({ geral: "Usuário não encontrado. Use um e-mail de demonstração ou a entrada rápida abaixo." });
    entrarComo(u.id);
  }

  return (
    <div className="px-5 pb-10 pt-6">
      <section className="relative overflow-hidden rounded-3xl bg-secondary p-6 pb-8 text-secondary-foreground">
        <div className="stripe-bus absolute inset-x-0 top-0 h-2" />
        <img src={onibus} alt="Ônibus escolar" width={1024} height={768} className="animate-bus-bob absolute -right-12 top-10 w-48 drop-shadow-xl" />
        <span className="mt-2 flex size-11 items-center justify-center rounded-2xl bg-primary">
          <Nfc className="size-6 text-primary-foreground" />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-primary">IFRN · Pau dos Ferros</p>
        <h1 className="mt-1 max-w-[12rem] text-2xl font-extrabold leading-tight">Transporte Escolar por NFC</h1>
        <p className="mt-2 max-w-[13rem] text-sm text-secondary-foreground/75">Confirme sua viagem, embarque com a tag e acompanhe o ônibus.</p>
      </section>

      <form onSubmit={enviar} noValidate className="card-surface mt-5 space-y-4 p-5">
        <h2 className="text-lg font-extrabold">Entrar</h2>
        <label className="block">
          <span className="text-sm font-semibold">E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu.nome@escolar.ifrn.edu.br"
            autoComplete="email"
            aria-invalid={!!erros.email}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive"
          />
          {erros.email && <span className="mt-1 block text-sm text-destructive">{erros.email}</span>}
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            aria-invalid={!!erros.senha}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive"
          />
          {erros.senha && <span className="mt-1 block text-sm text-destructive">{erros.senha}</span>}
        </label>
        {erros.geral && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{erros.geral}</p>}
        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-bold text-primary-foreground shadow-pop">
          <LogIn className="size-5" /> Entrar
        </button>
      </form>

      <div className="mt-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">Entrada rápida (demonstração)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => entrarComo(ALUNO_DEMO.id)} className="card-surface flex items-center gap-3 p-4 text-left">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent">
              <GraduationCap className="size-5 text-accent-foreground" />
            </span>
            <span>
              <span className="block font-bold">Entrar como aluno</span>
              <span className="block text-xs text-muted-foreground">{ALUNO_DEMO.nome}</span>
            </span>
          </button>
          <button type="button" onClick={() => entrarComo(RESP_DEMO.id)} className="card-surface flex items-center gap-3 p-4 text-left">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
              <ShieldCheck className="size-5 text-secondary-foreground" />
            </span>
            <span>
              <span className="block font-bold">Entrar como responsável</span>
              <span className="block text-xs text-muted-foreground">{RESP_DEMO.nome}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
