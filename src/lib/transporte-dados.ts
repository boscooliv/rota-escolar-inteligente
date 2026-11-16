// Dados de demonstração do protótipo (rota, pontos e estudantes fictícios).

export type Trecho = "ida" | "volta";

export type Ponto = {
  id: string;
  nome: string;
  referencia: string;
  /** Posição do ponto ao longo do trajeto, de 0 (início) a 1 (IFRN). */
  posicao: number;
  horarioIda: string;
  horarioVolta: string;
};

export type Aluno = {
  id: string;
  nome: string;
  matricula: string;
  curso: string;
  tag: string;
};

export type Confirmacao = { ida: boolean; volta: boolean };

export const ROTA = {
  nome: "Rota 02",
  descricao: "Zona rural → IFRN Campus Pau dos Ferros",
  placa: "QGX-4E21",
  motorista: "Sr. Francisco",
  /** Duração estimada do trajeto completo, em minutos. */
  duracaoMin: 40,
};

export const PONTOS: Ponto[] = [
  { id: "p1", nome: "Praça da Matriz", referencia: "Em frente à igreja", posicao: 0, horarioIda: "05:50", horarioVolta: "18:35" },
  { id: "p2", nome: "Posto Santa Luzia", referencia: "Ao lado da borracharia", posicao: 0.22, horarioIda: "05:59", horarioVolta: "18:26" },
  { id: "p3", nome: "Sítio Bom Jesus", referencia: "Entrada da estrada de terra", posicao: 0.45, horarioIda: "06:08", horarioVolta: "18:17" },
  { id: "p4", nome: "Escola Municipal", referencia: "Portão principal", posicao: 0.7, horarioIda: "06:18", horarioVolta: "18:07" },
  { id: "p5", nome: "IFRN – Pau dos Ferros", referencia: "Estacionamento do campus", posicao: 1, horarioIda: "06:30", horarioVolta: "17:55" },
];

export const ALUNO_ATUAL_ID = "a1";

export const ALUNOS: Aluno[] = [
  { id: "a1", nome: "Ana Clara Souza", matricula: "20241094010", curso: "Informática – 2º ano", tag: "04:a2:3f:1b:7c:80:00" },
  { id: "a2", nome: "Pedro Henrique Lima", matricula: "20241094022", curso: "Eletrotécnica – 1º ano", tag: "04:5d:91:e2:3a:11:90" },
  { id: "a3", nome: "Maria Eduarda Rocha", matricula: "20231094007", curso: "Informática – 3º ano", tag: "04:c8:07:6b:52:2f:81" },
  { id: "a4", nome: "João Victor Alves", matricula: "20241094031", curso: "Apicultura – 2º ano", tag: "04:19:aa:4c:d0:73:80" },
  { id: "a5", nome: "Larissa Fernandes", matricula: "20251094002", curso: "Edificações – 1º ano", tag: "04:7e:3b:90:15:c4:81" },
  { id: "a6", nome: "Gabriel Costa", matricula: "20231094019", curso: "Eletrotécnica – 3º ano", tag: "04:e0:62:2d:9f:08:80" },
];

/** Confirmações dos colegas para hoje (a do aluno atual vem do próprio app). */
export const CONFIRMACOES_COLEGAS: Record<string, Confirmacao> = {
  a2: { ida: true, volta: true },
  a3: { ida: true, volta: false },
  a4: { ida: false, volta: true },
  a5: { ida: true, volta: true },
  a6: { ida: false, volta: false },
};
