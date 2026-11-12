export default function Filtros({ filtros, opcoes, mudar, limpar }) {
  const campo = (nome) => (e) => mudar({ ...filtros, [nome]: e.target.value });

  return (
    <div className="row g-2 align-items-end mb-4">
      <div className="col-6 col-md-2">
        <label className="form-label small mb-1">De</label>
        <input type="date" className="form-control form-control-sm" value={filtros.data_inicio} onChange={campo('data_inicio')} />
      </div>
      <div className="col-6 col-md-2">
        <label className="form-label small mb-1">Até</label>
        <input type="date" className="form-control form-control-sm" value={filtros.data_fim} onChange={campo('data_fim')} />
      </div>
      <div className="col-6 col-md-2">
        <label className="form-label small mb-1">Status</label>
        <select className="form-select form-select-sm" value={filtros.status} onChange={campo('status')}>
          <option value="">Todos</option>
          {opcoes.status.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-1">
        <label className="form-label small mb-1">Prioridade</label>
        <select className="form-select form-select-sm" value={filtros.prioridade} onChange={campo('prioridade')}>
          <option value="">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </select>
      </div>
      <div className="col-6 col-md-2">
        <label className="form-label small mb-1">Tipo</label>
        <select className="form-select form-select-sm" value={filtros.categoria_id} onChange={campo('categoria_id')}>
          <option value="">Todos</option>
          {opcoes.categorias.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-1">
        <label className="form-label small mb-1">Técnico</label>
        <select className="form-select form-select-sm" value={filtros.tecnico_id} onChange={campo('tecnico_id')}>
          <option value="">Todos</option>
          {opcoes.tecnicos.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-1">
        <label className="form-label small mb-1">Unidade</label>
        <select className="form-select form-select-sm" value={filtros.unidade_id} onChange={campo('unidade_id')}>
          <option value="">Todas</option>
          {opcoes.unidades.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
      </div>
      <div className="col-6 col-md-1">
        <button className="btn btn-outline-secondary btn-sm w-100" onClick={limpar}>Limpar</button>
      </div>
    </div>
  );
}
