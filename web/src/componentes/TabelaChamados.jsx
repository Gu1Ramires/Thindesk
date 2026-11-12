import { useEffect, useState } from 'react';
import { buscar, nomesStatus, coresStatus, nomesPrioridade, dataBr } from '../api.js';

export default function TabelaChamados({ filtros, versao, abrir }) {
  const [busca, setBusca] = useState('');
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    setPagina(1);
  }, [filtros, busca]);

  useEffect(() => {
    buscar('chamados', { ...filtros, busca, pagina })
      .then((dados) => {
        setResultado(dados);
        setErro('');
      })
      .catch((e) => setErro(e.message));
  }, [filtros, busca, pagina, versao]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center titulo-secao">
        <span>Chamados {resultado && <span className="text-muted fw-normal">({resultado.total})</span>}</span>
        <input className="form-control form-control-sm w-auto" placeholder="Buscar pelo título" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>

      {erro && <div className="alert alert-danger py-2">{erro}</div>}

      {resultado && (
        <>
          <div className="table-responsive">
            <table className="table table-hover table-sm align-middle small bg-white">
              <thead className="table-light">
                <tr>
                  <th>Nº</th>
                  <th>Título</th>
                  <th>Tipo</th>
                  <th>Unidade</th>
                  <th>Prioridade</th>
                  <th>Status</th>
                  <th>Técnico</th>
                  <th>Aberto em</th>
                </tr>
              </thead>
              <tbody>
                {resultado.dados.map((c) => (
                  <tr key={c.id} className="linha-clicavel" onClick={() => abrir(c.id)}>
                    <td>{c.id}</td>
                    <td>{c.titulo}</td>
                    <td>{c.categoria}</td>
                    <td>{c.unidade}</td>
                    <td>{nomesPrioridade[c.prioridade]}</td>
                    <td><span className={`badge text-bg-${coresStatus[c.status]}`}>{nomesStatus[c.status]}</span></td>
                    <td className="text-nowrap">{c.tecnico || "-"}</td>
                    <td className="text-nowrap">{dataBr(c.aberto_em)}</td>
                  </tr>
                ))}
                {resultado.dados.length === 0 && (
                  <tr><td colSpan="8" className="text-center text-muted py-3">Nenhum chamado encontrado</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">Página {resultado.pagina} de {resultado.paginas}</small>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPagina(pagina - 1)}>Anterior</button>
              </li>
              <li className={`page-item ${pagina >= resultado.paginas ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPagina(pagina + 1)}>Próxima</button>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
