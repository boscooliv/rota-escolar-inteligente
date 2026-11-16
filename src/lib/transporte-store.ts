import { useSyncExternalStore } from "react";
import {
  ALUNOS,
  ALUNO_ATUAL_ID,
  CONFIRMACOES_COLEGAS,
  PONTOS,
  type Aluno,
  type Confirmacao,
  type Trecho,
} from "./transporte-dados";
import { confirmadosSemEmbarque, jaEmbarcou, type Embarque } from "./transporte-logica";

export type Aviso = {
  id: string;
  tipo: "divergencia" | "embarque" | "confirmacao";
  titulo: string;
  texto: string;
  horario: string;
  lido: boolean;
};

export type EstadoTransporte = {
  data: string;
  confirmacao: Confirmacao;
  confirmadoEm: string | null;
  embarqueId: string;
  desembarqueId: string;
  embarques: Embarque[];
  avisos: Aviso[];
  /** Tags vinculadas manualmente no leitor (serial → aluno). */
  tagsVinculadas: Record<string, string>;
};

const CHAVE = "transporte-nfc-demo-v1";

function hoje() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const estadoInicial: EstadoTransporte = {
  data: "",
  confirmacao: { ida: false, volta: false },
  confirmadoEm: null,
  embarqueId: "p3",
  desembarqueId: "p3",
  embarques: [],
  avisos: [],
  tagsVinculadas: {},
};

let estado: EstadoTransporte = estadoInicial;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const bruto = window.localStorage.getItem(CHAVE);
    const salvo = bruto ? (JSON.parse(bruto) as EstadoTransporte) : null;
    if (salvo) {
      estado = { ...estadoInicial, ...salvo };
      // Confirmações e embarques valem só para o dia.
      if (salvo.data !== hoje()) {
        estado = { ...estado, data: hoje(), confirmacao: { ida: false, volta: false }, confirmadoEm: null, embarques: [] };
      }
    } else {
      estado = { ...estadoInicial, data: hoje() };
    }
  } catch {
    estado = { ...estadoInicial, data: hoje() };
  }
}

function salvar() {
  try {
    window.localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* armazenamento indisponível */
  }
}

function atualizar(fn: (s: EstadoTransporte) => EstadoTransporte) {
  carregar();
  estado = fn(estado);
  salvar();
  ouvintes.forEach((o) => o());
}

function inscrever(o: () => void) {
  ouvintes.add(o);
  return () => ouvintes.delete(o);
}

export function useTransporte(): EstadoTransporte {
  return useSyncExternalStore(
    inscrever,
    () => {
      carregar();
      return estado;
    },
    () => estadoInicial,
  );
}

/** Estado atual fora do React (ex.: dentro do callback de leitura NFC). */
export function lerEstado(): EstadoTransporte {
  carregar();
  return estado;
}

const novoId = () => Math.random().toString(36).slice(2, 10);

export function todasConfirmacoes(s: EstadoTransporte): Record<string, Confirmacao> {
  return { ...CONFIRMACOES_COLEGAS, [ALUNO_ATUAL_ID]: s.confirmacao };
}

export function alunosComTags(s: EstadoTransporte): Aluno[] {
  return ALUNOS.map((a) => {
    const vinculada = Object.entries(s.tagsVinculadas).find(([, id]) => id === a.id);
    return vinculada ? { ...a, tag: vinculada[0] } : a;
  });
}

export function nomePonto(id: string) {
  return PONTOS.find((p) => p.id === id)?.nome ?? "—";
}

export const acoes = {
  confirmar(conf: Confirmacao, embarqueId: string, desembarqueId: string) {
    atualizar((s) => {
      const trechos = [conf.ida && "ida", conf.volta && "volta"].filter(Boolean).join(" e ");
      const aviso: Aviso = {
        id: novoId(),
        tipo: "confirmacao",
        titulo: trechos ? "Viagem confirmada" : "Confirmação cancelada",
        texto: trechos
          ? `Você confirmou ${trechos} para hoje. Embarque: ${nomePonto(embarqueId)}.`
          : "Você informou que não usará o transporte hoje.",
        horario: new Date().toISOString(),
        lido: true,
      };
      return {
        ...s,
        confirmacao: conf,
        confirmadoEm: trechos ? new Date().toISOString() : null,
        embarqueId,
        desembarqueId,
        avisos: [aviso, ...s.avisos],
      };
    });
  },

  registrarEmbarque(alunoId: string, trecho: Trecho, metodo: "nfc" | "manual"): "ok" | "duplicado" {
    carregar();
    if (jaEmbarcou(estado.embarques, alunoId, trecho)) return "duplicado";
    atualizar((s) => {
      const embarque: Embarque = { id: novoId(), alunoId, trecho, metodo, horario: new Date().toISOString() };
      const avisos =
        alunoId === ALUNO_ATUAL_ID
          ? [
              {
                id: novoId(),
                tipo: "embarque" as const,
                titulo: "Embarque registrado",
                texto: `Sua ${trecho} foi registrada ${metodo === "nfc" ? "pela tag NFC" : "manualmente pelo motorista"}.`,
                horario: embarque.horario,
                lido: false,
              },
              ...s.avisos,
            ]
          : s.avisos;
      return { ...s, embarques: [embarque, ...s.embarques], avisos };
    });
    return "ok";
  },

  removerEmbarque(id: string) {
    atualizar((s) => ({ ...s, embarques: s.embarques.filter((e) => e.id !== id) }));
  },

  vincularTag(serial: string, alunoId: string) {
    atualizar((s) => {
      const tags = Object.fromEntries(Object.entries(s.tagsVinculadas).filter(([, id]) => id !== alunoId));
      return { ...s, tagsVinculadas: { ...tags, [serial]: alunoId } };
    });
  },

  /** Encerra o embarque do trecho e gera avisos de divergência. Retorna os ausentes. */
  encerrarEmbarque(trecho: Trecho): Aluno[] {
    carregar();
    const ausentes = confirmadosSemEmbarque(ALUNOS, todasConfirmacoes(estado), estado.embarques, trecho);
    const voceAusente = ausentes.some((a) => a.id === ALUNO_ATUAL_ID);
    if (voceAusente) {
      atualizar((s) => ({
        ...s,
        avisos: [
          {
            id: novoId(),
            tipo: "divergencia",
            titulo: "Embarque não registrado",
            texto: `Você confirmou a ${trecho}, mas sua tag NFC não foi lida. Procure o motorista ou o responsável pelo transporte.`,
            horario: new Date().toISOString(),
            lido: false,
          },
          ...s.avisos,
        ],
      }));
    }
    return ausentes;
  },

  marcarAvisosLidos() {
    atualizar((s) => ({ ...s, avisos: s.avisos.map((a) => ({ ...a, lido: true })) }));
  },

  reiniciarDemo() {
    atualizar(() => ({ ...estadoInicial, data: hoje() }));
  },
};
