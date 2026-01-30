import { useState, useEffect } from 'react'
import '../App.css'
import '../styles/receita.css'
import { supabase } from '../services/supabaseClient'

/**
 * 🔹 ESPELHO EXATO DA VIEW lavagens_por_lavador
 */
type LavadorView = {
  lavador_id: number
  lavador_nome: string
  total_lavagens: number
  total_valor: number
  valor_lavador: number
  valor_empresa: number
  created_at_first: string // timestamp
  created_at_last: string  // timestamp
}

type Periodo = 1 | 7 | 30 | 60

export function Receita() {
  const [dados, setDados] = useState<LavadorView[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedLavador, setExpandedLavador] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>(7)

  const [filtro, setFiltro] = useState({
    data_inicio: '',
    data_fim: ''
  })

  const [saidaForm, setSaidaForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10)
  })

  /**
   * 🔹 Calcula período em TIMESTAMP (compatível com created_at)
   */
  const calcularPeriodo = (dias: number) => {
    const fim = new Date()
    const inicio = new Date()
    inicio.setDate(fim.getDate() - dias)

    return {
      data_inicio: inicio.toISOString(),
      data_fim: fim.toISOString()
    }
  }

  useEffect(() => {
    setFiltro(calcularPeriodo(periodo))
  }, [periodo])

  const [dataInicioInput, setDataInicioInput] = useState('')
  const [dataFimInput, setDataFimInput] = useState('')

  useEffect(() => {
    const p = calcularPeriodo(periodo)
    setDataInicioInput(p.data_inicio.slice(0, 10))
    setDataFimInput(p.data_fim.slice(0, 10))
  }, [periodo])

  /**
   * 🔹 FETCH TOTALMENTE ALINHADO À VIEW
   */
  const fetchData = async () => {
    if (!filtro.data_inicio || !filtro.data_fim) return

    setLoading(true)

    const { data, error } = await supabase
      .from('lavagens_por_lavador')
      .select('*')
      .gte('created_at_first', filtro.data_inicio)
      .lte('created_at_last', filtro.data_fim)
      .order('lavador_nome')

    if (error) {
      console.error('Erro Supabase:', error)
    } else {
      setDados(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filtro])

  const aplicarPeriodoManual = () => {
    if (!dataInicioInput || !dataFimInput) {
      alert('Datas inválidas')
      return
    }

    setFiltro({
      data_inicio: new Date(dataInicioInput).toISOString(),
      data_fim: new Date(dataFimInput + 'T23:59:59').toISOString()
    })
  }

  const addSaida = async (lavadorId: number) => {
    if (!saidaForm.descricao || !saidaForm.valor) return

    setSubmitting(true)

    const { error } = await supabase.from('despesas').insert({
      lavador_id: lavadorId,
      descricao: saidaForm.descricao,
      valor: Number(saidaForm.valor),
      data: saidaForm.data
    })

    if (error) {
      console.error(error)
      alert('Erro ao salvar saída')
    } else {
      setExpandedLavador(null)
      setSaidaForm({
        descricao: '',
        valor: '',
        data: new Date().toISOString().slice(0, 10)
      })
      fetchData()
    }

    setSubmitting(false)
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Receitas por Lavador</h1>
        <p className="subtitle">Acompanhe o desempenho e despesas de cada lavador</p>

        <div className="filtro-periodo-botoes">
          {[1, 7, 30, 60].map(p => (
            <button
              key={p}
              className={periodo === p ? 'active' : ''}
              onClick={() => setPeriodo(p as Periodo)}
            >
              {p === 1 ? 'Último dia' : `${p} dias`}
            </button>
          ))}
        </div>

        <div className="filtro-periodo">
          <div className="filtro-grupo">
            <label htmlFor="data-inicio">Data Inicial</label>
            <input
              id="data-inicio"
              type="date"
              value={dataInicioInput}
              onChange={e => setDataInicioInput(e.target.value)}
            />
          </div>

          <div className="filtro-grupo">
            <label htmlFor="data-fim">Data Final</label>
            <input
              id="data-fim"
              type="date"
              value={dataFimInput}
              onChange={e => setDataFimInput(e.target.value)}
            />
          </div>

          <button className="btn-apply" onClick={aplicarPeriodoManual}>
            Aplicar
          </button>
        </div>
      </header>

      <main className="page-content">
        <div className="content-container">
          {loading ? (
            <p className="loading">Carregando dados...</p>
          ) : dados.length === 0 ? (
            <p className="empty-message">Nenhum lavador encontrado para este período.</p>
          ) : (
            <div className="receita-cards-grid">
              {dados.map(lav => (
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
                                data: new Date().toISOString().slice(0, 10)
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
          )}
        </div>
      </main>
    </div>
  )
}

export default Receita