import { Router } from 'express';
import { lerFiltros, ErroApi } from '../filtros.js';
import { agora, formatar, SLA } from '../db.js';

const proximos = {
  aberto: ['em_andamento', 'cancelado'],
  em_andamento: ['resolvido', 'cancelado'],
  resolvido: ['fechado', 'em_andamento'],
  fechado: [],
  cancelado: [],
};

const consulta = `
  SELECT c.*, cat.nome AS categoria, u.nome AS unidade, t.nome AS tecnico
  FROM chamados c
  JOIN categorias cat ON cat.id = c.categoria_id
  JOIN unidades u ON u.id = c.unidade_id
  LEFT JOIN tecnicos t ON t.id = c.tecnico_id
`;

export function rotasChamados(db) {
  const rotas = Router();

  const buscar = (id) => {
    if (!/^\d+$/.test(id)) throw new ErroApi(400, 'Id inválido', ['id']);
    const chamado = db.prepare(`${consulta} WHERE c.id = ?`).get(Number(id));
    if (!chamado) throw new ErroApi(404, 'Chamado não encontrado');
    return { ...chamado };
  };

  rotas.get('/', (req, res) => {
    const { where, valores } = lerFiltros(req.query);
    const pagina = Number(req.query.pagina || 1);
    if (!Number.isInteger(pagina) || pagina < 1) throw new ErroApi(400, 'Página inválida', ['pagina']);
    const porPagina = 10;

    const total = db.prepare(`SELECT COUNT(*) AS n FROM chamados c ${where}`).get(...valores).n;
    const dados = db.prepare(`${consulta} ${where} ORDER BY c.aberto_em DESC LIMIT ? OFFSET ?`)
      .all(...valores, porPagina, (pagina - 1) * porPagina);

    res.json({ dados, total, pagina, paginas: Math.max(1, Math.ceil(total / porPagina)) });
  });

  rotas.get('/:id', (req, res) => {
    const chamado = buscar(req.params.id);
    chamado.consideracoes = db.prepare('SELECT * FROM consideracoes WHERE chamado_id = ? ORDER BY criado_em').all(chamado.id);
    res.json(chamado);
  });

  rotas.patch('/:id', (req, res) => {
    const chamado = buscar(req.params.id);
    const { status, tecnico_id, solucao } = req.body || {};

    if (!proximos[status] && status !== undefined) throw new ErroApi(400, 'Status inválido', ['status']);
    if (!status) throw new ErroApi(400, 'Informe o novo status', ['status']);
    if (!proximos[chamado.status].includes(status)) {
      throw new ErroApi(422, `Não é possível mudar de ${chamado.status} para ${status}`);
    }

    const tecnico = tecnico_id ?? chamado.tecnico_id;
    if (status === 'em_andamento' && !tecnico) throw new ErroApi(422, 'Escolha um técnico para iniciar o atendimento');
    if (tecnico_id && !db.prepare('SELECT id FROM tecnicos WHERE id = ?').get(tecnico_id)) {
      throw new ErroApi(400, 'Técnico não existe', ['tecnico_id']);
    }
    if (status === 'resolvido' && (!solucao || solucao.trim().length < 10)) {
      throw new ErroApi(422, 'Descreva a solução com pelo menos 10 caracteres');
    }

    const resolvidoEm = status === 'resolvido' ? agora() : status === 'em_andamento' ? null : chamado.resolvido_em;
    db.prepare('UPDATE chamados SET status = ?, tecnico_id = ?, resolvido_em = ? WHERE id = ?')
      .run(status, tecnico, resolvidoEm, chamado.id);

    if (status === 'resolvido') {
      const nome = db.prepare('SELECT nome FROM tecnicos WHERE id = ?').get(tecnico).nome;
      db.prepare('INSERT INTO consideracoes (chamado_id, autor, texto, criado_em) VALUES (?, ?, ?, ?)')
        .run(chamado.id, nome, solucao.trim(), agora());
    }

    res.json(buscar(req.params.id));
  });

  rotas.post('/:id/consideracoes', (req, res) => {
    const chamado = buscar(req.params.id);
    const { autor, texto } = req.body || {};
    const campos = [];
    if (!autor || !autor.trim()) campos.push('autor');
    if (!texto || texto.trim().length < 5) campos.push('texto');
    if (campos.length) throw new ErroApi(400, 'Preencha autor e texto (mínimo 5 caracteres)', campos);
    if (chamado.status === 'cancelado') throw new ErroApi(422, 'Chamado cancelado não aceita considerações');

    const id = db.prepare('INSERT INTO consideracoes (chamado_id, autor, texto, criado_em) VALUES (?, ?, ?, ?)')
      .run(chamado.id, autor.trim(), texto.trim(), agora()).lastInsertRowid;
    res.status(201).json({ ...db.prepare('SELECT * FROM consideracoes WHERE id = ?').get(id) });
  });

  return rotas;
}

export { SLA, formatar };
