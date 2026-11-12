import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { abrirBanco } from '../src/db.js';
import { criarApp } from '../src/app.js';

const db = abrirBanco(':memory:', new Date(2026, 10, 10, 12));
const app = criarApp(db);
const contar = (sql) => db.prepare(sql).get().n;

describe('Indicadores', () => {
  it('soma em aberto, atendidos e cancelados igual ao total', async () => {
    const res = await request(app).get('/api/indicadores');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(contar('SELECT COUNT(*) AS n FROM chamados'));
    expect(res.body.em_aberto + res.body.atendidos + res.body.cancelados).toBe(res.body.total);
    expect(res.body.sla_percentual).toBeGreaterThan(0);
  });

  it('aplica o filtro de período', async () => {
    const res = await request(app).get('/api/indicadores?data_inicio=2026-10-01&data_fim=2026-10-31');
    expect(res.body.total).toBe(contar("SELECT COUNT(*) AS n FROM chamados WHERE date(aberto_em) BETWEEN '2026-10-01' AND '2026-10-31'"));
  });

  it('retorna zero quando nada é encontrado', async () => {
    const res = await request(app).get('/api/indicadores?data_inicio=2000-01-01&data_fim=2000-01-02');
    expect(res.body).toMatchObject({ total: 0, sla_percentual: null, tempo_medio_horas: null });
  });

  it('recusa filtros inválidos com 400', async () => {
    const res = await request(app).get('/api/indicadores?data_inicio=2026-02-30&status=pendente');
    expect(res.status).toBe(400);
    expect(res.body.campos).toEqual(['data_inicio', 'status']);
  });
});

describe('Gráficos', () => {
  it('chamados por mês somam o total', async () => {
    const res = await request(app).get('/api/chamados-por-periodo?agrupamento=mes');
    const soma = res.body.reduce((s, p) => s + p.abertos, 0);
    expect(soma).toBe(contar('SELECT COUNT(*) AS n FROM chamados'));
  });

  it('recusa agrupamento inválido', async () => {
    const res = await request(app).get('/api/chamados-por-periodo?agrupamento=ano');
    expect(res.status).toBe(400);
  });

  it('situação traz os cinco status', async () => {
    const res = await request(app).get('/api/situacao');
    expect(res.body.map((s) => s.status)).toEqual(['aberto', 'em_andamento', 'resolvido', 'fechado', 'cancelado']);
  });

  it('tipos vêm ordenados pelos mais atendidos', async () => {
    const res = await request(app).get('/api/tipos');
    const atendidos = res.body.map((t) => t.atendidos);
    expect([...atendidos].sort((a, b) => b - a)).toEqual(atendidos);
  });
});

describe('Chamados', () => {
  it('lista com paginação e filtro', async () => {
    const res = await request(app).get('/api/chamados?status=fechado&pagina=2');
    expect(res.body.dados).toHaveLength(10);
    expect(res.body.pagina).toBe(2);
    expect(res.body.dados.every((c) => c.status === 'fechado')).toBe(true);
  });

  it('mostra o detalhe com as considerações', async () => {
    const id = db.prepare("SELECT id FROM chamados WHERE status = 'fechado' LIMIT 1").get().id;
    const res = await request(app).get(`/api/chamados/${id}`);
    expect(res.body.consideracoes.length).toBeGreaterThan(0);
  });

  it('retorna 404 para chamado inexistente', async () => {
    const res = await request(app).get('/api/chamados/99999');
    expect(res.status).toBe(404);
  });

  it('segue o fluxo aberto, em andamento, resolvido e fechado', async () => {
    const id = db.prepare("SELECT id FROM chamados WHERE status = 'aberto' AND tecnico_id IS NULL LIMIT 1").get().id;

    let res = await request(app).patch(`/api/chamados/${id}`).send({ status: 'em_andamento' });
    expect(res.status).toBe(422);

    res = await request(app).patch(`/api/chamados/${id}`).send({ status: 'em_andamento', tecnico_id: 1 });
    expect(res.body.status).toBe('em_andamento');

    res = await request(app).patch(`/api/chamados/${id}`).send({ status: 'resolvido' });
    expect(res.status).toBe(422);

    res = await request(app).patch(`/api/chamados/${id}`).send({ status: 'resolvido', solucao: 'Cabo de rede substituído.' });
    expect(res.body.status).toBe('resolvido');
    expect(res.body.resolvido_em).toBeTruthy();

    res = await request(app).patch(`/api/chamados/${id}`).send({ status: 'fechado' });
    expect(res.body.status).toBe('fechado');

    res = await request(app).patch(`/api/chamados/${id}`).send({ status: 'aberto' });
    expect(res.status).toBe(422);
  });

  it('registra consideração técnica', async () => {
    const res = await request(app).post('/api/chamados/1/consideracoes').send({ autor: 'Ana Souza', texto: 'Cabo trocado e testado.' });
    expect(res.status).toBe(201);
    const vazio = await request(app).post('/api/chamados/1/consideracoes').send({});
    expect(vazio.body.campos).toEqual(['autor', 'texto']);
  });

  it('recusa JSON inválido', async () => {
    const res = await request(app).patch('/api/chamados/1').set('Content-Type', 'application/json').send('{"status":');
    expect(res.status).toBe(400);
  });
});
