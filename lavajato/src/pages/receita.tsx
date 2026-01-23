import '../App.css'
import '../styles/forms.css'
import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'

// Tipos para os dados
type Lavador = {
  id: number
  nome: string
}

type Lavagem = {
  id: number
  lavador_id: number
  valor: number
  data: string
}

type Saida = {
  id: number
  descricao: string
  valor: number
  data: string
  lavador_id?: number // Opcional para saídas gerais
}

type ReceitaData = {
  totalReceitas: number
  totalSaidas: number
  lucro: number
  lavadores: {
    id: number
    nome: string
    receitas: number
    saidas: number
    liquido: number
    servicos: number
  }[]
}

export function Receita() {
  // Estados para controle da UI
  const [mode, setMode] = useState<'geral' | 'lavador'>('geral') // Modo de visualização
  const [month, setMonth] = useState(new Date().getMonth() + 1) // Mês atual (1-12)
  const [year, setYear] = useState(new Date().getFullYear()) // Ano atual
  const [data, setData] = useState<ReceitaData | null>(null) // Dados carregados
  const [loading, setLoading] = useState(false) // Estado de carregamento

  // Estados para o formulário de saída
  const [saidaForm, setSaidaForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0], // Data no formato YYYY-MM-DD
    lavador_id: ''
  })

  // Função para buscar dados do Supabase
  const fetchData = async () => {
    setLoading(true)
    try {
      // Buscar lavagens do mês selecionado
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
      const endDate = new Date(year, month, 1).toISOString().split('T')[0] // Último dia do mês

      const { data: lavagens, error: lavError } = await supabase
        .from('lavagens')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)

      if (lavError) throw lavError

      // Buscar saídas do mês
      const { data: saidas, error: saiError } = await supabase
        .from('saidas')
        .select('*')
        .gte('data', startDate)
        .lte('data', endDate)

      if (saiError) throw saiError

      // Buscar lavadores
      const { data: lavadores, error: lavadoresError } = await supabase
        .from('lavadores')
        .select('*')

      if (lavadoresError) throw lavadoresError

      // Calcular totais
      const totalReceitas = lavagens.reduce((sum, l) => sum + l.valor, 0)
      const totalSaidas = saidas.reduce((sum, s) => sum + s.valor, 0)
      // Lucro líquido do dono: total arrecadado - 40% pagos aos lavadores - saídas
      const comissaoTotalLavadores = totalReceitas * 0.4
      const lucro = totalReceitas - comissaoTotalLavadores - totalSaidas

      // Calcular por lavador
      const lavadoresData = lavadores.map(lav => {
        const receitasLav = lavagens.filter(l => l.lavador_id === lav.id).reduce((sum, l) => sum + l.valor, 0)
        const saidasLav = saidas.filter(s => s.lavador_id === lav.id).reduce((sum, s) => sum + s.valor, 0)
        const servicos = lavagens.filter(l => l.lavador_id === lav.id).length
        // O lavador recebe 40% do arrecadado, menos as saídas associadas a ele
        const comissaoDono = receitasLav * 0.6 // 60% para o dono
        const valorLavador = receitasLav - comissaoDono // 40% para o lavador
        return {
          id: lav.id,
          nome: lav.nome,
          receitas: receitasLav, // Total arrecadado
          saidas: saidasLav,
          liquido: valorLavador - saidasLav, // Valor que o lavador recebe líquido
          servicos
        }
      })

      setData({
        totalReceitas,
        totalSaidas,
        lucro,
        lavadores: lavadoresData
      })
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados quando mês, ano ou modo mudar
  useEffect(() => {
    fetchData()
  }, [month, year])

  // Função para adicionar saída
  const addSaida = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase
        .from('saidas')
        .insert({
          descricao: saidaForm.descricao,
          valor: parseFloat(saidaForm.valor),
          data: saidaForm.data,
          lavador_id: saidaForm.lavador_id ? parseInt(saidaForm.lavador_id) : null
        })

      if (error) throw error

      // Resetar formulário e recarregar dados
      setSaidaForm({
        descricao: '',
        valor: '',
        data: new Date().toISOString().split('T')[0],
        lavador_id: ''
      })
      fetchData()
    } catch (error) {
      console.error('Erro ao adicionar saída:', error)
    }
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Receitas e Saídas</h1>
        <p className="subtitle">Acompanhe o fluxo financeiro</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          {/* Filtros */}
          <div className="filters-section">
            <div className="filter-group">
              <label>Mês</label>
              <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Ano</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>

            {/* Seletor de modo */}
            <div className="mode-selector">
              <button 
                onClick={() => setMode('geral')} 
                className={`mode-btn ${mode === 'geral' ? 'active' : ''}`}
              >
                Visão Geral
              </button>
              <button 
                onClick={() => setMode('lavador')} 
                className={`mode-btn ${mode === 'lavador' ? 'active' : ''}`}
              >
                Por Lavador
              </button>
            </div>
          </div>

          {loading ? (
            <p className="loading">Carregando...</p>
          ) : data ? (
            <>
              {/* Visão Geral */}
              {mode === 'geral' && (
                <div className="summary-cards">
                  <div className="card summary-card">
                    <div className="card-header">
                      <h3>Total Receitas</h3>
                    </div>
                    <div className="card-content">
                      <p className="card-value positivo">R$ {data.totalReceitas.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="card summary-card">
                    <div className="card-header">
                      <h3>Total Saídas</h3>
                    </div>
                    <div className="card-content">
                      <p className="card-value negativo">R$ {data.totalSaidas.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="card summary-card">
                    <div className="card-header">
                      <h3>Lucro Líquido</h3>
                    </div>
                    <div className="card-content">
                      <p className="card-value highlight">R$ {data.lucro.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Por Lavador */}
              {mode === 'lavador' && (
                <div className="list-section">
                  <h2>Receitas por Lavador</h2>
                  {data.lavadores.length === 0 ? (
                    <p className="empty-message">Nenhum lavador com serviços neste período.</p>
                  ) : (
                    <div className="table-responsive">
                      <table>
                        <thead>
                          <tr>
                            <th>Lavador</th>
                            <th>Receitas</th>
                            <th>Saídas</th>
                            <th>Líquido</th>
                            <th>Serviços</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.lavadores.map(lav => (
                            <tr key={lav.id}>
                              <td><strong>{lav.nome}</strong></td>
                              <td className="positivo">R$ {lav.receitas.toFixed(2)}</td>
                              <td className="negativo">R$ {lav.saidas.toFixed(2)}</td>
                              <td className="highlight">R$ {lav.liquido.toFixed(2)}</td>
                              <td>{lav.servicos}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Formulário para registrar saída */}
              <form onSubmit={addSaida} className="form-card">
                <h2>Registrar Saída</h2>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={saidaForm.descricao}
                  onChange={(e) => setSaidaForm({ ...saidaForm, descricao: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Valor"
                  value={saidaForm.valor}
                  onChange={(e) => setSaidaForm({ ...saidaForm, valor: e.target.value })}
                  required
                />
                <input
                  type="date"
                  value={saidaForm.data}
                  onChange={(e) => setSaidaForm({ ...saidaForm, data: e.target.value })}
                  required
                />
                <select
                  value={saidaForm.lavador_id}
                  onChange={(e) => setSaidaForm({ ...saidaForm, lavador_id: e.target.value })}
                >
                  <option value="">Saída Geral</option>
                  {data.lavadores.map(lav => (
                    <option key={lav.id} value={lav.id}>{lav.nome}</option>
                  ))}
                </select>
                <button type="submit">Adicionar Saída</button>
              </form>
            </>
          ) : (
            <p className="error-message">Erro ao carregar dados.</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default Receita
