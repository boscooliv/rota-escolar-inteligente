import { describe, expect, it } from "vitest";
import type { Confirmacao, Embarque, TagNFC } from "@/lib/transporte-dados";
import {
  confirmadosSemEmbarque,
  encontrarTag,
  minutosAtePonto,
  progressoDoPonto,
  sentidosDoTrajeto,
  situacaoPassageiro,
  validarConfirmacao,
  validarLogin,
} from "@/lib/transporte-logica";

const tags: TagNFC[] = [
  { id: "t1", alunoId: "a", codigo: "04:A2:3F:1B", ativa: true },
  { id: "t2", alunoId: "b", codigo: "04:11:22:33", ativa: false },
];

describe("situação do passageiro", () => {
  it("embarque registrado aparece como 'Embarcou'", () => {
    expect(situacaoPassageiro(true, "em_andamento", 0.9, 0.2)).toBe("embarcou");
  });
  it("viagem concluída sem embarque vira 'Confirmou e não embarcou'", () => {
    expect(situacaoPassageiro(false, "concluida", 1, 0.2)).toBe("nao_embarcou");
  });
  it("ônibus já passou do ponto sem embarque vira alerta", () => {
    expect(situacaoPassageiro(false, "em_andamento", 0.5, 0.22)).toBe("nao_embarcou");
  });
  it("ônibus ainda não chegou ao ponto: continua 'Confirmado'", () => {
    expect(situacaoPassageiro(false, "em_andamento", 0.1, 0.22)).toBe("confirmado");
  });
  it("viagem agendada: continua 'Confirmado'", () => {
    expect(situacaoPassageiro(false, "agendada", 0, 0)).toBe("confirmado");
  });
});

describe("confirmou e não embarcou", () => {
  const c = (alunoId: string, viagemId = "v1"): Confirmacao => ({ id: alunoId, viagemId, alunoId, pontoEmbarqueId: "p1", pontoDesembarqueId: "p6", criadaEm: "" });
  const e = (alunoId: string, viagemId = "v1"): Embarque => ({ id: alunoId, viagemId, alunoId, tagId: null, metodo: "nfc", horario: "" });
  it("lista só quem confirmou a viagem e não teve embarque nela", () => {
    const r = confirmadosSemEmbarque([c("a"), c("b"), c("c", "v2")], [e("a"), e("b", "v2")], "v1");
    expect(r.map((x) => x.alunoId)).toEqual(["b"]);
  });
});

describe("tags NFC", () => {
  it("reconhece a tag independentemente de maiúsculas e separadores", () => {
    expect(encontrarTag(tags, "04a23f1b")?.alunoId).toBe("a");
  });
  it("ignora tag desativada", () => {
    expect(encontrarTag(tags, "04:11:22:33")).toBeUndefined();
  });
});

describe("previsão de chegada", () => {
  it("na volta o ponto da cidade fica no fim do trajeto", () => {
    expect(progressoDoPonto({ posicao: 0.22 }, "volta")).toBeCloseTo(0.78);
  });
  it("calcula minutos pela fração restante do trajeto de 45 min", () => {
    expect(minutosAtePonto(0.2, 0.44, 45)).toBe(11);
  });
  it("retorna 0 quando o ônibus já passou", () => {
    expect(minutosAtePonto(0.6, 0.44, 45)).toBe(0);
  });
});

describe("formulário de confirmação", () => {
  const ok = { data: "2026-11-18", trajeto: "ida" as const, embarqueId: "p1", desembarqueId: "p6" };
  it("aceita formulário completo", () => {
    expect(validarConfirmacao(ok, ["2026-11-18"])).toEqual({});
  });
  it("exige data, trajeto e os dois pontos", () => {
    const r = validarConfirmacao({ data: "", trajeto: "", embarqueId: "", desembarqueId: "" }, ["2026-11-18"]);
    expect(Object.keys(r).sort()).toEqual(["data", "desembarqueId", "embarqueId", "trajeto"]);
  });
  it("não deixa embarcar e desembarcar no mesmo ponto", () => {
    expect(validarConfirmacao({ ...ok, desembarqueId: "p1" }, ["2026-11-18"]).desembarqueId).toBeDefined();
  });
  it("recusa data sem viagem aberta", () => {
    expect(validarConfirmacao(ok, ["2026-11-19"]).data).toBeDefined();
  });
  it("'Ambos' confirma ida e volta", () => {
    expect(sentidosDoTrajeto("ambos")).toEqual(["ida", "volta"]);
  });
});

describe("login", () => {
  it("exige e-mail válido e senha com 4+ caracteres", () => {
    expect(validarLogin("abc", "12")).toEqual({ email: "E-mail inválido.", senha: "A senha precisa ter pelo menos 4 caracteres." });
    expect(validarLogin("a@b.com", "1234")).toEqual({});
  });
});
