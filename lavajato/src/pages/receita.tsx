import { useState, useEffect } from 'react'
import '../App.css'
import '../styles/receita.css'
import { supabase } from '../services/supabaseClient'

type Lavador = {
  lavador_id: number
  lavador_nome: string
  total_lavagens: number
  total_valor: number
  valor_lavador: number
  valor_empresa: number
}

export function Receita() {
  const [lavagens_por_lavador, setLavagensPorLavador] = useState<Lavador[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedLavador, setExpandedLavador] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [saidaForm, setSaidaForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0]
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('lavagens_por_lavador')
        .select('*')
        .order('lavador_nome', { ascending: true })

      if (error) throw error

      setLavagensPorLavador(data || [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }


  const addSaida = async (lavadorId: number) => {
    if (!saidaForm.descricao || !saidaForm.valor) {
      alert('Preencha todos os campos')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('despesas')
        .insert({
          lavador_id: lavadorId,
          descricao: saidaForm.descricao,
          valor: parseFloat(saidaForm.valor),
          data: saidaForm.data
        })

      if (error) throw error

      setSaidaForm({
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0]
      })
      setExpandedLavador(null)
      await fetchData()
    } catch (error) {
      console.error('Erro ao adicionar saída:', error)
      alert('Erro ao registrar saída. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
  fetchData()
}, [])


  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Receitas por Lavador</h1>
        <p className="subtitle">Acompanhe o desempenho e despesas de cada lavador</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          

          {loading ? (
            <p className="loading">Carregando dados...</p>
          ) : lavagens_por_lavador.length > 0 ? (
            <div className="receita-cards-grid">
              {lavagens_por_lavador.map(lav => (
                <div key={lav.lavador_id} className="receita-card">
                  {/* Cabeçalho do Card */}
                  <div className="receita-card-header">
                    <h3 className="lavador-nome">{lav.lavador_nome}</h3>
                    <button
                      className={`btn-saida ${expandedLavador === lav.lavador_id ? 'active' : ''}`}
                      onClick={() => setExpandedLavador(expandedLavador === lav.lavador_id ? null : lav.lavador_id)}
                      disabled={submitting}
                    >
                      {expandedLavador === lav.lavador_id ? '✕ Cancelar' : '+ Saída'}
                    </button>
                  </div>

                  {/* Estatísticas */}
                  <div className="receita-stats">
                    <div className="stat-item">
                      <span className="stat-label">Serviços</span>
                      <span className="stat-value">{lav.total_lavagens}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Total Faturado</span>
                      <span className="stat-value">R$ {lav.total_valor.toFixed(2)}</span>
                    </div>
                    <div className="stat-item positivo">
                      <span className="stat-label">Ganho do Lavador</span>
                      <span className="stat-value">R$ {lav.valor_lavador.toFixed(2)}</span>
                    </div>
                    <div className="stat-item empresa">
                      <span className="stat-label">Ganho da Empresa</span>
                      <span className="stat-value">R$ {lav.valor_empresa.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Formulário de Saída - Expandido */}
                  {expandedLavador === lav.lavador_id && (
                    <div className="receita-form-section">
                      <h4>Registrar Nova Saída</h4>
                      <form className="receita-form" onSubmit={(e) => { e.preventDefault(); addSaida(lav.lavador_id); }}>
                        <div className="form-group">
                          <label htmlFor={`descricao-${lav.lavador_id}`}>Descrição</label>
                          <input
                            id={`descricao-${lav.lavador_id}`}
                            type="text"
                            placeholder="Ex: Uniforme, Material de Limpeza"
                            value={saidaForm.descricao}
                            onChange={(e) => setSaidaForm({ ...saidaForm, descricao: e.target.value })}
                            disabled={submitting}
                            required
                          />
                        </div>

                        <div className="form-row">
                          <div className="form-group">
                            <label htmlFor={`valor-${lav.lavador_id}`}>Valor (R$)</label>
                            <input
                              id={`valor-${lav.lavador_id}`}
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="0.00"
                              value={saidaForm.valor}
                              onChange={(e) => setSaidaForm({ ...saidaForm, valor: e.target.value })}
                              disabled={submitting}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <label htmlFor={`data-${lav.lavador_id}`}>Data</label>
                            <input
                              id={`data-${lav.lavador_id}`}
                              type="date"
                              value={saidaForm.data}
                              onChange={(e) => setSaidaForm({ ...saidaForm, data: e.target.value })}
                              disabled={submitting}
                              required
                            />
                          </div>
                        </div>

                        <div className="form-actions">
                          <button 
                            type="submit"
                            className="btn-submit" 
                            disabled={submitting || !saidaForm.descricao || !saidaForm.valor}
                          >
                            {submitting ? 'Salvando...' : 'Salvar Saída'}
                          </button>
                          <button 
                            type="button"
                            className="btn-cancel" 
                            onClick={() => {
                              setExpandedLavador(null)
                              setSaidaForm({
                                descricao: '',
                                valor: '',
                                data: new Date().toISOString().split('T')[0]
                              })
                            }}
                            disabled={submitting}
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">Nenhum lavador encontrado para este período.</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default Receita