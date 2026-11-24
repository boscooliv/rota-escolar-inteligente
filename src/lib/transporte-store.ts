// Estado do protótipo guardado no navegador (localStorage). Sem backend: só para demonstração.
import { useSyncExternalStore } from "react";
import {
  ALUNOS,
  PONTOS,
  RESPONSAVEIS,
  TAGS,
  USUARIOS,
  dataISO,
  gerarSementes,
  gerarViagens,
  hora,
  nomeAluno,
  nomePonto,
  onibusDe,
  pontosDoSentido,
  ROTULO_SENTIDO,
  rotuloDia,
  type Confirmacao,
  type Embarque,
  type MetodoEmbarque,
  type Notificacao,
  type Sentido,
  type StatusViagem,
  type Trajeto,
  type Usuario,
  type Viagem,
} from "./transporte-dados";
import { confirmadosSemEmbarque, encontrarTag, progressoDoPonto, sentidosDoTrajeto } from "./transporte-logica";

export type Estado = {
  dia: string;
  usuarioId: string | null;
  viagens: Viagem[];
  confirmacoes: Confirmacao[];
  embarques: Embarque[];
  notificacoes: Notificacao[];
};

const CHAVE = "transporte-nfc-demo-v3";

function semente(usuarioId: string | null = null): Estado {
  const viagens = gerarViagens();
  return { dia: dataISO(0), usuarioId, viagens, ...gerarSementes(viagens) };
}

const estadoServidor = semente();
let estado: Estado = estadoServidor;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const salvo = JSON.parse(window.localStorage.getItem(CHAVE) ?? "null") as Estado | null;
    // As viagens são sempre ontem/hoje/amanhã: num novo dia, recomeça a demonstração.
    estado = salvo && salvo.dia === dataISO(0) ? salvo : semente(salvo?.usuarioId ?? null);
  } catch {
    estado = semente();
  }
}

function atualizar(fn: (s: Estado) => Estado) {
  carregar();
  estado = fn(estado);
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* armazenamento indisponível */
  }
  ouvintes.forEach((o) => o());
}

export function useEstado(): Estado {
  return useSyncExternalStore(
    (o) => {
      ouvintes.add(o);
      return () => ouvintes.delete(o);
    },
    () => {
      carregar();
      return estado;
    },
    () => estadoServidor,
  );
}

export function lerEstado(): Estado {
  carregar();
  return estado;
}

const novoId = () => Math.random().toString(36).slice(2, 10);
const agora = () => new Date().toISOString();

// ---------- Consultas ----------

export const usuarioAtual = (s: Estado): Usuario | undefined => USUARIOS.find((u) => u.id === s.usuarioId);
export const alunoDoUsuario = (usuarioId: string | null) => ALUNOS.find((a) => a.usuarioId === usuarioId);
export const viagemPorId = (s: Estado, id: string) => s.viagens.find((v) => v.id === id);
export const confirmacoesDa = (s: Estado, viagemId: string) => s.confirmacoes.filter((c) => c.viagemId === viagemId);
export const embarquesDa = (s: Estado, viagemId: string) => s.embarques.filter((e) => e.viagemId === viagemId);
export const confirmacaoDe = (s: Estado, viagemId: string, alunoId: string) =>
  s.confirmacoes.find((c) => c.viagemId === viagemId && c.alunoId === alunoId);
export const embarqueDe = (s: Estado, viagemId: string, alunoId: string) =>
  s.embarques.find((e) => e.viagemId === viagemId && e.alunoId === alunoId);

export function descricaoViagem(v: Viagem) {
  return `${rotuloDia(v.data)} às ${v.horarioSaida} (${ROTULO_SENTIDO[v.sentido]})`;
}

/** Datas com viagens ainda abertas para confirmação. */
export function datasAbertas(s: Estado): string[] {
  return [...new Set(s.viagens.filter((v) => v.status !== "concluida").map((v) => v.data))];
}

function notificar(usuarioId: string, n: Omit<Notificacao, "id" | "usuarioId" | "criadaEm" | "lida">, lida = false): Notificacao {
  return { id: novoId(), usuarioId, criadaEm: agora(), lida, ...n };
}

const usuarioDoAluno = (alunoId: string) => ALUNOS.find((a) => a.id === alunoId)!.usuarioId;
const usuarioDoResponsavel = (responsavelId: string) => RESPONSAVEIS.find((r) => r.id === responsavelId)!.usuarioId;

// ---------- Ações ----------

export const acoes = {
  entrar(usuarioId: string) {
    atualizar((s) => ({ ...s, usuarioId }));
  },
  sair() {
    atualizar((s) => ({ ...s, usuarioId: null }));
  },

  /** Confirma as viagens da data conforme o trajeto. Retorna as viagens confirmadas. */
  confirmarViagens(alunoId: string, data: string, trajeto: Trajeto, embarqueId: string, desembarqueId: string): Viagem[] {
    carregar();
    const sentidos = sentidosDoTrajeto(trajeto);
    const alvo = estado.viagens.filter((v) => v.data === data && v.status !== "concluida" && sentidos.includes(v.sentido));
    atualizar((s) => {
      let confirmacoes = s.confirmacoes;
      const novas: Notificacao[] = [];
      for (const v of alvo) {
        // Na volta, o trajeto se inverte: embarca onde desembarcou na ida.
        const [emb, des] = trajeto === "ambos" && v.sentido === "volta" ? [desembarqueId, embarqueId] : [embarqueId, desembarqueId];
        confirmacoes = [
          ...confirmacoes.filter((c) => !(c.viagemId === v.id && c.alunoId === alunoId)),
          { id: novoId(), viagemId: v.id, alunoId, pontoEmbarqueId: emb, pontoDesembarqueId: des, criadaEm: agora() },
        ];
        novas.push(
          notificar(usuarioDoAluno(alunoId), {
            viagemId: v.id,
            tipo: "confirmacao",
            titulo: "Viagem confirmada",
            mensagem: `Você confirmou a viagem de ${descricaoViagem(v)}. Embarque: ${nomePonto(emb)}.`,
          }, true),
        );
      }
      return { ...s, confirmacoes, notificacoes: [...novas, ...s.notificacoes] };
    });
    return alvo;
  },

  /** Confirma presença numa viagem usando o ponto padrão do aluno. */
  confirmarPresenca(alunoId: string, viagemId: string) {
    const v = viagemPorId(lerEstado(), viagemId);
    const aluno = ALUNOS.find((a) => a.id === alunoId);
    if (!v || !aluno) return;
    const { pontoEmbarqueId, pontoDesembarqueId } = pontosDoSentido(v.sentido, aluno.pontoPadraoId);
    acoes.confirmarViagens(alunoId, v.data, v.sentido, pontoEmbarqueId, pontoDesembarqueId);
  },

  cancelarConfirmacao(alunoId: string, viagemId: string) {
    atualizar((s) => ({
      ...s,
      confirmacoes: s.confirmacoes.filter((c) => !(c.viagemId === viagemId && c.alunoId === alunoId)),
    }));
  },

  registrarEmbarque(viagemId: string, alunoId: string, metodo: MetodoEmbarque, divergencia = false): "ok" | "duplicado" {
    carregar();
    if (embarqueDe(estado, viagemId, alunoId)) return "duplicado";
    atualizar((s) => {
      const tag = TAGS.find((t) => t.alunoId === alunoId);
      const e: Embarque = {
        id: novoId(), viagemId, alunoId, metodo, tagId: metodo === "nfc" ? tag?.id ?? null : null, horario: agora(),
        ...(divergencia ? { divergencia: true } : {}),
      };
      const v = viagemPorId(s, viagemId)!;
      const n = notificar(usuarioDoAluno(alunoId), {
        viagemId,
        tipo: "embarque",
        titulo: "Embarque registrado",
        mensagem: `Seu embarque às ${hora(e.horario)} no ônibus ${onibusDe(v.onibusId).placa} foi registrado ${
          metodo === "nfc" ? "pela tag NFC" : "manualmente pelo responsável"
        }.`,
      });
      return { ...s, embarques: [e, ...s.embarques], notificacoes: [n, ...s.notificacoes] };
    });
    return "ok";
  },

  /** Simula a leitura da tag do próximo aluno confirmado que ainda não embarcou. */
  simularLeituraNfc(viagemId: string): { alunoId: string; codigo: string } | null {
    const s = lerEstado();
    const v = viagemPorId(s, viagemId);
    if (!v) return null;
    const ordem = (c: Confirmacao) => progressoDoPonto(PONTOS.find((p) => p.id === c.pontoEmbarqueId)!, v.sentido);
    const proximo = confirmadosSemEmbarque(s.confirmacoes, s.embarques, viagemId).sort((a, b) => ordem(a) - ordem(b))[0];
    if (!proximo) return null;
    acoes.registrarEmbarque(viagemId, proximo.alunoId, "nfc");
    return { alunoId: proximo.alunoId, codigo: TAGS.find((t) => t.alunoId === proximo.alunoId)!.codigo };
  },

  /** Leitura de uma tag real (Web NFC no Android). */
  lerTagReal(viagemId: string, serial: string): { resultado: "ok" | "duplicado" | "desconhecida"; alunoId?: string } {
    const tag = encontrarTag(TAGS, serial);
    if (!tag) return { resultado: "desconhecida" };
    return { resultado: acoes.registrarEmbarque(viagemId, tag.alunoId, "nfc"), alunoId: tag.alunoId };
  },

  iniciarViagem(viagemId: string) {
    atualizar((s) => ({ ...s, viagens: s.viagens.map((v) => (v.id === viagemId ? { ...v, status: "em_andamento" as StatusViagem } : v)) }));
  },

  /** Conclui a viagem e avisa quem confirmou e não embarcou. Retorna os ausentes. */
  concluirViagem(viagemId: string): string[] {
    const s0 = lerEstado();
    const v = viagemPorId(s0, viagemId);
    if (!v) return [];
    const ausentes = confirmadosSemEmbarque(s0.confirmacoes, s0.embarques, viagemId).map((c) => c.alunoId);
    atualizar((s) => {
      const avisos = ausentes.flatMap((alunoId) => [
        notificar(usuarioDoAluno(alunoId), {
          viagemId,
          tipo: "alerta",
          titulo: "Embarque não registrado",
          mensagem: `Você confirmou a viagem de ${descricaoViagem(v)}, mas sua tag NFC não foi lida. Procure o responsável pelo transporte.`,
        }),
        notificar(usuarioDoResponsavel(v.responsavelId), {
          viagemId,
          tipo: "alerta",
          titulo: "Confirmou e não embarcou",
          mensagem: `${nomeAluno(alunoId)} confirmou a viagem das ${v.horarioSaida} e não embarcou.`,
        }),
      ]);
      return {
        ...s,
        viagens: s.viagens.map((x) => (x.id === viagemId ? { ...x, status: "concluida" as StatusViagem } : x)),
        notificacoes: [...avisos, ...s.notificacoes],
      };
    });
    return ausentes;
  },

  marcarLidas(usuarioId: string) {
    atualizar((s) => ({ ...s, notificacoes: s.notificacoes.map((n) => (n.usuarioId === usuarioId ? { ...n, lida: true } : n)) }));
  },

  reiniciarDemo() {
    atualizar((s) => semente(s.usuarioId));
  },
};

export type { Sentido };
