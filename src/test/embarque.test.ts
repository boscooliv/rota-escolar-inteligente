import { describe, expect, it } from "vitest";
import { avaliarLeitura, viagemMaisProxima } from "@/lib/transporte-logica";
import type { Confirmacao, Embarque, TagNFC } from "@/lib/transporte-dados";

const tags: TagNFC[] = [
  { id: "t1", alunoId: "a1", codigo: "04:aa", ativa: true },
  { id: "t2", alunoId: "a2", codigo: "04:bb", ativa: true },
  { id: "tx", alunoId: "a3", codigo: "04:cc", ativa: false },
];
const conf = [{ viagemId: "v", alunoId: "a1" }] as Confirmacao[];
const emb = [{ viagemId: "v", alunoId: "a9" }] as Embarque[];

describe("avaliarLeitura", () => {
  it("tag inexistente", () => expect(avaliarLeitura(tags, conf, emb, "v", "04:ff").tipo).toBe("nao_encontrada"));
  it("tag bloqueada", () => expect(avaliarLeitura(tags, conf, emb, "v", "04:CC").tipo).toBe("bloqueada"));
  it("sem confirmação", () => expect(avaliarLeitura(tags, conf, emb, "v", "04bb").tipo).toBe("sem_confirmacao"));
  it("válida", () => expect(avaliarLeitura(tags, conf, emb, "v", "04:aa")).toEqual({ tipo: "ok", alunoId: "a1", tagId: "t1" }));
  it("já embarcou", () => {
    const e = [{ viagemId: "v", alunoId: "a1" }] as Embarque[];
    expect(avaliarLeitura(tags, conf, e, "v", "04:aa").tipo).toBe("ja_embarcou");
  });
});

it("viagem mais próxima do horário atual", () => {
  const vs = [{ horarioSaida: "06:30" }, { horarioSaida: "17:30" }];
  expect(viagemMaisProxima(vs, new Date(2026, 0, 1, 15, 0))?.horarioSaida).toBe("17:30");
  expect(viagemMaisProxima(vs, new Date(2026, 0, 1, 8, 0))?.horarioSaida).toBe("06:30");
});
