// Dados fictícios (mock) do protótipo, seguindo o modelo de dados do sistema:
// Usuario, Aluno, Responsavel, TagNFC, Onibus, PontoParada, Viagem,
// Confirmacao, Embarque, Localizacao e Notificacao.

export type Perfil = "aluno" | "responsavel";
export type Sentido = "ida" | "volta"; // ida = Cidade → IFRN · volta = IFRN → Cidade
export type StatusViagem = "agendada" | "em_andamento" | "concluida";
export type MetodoEmbarque = "nfc" | "manual";
export type Trajeto = "ida" | "volta" | "ambos";

export type Usuario = { id: string; nome: string; email: string; perfil: Perfil };
export type Aluno = { id: string; usuarioId: string; matricula: string; curso: string; cidade: string; pontoPadraoId: string };
export type Responsavel = { id: string; usuarioId: string; cargo: string; telefone: string };
export type TagNFC = { id: string; alunoId: string; codigo: string; ativa: boolean };
export type Onibus = { id: string; placa: string; modelo: string; capacidade: number; motorista: string };
export type PontoParada = {
  id: string;
  nome: string;
  cidade: string;
  referencia: string;
  /** Posição ao longo do trajeto Cidade → IFRN, de 0 (início) a 1 (IFRN). */
  posicao: number;
  rotulo: string;
};
export type Viagem = {
  id: string;
  data: string; // AAAA-MM-DD
  horarioSaida: string; // HH:MM
  sentido: Sentido;
  onibusId: string;
  responsavelId: string;
  status: StatusViagem;
};
export type Confirmacao = {
  id: string;
  viagemId: string;
  alunoId: string;
  pontoEmbarqueId: string;
  pontoDesembarqueId: string;
  criadaEm: string;
};
export type Embarque = {
  id: string;
  viagemId: string;
  alunoId: string;
  tagId: string | null;
  metodo: MetodoEmbarque;
  horario: string;
  /** Embarcou sem ter confirmado a viagem. */
  divergencia?: boolean;
};
export type Localizacao = { id: string; viagemId: string; latitude: number; longitude: number; registradaEm: string };
export type Notificacao = {
  id: string;
  usuarioId: string;
  viagemId: string | null;
  tipo: "confirmacao" | "embarque" | "alerta" | "info";
  titulo: string;
  mensagem: string;
  criadaEm: string;
  lida: boolean;
};

/** Duração estimada do trajeto completo, em minutos. */
export const DURACAO_MIN = 45;

export const USUARIOS: Usuario[] = [
  { id: "u1", nome: "Larissa Moura Fernandes", email: "larissa.moura@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u2", nome: "João Victor Alves", email: "joao.alves@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u3", nome: "Maria Eduarda Rocha", email: "maria.rocha@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u4", nome: "Pedro Henrique Lima", email: "pedro.lima@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u5", nome: "Ana Beatriz Costa", email: "ana.costa@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u6", nome: "Gabriel Nunes Diógenes", email: "gabriel.nunes@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u7", nome: "Yasmin Vitória Souza", email: "yasmin.souza@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u8", nome: "Kauã Batista Nascimento", email: "kaua.nascimento@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u9", nome: "Letícia Araújo Pinto", email: "leticia.araujo@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u10", nome: "Rafael Queiroz Melo", email: "rafael.queiroz@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u13", nome: "Clara Fernandes Lima", email: "clara.lima@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u14", nome: "Davi Rodrigues Paiva", email: "davi.paiva@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u15", nome: "Isabela Freitas Dantas", email: "isabela.dantas@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u16", nome: "Lucas Emanuel Silva", email: "lucas.silva@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u17", nome: "Sofia Holanda Reis", email: "sofia.reis@escolar.ifrn.edu.br", perfil: "aluno" },
  { id: "u11", nome: "Francisco Diógenes", email: "francisco.diogenes@transporte.rn.gov.br", perfil: "responsavel" },
  { id: "u12", nome: "Antônia Maria Rêgo", email: "antonia.rego@transporte.rn.gov.br", perfil: "responsavel" },
];

export const PONTOS: PontoParada[] = [
  { id: "p1", nome: "Praça Central", cidade: "Encanto", referencia: "Em frente à igreja matriz", posicao: 0, rotulo: "Encanto" },
  { id: "p2", nome: "Rodoviária", cidade: "São Miguel", referencia: "Plataforma de embarque", posicao: 0.22, rotulo: "São Miguel" },
  { id: "p3", nome: "Praça da Matriz", cidade: "Alexandria", referencia: "Ao lado do coreto", posicao: 0.44, rotulo: "Alexandria" },
  { id: "p4", nome: "Rodoviária", cidade: "Pau dos Ferros", referencia: "Portão lateral", posicao: 0.66, rotulo: "Rodoviária" },
  { id: "p5", nome: "Praça da Matriz", cidade: "Pau dos Ferros", referencia: "Em frente ao banco", posicao: 0.83, rotulo: "Centro" },
  { id: "p6", nome: "Portaria do IFRN", cidade: "Pau dos Ferros", referencia: "Campus Pau dos Ferros", posicao: 1, rotulo: "IFRN" },
];
export const PONTO_IFRN_ID = "p6";

export const ALUNOS: Aluno[] = [
  { id: "a1", usuarioId: "u1", matricula: "20241094010", curso: "Informática – 2º ano", cidade: "Pau dos Ferros", pontoPadraoId: "p4" },
  { id: "a2", usuarioId: "u2", matricula: "20241094022", curso: "Apicultura – 2º ano", cidade: "Encanto", pontoPadraoId: "p1" },
  { id: "a3", usuarioId: "u3", matricula: "20231094007", curso: "Informática – 3º ano", cidade: "São Miguel", pontoPadraoId: "p2" },
  { id: "a4", usuarioId: "u4", matricula: "20241094031", curso: "Eletrotécnica – 1º ano", cidade: "Alexandria", pontoPadraoId: "p3" },
  { id: "a5", usuarioId: "u5", matricula: "20251094002", curso: "Edificações – 1º ano", cidade: "Pau dos Ferros", pontoPadraoId: "p5" },
  { id: "a6", usuarioId: "u6", matricula: "20231094019", curso: "Eletrotécnica – 3º ano", cidade: "Encanto", pontoPadraoId: "p1" },
  { id: "a7", usuarioId: "u7", matricula: "20241094045", curso: "Informática – 2º ano", cidade: "São Miguel", pontoPadraoId: "p2" },
  { id: "a8", usuarioId: "u8", matricula: "20251094013", curso: "Apicultura – 1º ano", cidade: "Alexandria", pontoPadraoId: "p3" },
  { id: "a9", usuarioId: "u9", matricula: "20231094028", curso: "Edificações – 3º ano", cidade: "Pau dos Ferros", pontoPadraoId: "p4" },
  { id: "a10", usuarioId: "u10", matricula: "20241094057", curso: "Eletrotécnica – 2º ano", cidade: "São Miguel", pontoPadraoId: "p2" },
  { id: "a11", usuarioId: "u13", matricula: "20251094021", curso: "Informática – 1º ano", cidade: "Encanto", pontoPadraoId: "p1" },
  { id: "a12", usuarioId: "u14", matricula: "20241094063", curso: "Edificações – 2º ano", cidade: "Alexandria", pontoPadraoId: "p3" },
  { id: "a13", usuarioId: "u15", matricula: "20231094034", curso: "Apicultura – 3º ano", cidade: "Pau dos Ferros", pontoPadraoId: "p4" },
  { id: "a14", usuarioId: "u16", matricula: "20251094038", curso: "Eletrotécnica – 1º ano", cidade: "São Miguel", pontoPadraoId: "p2" },
  { id: "a15", usuarioId: "u17", matricula: "20241094070", curso: "Informática – 2º ano", cidade: "Pau dos Ferros", pontoPadraoId: "p5" },
];

export const RESPONSAVEIS: Responsavel[] = [
  { id: "r1", usuarioId: "u11", cargo: "Responsável pelo transporte", telefone: "(84) 99999-0101" },
  { id: "r2", usuarioId: "u12", cargo: "Coordenadora do transporte", telefone: "(84) 99999-0202" },
];

export const TAGS: TagNFC[] = ALUNOS.map((a, i) => ({
  id: `t${i + 1}`,
  alunoId: a.id,
  codigo: ["04:a2:3f:1b:7c:80:00", "04:5d:91:e2:3a:11:90", "04:c8:07:6b:52:2f:81", "04:19:aa:4c:d0:73:80", "04:7e:3b:90:15:c4:81",
    "04:e0:62:2d:9f:08:80", "04:3c:d4:71:a8:5e:90", "04:91:0f:c2:66:b7:81", "04:28:e5:5a:13:9d:80", "04:b6:7a:08:f4:21:90",
    "04:11:2c:9e:40:d5:80", "04:62:f1:07:bb:3a:81", "04:a9:5e:c3:28:16:90", "04:d7:84:1f:6c:e2:80", "04:3f:b0:95:71:0c:81"][i]!,
  ativa: true,
})).concat([
  // Tag antiga do João Victor, bloqueada após ser perdida (para testar o aviso de tag bloqueada).
  { id: "t-bloq", alunoId: "a2", codigo: "04:de:ad:be:ef:00:01", ativa: false },
]);

/** Códigos para testar a tela de Embarque sem tags físicas. */
export const TAGS_DE_TESTE = [
  { rotulo: "Válida (Maria Eduarda)", codigo: "04:c8:07:6b:52:2f:81" },
  { rotulo: "Sem confirmação (Kauã)", codigo: "04:91:0f:c2:66:b7:81" },
  { rotulo: "Bloqueada", codigo: "04:de:ad:be:ef:00:01" },
  { rotulo: "Inexistente", codigo: "04:ff:ff:ff:ff:ff:ff" },
];

export const ONIBUS: Onibus[] = [
  { id: "o1", placa: "QGX-4E21", modelo: "Volare W9", capacidade: 32, motorista: "Sr. Francisco" },
  { id: "o2", placa: "RNP-2B87", modelo: "Marcopolo Torino", capacidade: 44, motorista: "Sr. Raimundo" },
  { id: "o3", placa: "OJK-7C15", modelo: "Mercedes OF-1519", capacidade: 48, motorista: "Sr. Edvaldo" },
];

// ---------- Datas relativas a hoje (as viagens são sempre ontem, hoje e amanhã) ----------

export function dataISO(deslocamentoDias = 0, base = new Date()): string {
  const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + deslocamentoDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dataHora(data: string, hora: string, mais = 0): string {
  const [a, m, d] = data.split("-").map(Number);
  const [h, min] = hora.split(":").map(Number);
  return new Date(a!, m! - 1, d!, h!, min! + mais).toISOString();
}

export function gerarViagens(base = new Date()): Viagem[] {
  const ontem = dataISO(-1, base), hoje = dataISO(0, base), amanha = dataISO(1, base);
  return [
    { id: "v1", data: ontem, horarioSaida: "06:30", sentido: "ida", onibusId: "o1", responsavelId: "r1", status: "concluida" },
    { id: "v2", data: ontem, horarioSaida: "17:30", sentido: "volta", onibusId: "o1", responsavelId: "r1", status: "concluida" },
    { id: "v3", data: hoje, horarioSaida: "06:30", sentido: "ida", onibusId: "o1", responsavelId: "r1", status: "em_andamento" },
    { id: "v4", data: hoje, horarioSaida: "17:30", sentido: "volta", onibusId: "o2", responsavelId: "r2", status: "agendada" },
    { id: "v5", data: amanha, horarioSaida: "06:30", sentido: "ida", onibusId: "o3", responsavelId: "r1", status: "agendada" },
    { id: "v6", data: amanha, horarioSaida: "17:30", sentido: "volta", onibusId: "o2", responsavelId: "r2", status: "agendada" },
  ];
}

/** Ponto de desembarque/embarque "do outro lado" do trajeto. */
export function pontosDoSentido(sentido: Sentido, pontoCidadeId: string) {
  return sentido === "ida"
    ? { pontoEmbarqueId: pontoCidadeId, pontoDesembarqueId: PONTO_IFRN_ID }
    : { pontoEmbarqueId: PONTO_IFRN_ID, pontoDesembarqueId: pontoCidadeId };
}

const alunoPorId = (id: string) => ALUNOS.find((a) => a.id === id)!;

export function gerarSementes(viagens: Viagem[]) {
  const v = Object.fromEntries(viagens.map((x) => [x.id, x]));
  const confirmacoes: Confirmacao[] = [];
  const embarques: Embarque[] = [];
  const conf = (viagemId: string, alunoIds: string[]) => {
    const viagem = v[viagemId]!;
    for (const alunoId of alunoIds) {
      confirmacoes.push({
        id: `c-${viagemId}-${alunoId}`,
        viagemId,
        alunoId,
        ...pontosDoSentido(viagem.sentido, alunoPorId(alunoId).pontoPadraoId),
        criadaEm: dataHora(viagem.data, "05:00", -600),
      });
    }
  };
  const emb = (viagemId: string, alunoIds: string[], metodo: MetodoEmbarque = "nfc") => {
    const viagem = v[viagemId]!;
    for (const alunoId of alunoIds) {
      const ponto = PONTOS.find((p) => p.id === alunoPorId(alunoId).pontoPadraoId)!;
      const prog = viagem.sentido === "ida" ? ponto.posicao : 1 - ponto.posicao;
      embarques.push({
        id: `e-${viagemId}-${alunoId}`,
        viagemId,
        alunoId,
        tagId: metodo === "nfc" ? TAGS.find((t) => t.alunoId === alunoId)!.id : null,
        metodo,
        horario: dataHora(viagem.data, viagem.horarioSaida, Math.round(prog * DURACAO_MIN)),
      });
    }
  };

  conf("v1", ["a1", "a2", "a3", "a4", "a5", "a7", "a9"]);
  emb("v1", ["a1", "a2", "a3", "a7", "a9"]);
  emb("v1", ["a5"], "manual");
  conf("v2", ["a1", "a2", "a3", "a5", "a7"]);
  emb("v2", ["a1", "a2", "a3", "a5"]);
  conf("v3", ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a9", "a11", "a12", "a13", "a14", "a15"]);
  emb("v3", ["a6", "a7"]);
  emb("v3", ["a4"], "manual");
  conf("v4", ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a9", "a10", "a11", "a12", "a13", "a14", "a15"]);
  conf("v5", ["a1", "a4", "a6"]);
  conf("v6", ["a1", "a8"]);

  const v1 = v["v1"]!, v3 = v["v3"]!;
  const notificacoes: Notificacao[] = [
    { id: "n1", usuarioId: "u11", viagemId: "v3", tipo: "alerta", titulo: "Confirmou e não embarcou",
      mensagem: "João Victor Alves confirmou a viagem das 06:30 mas ainda não embarcou.", criadaEm: dataHora(v3.data, "06:33"), lida: false },
    { id: "n2", usuarioId: "u11", viagemId: "v3", tipo: "embarque", titulo: "Embarque manual registrado",
      mensagem: "Pedro Henrique Lima esqueceu a tag e teve o embarque registrado manualmente.", criadaEm: dataHora(v3.data, "06:50"), lida: false },
    { id: "n3", usuarioId: "u11", viagemId: "v1", tipo: "alerta", titulo: "Confirmou e não embarcou",
      mensagem: "Pedro Henrique Lima confirmou a viagem de ontem às 06:30 e não embarcou.", criadaEm: dataHora(v1.data, "07:20"), lida: true },
    { id: "n4", usuarioId: "u1", viagemId: "v3", tipo: "info", titulo: "Ônibus a caminho",
      mensagem: "O ônibus QGX-4E21 saiu às 06:30 de Encanto e está indo para o seu ponto (Rodoviária – Pau dos Ferros).", criadaEm: dataHora(v3.data, "06:31"), lida: false },
    { id: "n5", usuarioId: "u1", viagemId: "v5", tipo: "confirmacao", titulo: "Viagem confirmada",
      mensagem: "Você confirmou a viagem de amanhã às 06:30 (Cidade → IFRN).", criadaEm: dataHora(v3.data, "06:00", -720), lida: true },
    { id: "n6", usuarioId: "u1", viagemId: "v1", tipo: "embarque", titulo: "Embarque registrado",
      mensagem: "Sua tag NFC foi lida às 07:00 na viagem de ontem (Cidade → IFRN).", criadaEm: dataHora(v1.data, "07:00"), lida: true },
  ];
  return { confirmacoes, embarques, notificacoes };
}

export const ROTULO_SENTIDO: Record<Sentido, string> = { ida: "Cidade → IFRN", volta: "IFRN → Cidade" };
export const ROTULO_STATUS: Record<StatusViagem, string> = { agendada: "Agendada", em_andamento: "Em andamento", concluida: "Concluída" };
export const ROTULO_TRAJETO: Record<Trajeto, string> = { ida: "Ir ao IFRN", volta: "Voltar para a cidade", ambos: "Ambos" };

export const nomeUsuario = (usuarioId: string) => USUARIOS.find((u) => u.id === usuarioId)?.nome ?? "—";
export const nomeAluno = (alunoId: string) => nomeUsuario(ALUNOS.find((a) => a.id === alunoId)?.usuarioId ?? "");
export const ponto = (id: string) => PONTOS.find((p) => p.id === id);
export const nomePonto = (id: string) => {
  const p = ponto(id);
  return p ? `${p.nome} – ${p.cidade}` : "—";
};
export const onibusDe = (id: string) => ONIBUS.find((o) => o.id === id)!;

export function formatarData(data: string, opcoes: Intl.DateTimeFormatOptions = { weekday: "short", day: "2-digit", month: "2-digit" }) {
  const [a, m, d] = data.split("-").map(Number);
  return new Date(a!, m! - 1, d!).toLocaleDateString("pt-BR", opcoes);
}

export function rotuloDia(data: string, base = new Date()) {
  if (data === dataISO(0, base)) return "Hoje";
  if (data === dataISO(-1, base)) return "Ontem";
  if (data === dataISO(1, base)) return "Amanhã";
  return formatarData(data);
}

export const hora = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
