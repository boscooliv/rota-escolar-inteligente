import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowLeftRight, ArrowRight, CheckCircle2 } from "lucide-react";
import { AppHeader, Carregando } from "@/components/app/comum";
import { useSessao } from "@/hooks/use-sessao";
import { formatarData, PONTO_IFRN_ID, PONTOS, ROTULO_TRAJETO, rotuloDia, type Trajeto, type Viagem } from "@/lib/transporte-dados";
import { validarConfirmacao, type ErrosConfirmacao } from "@/lib/transporte-logica";
import { acoes, datasAbertas, descricaoViagem } from "@/lib/transporte-store";
import { cn } from "@/lib/utils";

type Busca = { data?: string | undefined; trajeto?: Trajeto | undefined };

export const Route = createFileRoute("/confirmar")({
  validateSearch: (s: Record<string, unknown>): Busca => {
    const t = s["trajeto"];
    return {
      data: typeof s["data"] === "string" ? s["data"] : undefined,
      trajeto: t === "ida" || t === "volta" || t === "ambos" ? t : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Confirmar viagem · Transporte Escolar NFC" },
      { name: "description", content: "Cadastre a confirmação da sua viagem: data, trajeto e pontos de embarque e desembarque." },
      { property: "og:title", content: "Confirmar viagem · Transporte Escolar NFC" },
      { property: "og:description", content: "Informe se vai ao IFRN, se volta para a cidade ou os dois, e escolha seus pontos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConfirmarViagem,
});

const TRAJETOS: { id: Trajeto; icon: typeof ArrowRight }[] = [
  { id: "ida", icon: ArrowRight },
  { id: "volta", icon: ArrowLeft },
  { id: "ambos", icon: ArrowLeftRight },
];
const selectCls =
  "mt-1 w-full rounded-xl border border-input bg-card px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";

function ConfirmarViagem() {
  const busca = Route.useSearch();
  const { s, usuario, aluno } = useSessao();
  const [data, setData] = useState(busca.data ?? "");
  const [trajeto, setTrajeto] = useState<Trajeto | "">(busca.trajeto ?? "");
  const [embarqueId, setEmbarqueId] = useState("");
  const [desembarqueId, setDesembarqueId] = useState("");
  const [erros, setErros] = useState<ErrosConfirmacao>({});
  const [sucesso, setSucesso] = useState<Viagem[] | null>(null);

  if (!usuario) return <Carregando />;
  if (!aluno)
    return (
      <div className="px-5 pt-10 text-center">
        <p className="font-bold">Somente alunos confirmam viagens.</p>
        <Link to="/viagens" className="mt-3 inline-block font-semibold underline">Ver viagens</Link>
      </div>
    );

  const datas = datasAbertas(s);

  function escolherTrajeto(t: Trajeto) {
    setTrajeto(t);
    // Sugere os pontos padrão do aluno conforme o trajeto escolhido.
    if (t === "volta") {
      setEmbarqueId((e) => e || PONTO_IFRN_ID);
      setDesembarqueId((d) => d || aluno!.pontoPadraoId);
    } else {
      setEmbarqueId((e) => e || aluno!.pontoPadraoId);
      setDesembarqueId((d) => d || PONTO_IFRN_ID);
    }
  }

  function enviar(e: FormEvent) {
    e.preventDefault();
    const v = validarConfirmacao({ data, trajeto, embarqueId, desembarqueId }, datas);
    setErros(v);
    if (Object.keys(v).length || !trajeto) return;
    const viagens = acoes.confirmarViagens(aluno!.id, data, trajeto, embarqueId, desembarqueId);
    if (!viagens.length) return setErros({ trajeto: "Não há viagem aberta nesse trajeto para a data escolhida." });
    setSucesso(viagens);
    toast.success("Viagem confirmada!");
  }

  if (sucesso)
    return (
      <div>
        <AppHeader titulo="Viagem confirmada" usuario={usuario} />
        <div className="card-surface mx-5 p-6 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15">
            <CheckCircle2 className="size-9 text-success" />
          </span>
          <p className="mt-4 text-lg font-extrabold">Tudo certo, {usuario.nome.split(" ")[0]}!</p>
          <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
            {sucesso.map((v) => (
              <li key={v.id}>{descricaoViagem(v)}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">Lembre de aproximar sua tag NFC do leitor ao entrar no ônibus.</p>
          <div className="mt-5 grid gap-2">
            <Link to="/viagens/$id" params={{ id: sucesso[0]!.id }} className="rounded-2xl bg-primary py-3 font-bold text-primary-foreground shadow-pop">
              Ver viagem
            </Link>
            <button type="button" onClick={() => setSucesso(null)} className="py-2 text-sm font-semibold text-muted-foreground underline">
              Nova confirmação
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div>
      <AppHeader titulo="Confirmar viagem" usuario={usuario} />
      <form onSubmit={enviar} noValidate className="card-surface mx-5 space-y-5 p-5">
        <label className="block">
          <span className="text-sm font-semibold">Viagem (data) *</span>
          <select aria-label="Data da viagem" value={data} onChange={(e) => setData(e.target.value)} aria-invalid={!!erros.data} className={selectCls}>
            <option value="">Selecione a data</option>
            {datas.map((d) => (
              <option key={d} value={d}>
                {rotuloDia(d)} · {formatarData(d, { weekday: "long", day: "2-digit", month: "2-digit" })}
              </option>
            ))}
          </select>
          {erros.data && <span className="mt-1 block text-sm text-destructive">{erros.data}</span>}
        </label>

        <fieldset>
          <legend className="text-sm font-semibold">Trajeto *</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {TRAJETOS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={trajeto === id}
                onClick={() => escolherTrajeto(id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-center text-xs font-bold transition-colors",
                  trajeto === id ? "border-secondary bg-primary text-primary-foreground" : "border-border bg-card text-foreground",
                  erros.trajeto && !trajeto && "border-destructive",
                )}
              >
                <Icon className="size-5" />
                {ROTULO_TRAJETO[id]}
              </button>
            ))}
          </div>
          {erros.trajeto && <span className="mt-1 block text-sm text-destructive">{erros.trajeto}</span>}
        </fieldset>

        <label className="block">
          <span className="text-sm font-semibold">Ponto de embarque *</span>
          <select aria-label="Ponto de embarque" value={embarqueId} onChange={(e) => setEmbarqueId(e.target.value)} aria-invalid={!!erros.embarqueId} className={selectCls}>
            <option value="">Selecione o ponto</option>
            {PONTOS.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} – {p.cidade}</option>
            ))}
          </select>
          {erros.embarqueId && <span className="mt-1 block text-sm text-destructive">{erros.embarqueId}</span>}
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Ponto de desembarque *</span>
          <select aria-label="Ponto de desembarque" value={desembarqueId} onChange={(e) => setDesembarqueId(e.target.value)} aria-invalid={!!erros.desembarqueId} className={selectCls}>
            <option value="">Selecione o ponto</option>
            {PONTOS.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} – {p.cidade}</option>
            ))}
          </select>
          {erros.desembarqueId && <span className="mt-1 block text-sm text-destructive">{erros.desembarqueId}</span>}
        </label>

        {trajeto === "ambos" && <p className="rounded-xl bg-accent p-3 text-xs text-accent-foreground">Na volta, o trajeto se inverte: você embarca no ponto de desembarque da ida.</p>}

        <button type="submit" className="w-full rounded-2xl bg-primary py-3.5 font-bold text-primary-foreground shadow-pop">
          Confirmar
        </button>
        <p className="text-center text-xs text-muted-foreground">* Campos obrigatórios</p>
      </form>
    </div>
  );
}
