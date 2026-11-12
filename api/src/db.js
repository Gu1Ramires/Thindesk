import { DatabaseSync } from 'node:sqlite';

const schema = `
CREATE TABLE IF NOT EXISTS unidades (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS tecnicos (
  id INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS chamados (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  unidade_id INTEGER NOT NULL REFERENCES unidades(id),
  tecnico_id INTEGER REFERENCES tecnicos(id),
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta')),
  status TEXT NOT NULL CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado', 'cancelado')),
  aberto_em TEXT NOT NULL,
  prazo_em TEXT NOT NULL,
  resolvido_em TEXT
);
CREATE TABLE IF NOT EXISTS consideracoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chamado_id INTEGER NOT NULL REFERENCES chamados(id),
  autor TEXT NOT NULL,
  texto TEXT NOT NULL,
  criado_em TEXT NOT NULL
);
`;

export const SLA = { alta: 8, media: 24, baixa: 48 };

const unidades = ['Centro', 'Braz Cubas', 'Suzano', 'Guarulhos', 'Tatuapé'];
const tecnicos = ['Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Rocha'];
const categorias = {
  'PDV / Caixa': ['PDV travando ao fechar venda', 'Maquininha não conecta'],
  'Impressora de pedidos': ['Impressora da cozinha não imprime', 'Comanda saindo cortada'],
  'Aplicativo de delivery': ['Pedidos do iFood não chegam', 'Cardápio desatualizado no app'],
  'Rede e internet': ['Internet caiu na loja', 'Wi-Fi instável no caixa'],
  'Equipamentos de cozinha': ['Forno não esquenta', 'Freezer com temperatura alta'],
  'Acesso e senhas': ['Senha do caixa bloqueada', 'Funcionário novo sem acesso'],
};
const solucoes = ['Equipamento reiniciado e testado.', 'Cabo trocado.', 'Configuração corrigida.', 'Peça substituída.', 'Senha redefinida.', 'Integração reconfigurada.'];

export function formatar(data) {
  const p = (n) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())} ${p(data.getHours())}:${p(data.getMinutes())}:00`;
}

export function agora() {
  return formatar(new Date());
}

function somarHoras(data, horas) {
  return new Date(data.getTime() + horas * 3600000);
}

function popular(db, hoje) {
  let semente = 7;
  const aleatorio = () => (semente = (semente * 16807) % 2147483647) / 2147483647;
  const sortear = (lista) => lista[Math.floor(aleatorio() * lista.length)];

  db.exec('BEGIN');
  unidades.forEach((nome) => db.prepare('INSERT INTO unidades (nome) VALUES (?)').run(nome));
  tecnicos.forEach((nome) => db.prepare('INSERT INTO tecnicos (nome) VALUES (?)').run(nome));
  Object.keys(categorias).forEach((nome) => db.prepare('INSERT INTO categorias (nome) VALUES (?)').run(nome));

  const inserir = db.prepare(`INSERT INTO chamados
    (titulo, categoria_id, unidade_id, tecnico_id, prioridade, status, aberto_em, prazo_em, resolvido_em)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const anotar = db.prepare('INSERT INTO consideracoes (chamado_id, autor, texto, criado_em) VALUES (?, ?, ?, ?)');

  const datas = [];
  for (let i = 0; i < 480; i++) {
    const dias = Math.pow(aleatorio(), 1.4) * 120;
    const data = new Date(hoje.getTime() - dias * 86400000);
    data.setHours(10 + Math.floor(aleatorio() * 13), Math.floor(aleatorio() * 60), 0, 0);
    if (data < hoje) datas.push(data);
  }
  datas.sort((a, b) => a - b);

  for (const aberto of datas) {
    const categoria = 1 + Math.floor(Math.pow(aleatorio(), 1.5) * 6);
    const titulo = sortear(Object.values(categorias)[categoria - 1]);
    const prioridade = sortear(['baixa', 'media', 'media', 'alta']);
    const tecnico = 1 + Math.floor(aleatorio() * tecnicos.length);
    const prazo = somarHoras(aberto, SLA[prioridade]);
    const resolvido = somarHoras(aberto, SLA[prioridade] * (0.2 + aleatorio() * 1.1));
    const idade = (hoje - aberto) / 86400000;

    let status = 'fechado';
    if (aleatorio() < 0.04) status = 'cancelado';
    else if (resolvido > hoje || (idade < 12 && aleatorio() < 0.3)) status = aleatorio() < 0.4 ? 'aberto' : 'em_andamento';
    else if (idade < 3) status = 'resolvido';

    const temSolucao = status === 'resolvido' || status === 'fechado';
    const id = inserir.run(
      titulo,
      categoria,
      1 + Math.floor(aleatorio() * unidades.length),
      status === 'aberto' ? null : tecnico,
      prioridade,
      status,
      formatar(aberto),
      formatar(prazo),
      temSolucao ? formatar(resolvido) : null
    ).lastInsertRowid;

    if (temSolucao) anotar.run(id, tecnicos[tecnico - 1], sortear(solucoes), formatar(resolvido));
  }
  db.exec('COMMIT');
}

export function abrirBanco(arquivo, hoje = new Date()) {
  const db = new DatabaseSync(arquivo);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(schema);
  if (db.prepare('SELECT COUNT(*) AS n FROM chamados').get().n === 0) popular(db, hoje);
  return db;
}
