import { useState, useEffect } from 'react'
import '../App.css'
import '../styles/receita.css'
import { supabase } from '../services/supabaseClient'

/**
 * 🔹 REGISTRO INDIVIDUAL DE LAVAGEM
 */
type Lavagem = {
  id: number
  lavador_id: number
  valor: number
  created_at: string
  lavadores: {
    nome: string
  }
}

/**
 * 🔹 RESULTADO FINAL AGRUPADO POR LAVADOR
 */
type LavadorCalculado = {
  lavador_id: number
  lavador_nome: string
  total_lavagens: number
  total_valor: number
  valor_lavador: number
  valor_empresa: number
}

type Periodo = 1 | 7 | 30 | 60

export function Receita() {
  const [dados, setDados] = useState<LavadorCalculado[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedLavador, setExpandedLavador] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [periodo, setPeriodo] = useState<Periodo>(7)

  const [filtro, setFiltro] = useState({
    data_inicio: '',
    data_fim: ''
  })

  const [dataInicioInput, setDataInicioInput] = useState('')
  const [dataFimInput, setDataFimInput] = useState('')

  const [saidaForm, setSaidaForm] = useState({
    descricao: '',
    valor: '',
    data: new Date().toISOString().slice(0, 10)
  })

  /**
   * 🔹 Calcula período em ISO (compatível com created_at)
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
    const p = calcularPeriodo(periodo)
    setFiltro(p)
    setDataInicioInput(p.data_inicio.slice(0, 10))
    setDataFimInput(p.data_fim.slice(0, 10))
  }, [periodo])

  /**
   * 🔹 AGRUPA LAVAGENS POR LAVADOR (FRONTEND)
   */
  const agruparPorLavador = (lavagens: Lavagem[]): LavadorCalculado[] => {
    const mapa = new Map<number, LavadorCalculado>()

    lavagens.forEach(lav => {
      if (!mapa.has(lav.lavador_id)) {
        mapa.set(lav.lavador_id, {
          lavador_id: lav.lavador_id,
          lavador_nome: lav.lavadores.nome,
          total_lavagens: 0,
          total_valor: 0,
          valor_lavador: 0,
          valor_empresa: 0
        })
      }

      const acc = mapa.get(lav.lavador_id)!
      acc.total_lavagens += 1
      acc.total_valor += lav.valor
    })

    mapa.forEach(acc => {
      
      acc.valor_lavador = acc.total_valor * 0.4
      acc.valor_empresa = acc.total_valor * 0.6
    })

    return Array.from(mapa.values())
  }

  /**
   * 🔹 FETCH REAL (FILTRANDO POR created_at DA LAVAGEM)
   */
  const fetchData = async () => {
    if (!filtro.data_inicio || !filtro.data_fim) return

    setLoading(true)

    const { data, error } = await supabase
      .from('lavagens')
      .select(`
        id,
        lavador_id,
        valor,
        created_at,
        lavadores (
          nome
        )
      `)
      .gte('created_at', filtro.data_inicio)
      .lte('created_at', filtro.data_fim)

    if (error) {
      console.error('Erro Supabase:', error)
      setLoading(false)
      return
    }

    const resultado = agruparPorLavador(data || [])
    setDados(resultado)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [filtro])

  /**
   * 🔹 APLICAR PERÍODO MANUAL
   */
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

  /**
   * 🔹 REGISTRAR SAÍDA
   */
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
        <p className="subtitle">Valores reais calculados por período</p>

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
            <label>Data Inicial</label>
            <input
              type="date"
              value={dataInicioInput}
              onChange={e => setDataInicioInput(e.target.value)}
            />
          </div>

          <div className="filtro-grupo">
            <label>Data Final</label>
            <input
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
        {loading ? (
          <p className="loading">Carregando...</p>
        ) : dados.length === 0 ? (
          <p className="empty-message">Nenhum dado no período</p>
        ) : (
          <div className="receita-cards-grid">
            {dados.map(lav => (
              <div key={lav.lavador_id} className="receita-card">
                <div className="receita-card-header">
                  <h3>{lav.lavador_nome}</h3>
                  <button
                    className="btn-saida"
                    onClick={() =>
                      setExpandedLavador(
                        expandedLavador === lav.lavador_id ? null : lav.lavador_id
                      )
                    }
                  >
                    + Saída
                  </button>
                </div>

                <div className="receita-stats">
                  <div>Serviços: {lav.total_lavagens}</div>
                  <div>Total: R$ {lav.total_valor.toFixed(2)}</div>
                  <div>Lavador: R$ {lav.valor_lavador.toFixed(2)}</div>
                  <div>Empresa: R$ {lav.valor_empresa.toFixed(2)}</div>
                </div>

                {expandedLavador === lav.lavador_id && (
                  <form
                    onSubmit={e => {
                      e.preventDefault()
                      addSaida(lav.lavador_id)
                    }}
                  >
                    <input
                      placeholder="Descrição"
                      value={saidaForm.descricao}
                      onChange={e =>
                        setSaidaForm({ ...saidaForm, descricao: e.target.value })
                      }
                    />
                    <input
                      type="number"
                      placeholder="Valor"
                      value={saidaForm.valor}
                      onChange={e =>
                        setSaidaForm({ ...saidaForm, valor: e.target.value })
                      }
                    />
                    <input
                      type="date"
                      value={saidaForm.data}
                      onChange={e =>
                        setSaidaForm({ ...saidaForm, data: e.target.value })
                      }
                    />
                    <button type="submit">Salvar</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Receita
