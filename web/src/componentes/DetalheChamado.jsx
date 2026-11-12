import { useEffect, useState } from 'react';
import { buscar, enviar, nomesStatus, coresStatus, nomesPrioridade, dataBr } from '../api.js';

const proximos = {
  aberto: ['em_andamento', 'cancelado'],
  em_andamento: ['resolvido', 'cancelado'],
  resolvido: ['fechado', 'em_andamento'],
  fechado: [],
  cancelado: [],
};

export default function DetalheChamado({ id, tecnicos, fechar, aoAlterar }) {
  const [chamado, setChamado] = useState(null);
  const [novoStatus, setNovoStatus] = useState('');
  const [tecnico, setTecnico] = useState('');
  const [solucao, setSolucao] = useState('');
  const [nota, setNota] = useState('');
  const [mensagem, setMensagem] = useState(null);

  const carregar = () => buscar(`chamados/${id}`).then(setChamado);

  useEffect(() => {
    carregar();
  }, [id]);

  const salvarStatus = async () => {
    try {
      await enviar(`chamados/${id}`, 'PATCH', {
        status: novoStatus,
        tecnico_id: tecnico ? Number(tecnico) : undefined,
        solucao: solucao || undefined,
      });
      setNovoStatus('');
      setSolucao('');
      setMensagem({ tipo: 'success', texto: 'Chamado atualizado.' });
      await carregar();
      aoAlterar();
    } catch (e) {
      setMensagem({ tipo: 'danger', texto: e.message });
    }
  };

  const salvarNota = async () => {
    try {
      await enviar(`chamados/${id}/consideracoes`, 'POST', { autor: chamado.tecnico || 'Administrador', texto: nota });
      setNota('');
      setMensagem({ tipo: 'success', texto: 'Consideração registrada.' });
      await carregar();
    } catch (e) {
      setMensagem({ tipo: 'danger', texto: e.message });
    }
  };

  return (
    <>
      <div className="modal d-block" tabIndex="-1" onClick={(e) => e.target === e.currentTarget && fechar()}>
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{chamado ? `#${chamado.id} - ${chamado.titulo}` : 'Carregando...'}</h5>
              <button type="button" className="btn-close" onClick={fechar}></button>
            </div>

            {chamado && (
              <div className="modal-body">
                <div className="row small mb-3">
                  <div className="col-6 col-md-4 mb-2"><strong>Status:</strong> <span className={`badge text-bg-${coresStatus[chamado.status]}`}>{nomesStatus[chamado.status]}</span></div>
                  <div className="col-6 col-md-4 mb-2"><strong>Prioridade:</strong> {nomesPrioridade[chamado.prioridade]}</div>
                  <div className="col-6 col-md-4 mb-2"><strong>Tipo:</strong> {chamado.categoria}</div>
                  <div className="col-6 col-md-4 mb-2"><strong>Unidade:</strong> {chamado.unidade}</div>
                  <div className="col-6 col-md-4 mb-2"><strong>Técnico:</strong> {chamado.tecnico || '-'}</div>
                  <div className="col-6 col-md-4 mb-2"><strong>Aberto em:</strong> {dataBr(chamado.aberto_em)}</div>
                  <div className="col-6 col-md-4 mb-2"><strong>Prazo:</strong> {dataBr(chamado.prazo_em)}</div>
                  <div className="col-6 col-md-4 mb-2"><strong>Resolvido em:</strong> {dataBr(chamado.resolvido_em)}</div>
                </div>

                <h6>Considerações técnicas</h6>
                {chamado.consideracoes.length === 0 && <p className="text-muted small">Nenhuma consideração ainda.</p>}
                <ul className="list-group list-group-flush mb-2">
                  {chamado.consideracoes.map((c) => (
                    <li key={c.id} className="list-group-item px-0 small">
                      <strong>{c.autor}</strong> <span className="text-muted">em {dataBr(c.criado_em)}</span>
                      <div>{c.texto}</div>
                    </li>
                  ))}
                </ul>
                {chamado.status !== 'cancelado' && (
                  <div className="input-group input-group-sm mb-4">
                    <input className="form-control" placeholder="Nova consideração" value={nota} onChange={(e) => setNota(e.target.value)} />
                    <button className="btn btn-outline-primary" onClick={salvarNota}>Adicionar</button>
                  </div>
                )}

                {proximos[chamado.status].length > 0 && (
                  <>
                    <h6>Atualizar chamado</h6>
                    <div className="row g-2">
                      <div className="col-md-6">
                        <select className="form-select form-select-sm" value={novoStatus} onChange={(e) => setNovoStatus(e.target.value)}>
                          <option value="">Novo status</option>
                          {proximos[chamado.status].map((s) => <option key={s} value={s}>{nomesStatus[s]}</option>)}
                        </select>
                      </div>
                      {novoStatus === 'em_andamento' && (
                        <div className="col-md-6">
                          <select className="form-select form-select-sm" value={tecnico} onChange={(e) => setTecnico(e.target.value)}>
                            <option value="">{chamado.tecnico ? `Manter ${chamado.tecnico}` : 'Escolha o técnico'}</option>
                            {tecnicos.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                          </select>
                        </div>
                      )}
                      {novoStatus === 'resolvido' && (
                        <div className="col-12">
                          <textarea className="form-control form-control-sm" rows="2" placeholder="Descreva a solução" value={solucao} onChange={(e) => setSolucao(e.target.value)} />
                        </div>
                      )}
                      <div className="col-12">
                        <button className="btn btn-primary btn-sm" disabled={!novoStatus} onClick={salvarStatus}>Salvar</button>
                      </div>
                    </div>
                  </>
                )}

                {mensagem && <div className={`alert alert-${mensagem.tipo} py-2 mt-3 mb-0`}>{mensagem.texto}</div>}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="modal-backdrop show"></div>
    </>
  );
}
