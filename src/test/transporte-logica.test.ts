import { describe, expect, it } from "vitest";
import type { Aluno, Confirmacao } from "@/lib/transporte-dados";
import {
  confirmadosSemEmbarque,
  embarcadosSemConfirmacao,
  encontrarAlunoPorTag,
  minutosAtePonto,
  type Embarque,
} from "@/lib/transporte-logica";

const alunos: Aluno[] = [
  { id: "a", nome: "Ana", matricula: "1", curso: "", tag: "04:A2:3F:1B" },
  { id: "b", nome: "Bia", matricula: "2", curso: "", tag: "04:11:22:33" },
  { id: "c", nome: "Caio", matricula: "3", curso: "", tag: "04:44:55:66" },
];
const conf: Record<string, Confirmacao> = {
  a: { ida: true, volta: true },
  b: { ida: true, volta: false },
  c: { ida: false, volta: false },
};
const emb = (alunoId: string, trecho: "ida" | "volta"): Embarque => ({
  id: alunoId + trecho, alunoId, trecho, horario: "", metodo: "nfc",
});

describe("divergências de embarque", () => {
  it("aponta quem confirmou a ida mas não teve a tag lida", () => {
    const r = confirmadosSemEmbarque(alunos, conf, [emb("a", "ida")], "ida");
    expect(r.map((a) => a.id)).toEqual(["b"]);
  });

  it("embarque na ida não conta para a volta", () => {
    const r = confirmadosSemEmbarque(alunos, conf, [emb("a", "ida")], "volta");
    expect(r.map((a) => a.id)).toEqual(["a"]);
  });

  it("aponta quem embarcou sem ter confirmado", () => {
    const r = embarcadosSemConfirmacao(alunos, conf, [emb("c", "ida")], "ida");
    expect(r.map((a) => a.id)).toEqual(["c"]);
  });
});

describe("identificação por tag NFC", () => {
  it("reconhece a tag independentemente de maiúsculas e separadores", () => {
    expect(encontrarAlunoPorTag(alunos, "04a23f1b")?.id).toBe("a");
  });

  it("não reconhece tag desconhecida", () => {
    expect(encontrarAlunoPorTag(alunos, "99:99:99:99")).toBeUndefined();
  });
});

describe("tempo até o ponto", () => {
  it("calcula minutos pela fração restante da rota", () => {
    expect(minutosAtePonto(0.2, 0.45, 40)).toBe(10);
  });

  it("retorna 0 quando o ônibus já passou", () => {
    expect(minutosAtePonto(0.6, 0.45, 40)).toBe(0);
  });
});
