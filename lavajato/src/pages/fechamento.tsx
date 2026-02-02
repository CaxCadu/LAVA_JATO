import { useState, useEffect } from 'react'
import '../styles/fechamento.css'
import { supabase } from '../services/supabaseClient'
import { MdAttachMoney } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'

/* ==================== TIPOS ==================== */

type Despesa = {
  id: string
  descricao: string
  valor: number
  created_at: string
}

type ConfirmacaoDel = {
  mostrar: boolean
  id: string | null
}

/* ==================== HELPERS ==================== */

const obterIntervaloDia = (data: string) => {
  const [ano, mes, dia] = data.split('-').map(Number)

  const inicio = new Date(ano, mes - 1, dia, 0, 0, 0, 0)
  const fim = new Date(ano, mes - 1, dia, 23, 59, 59, 999)

  return { inicio, fim }
}

/* ==================== COMPONENTE ==================== */

export function Fechamento() {
  const dataFechamento = new Date().toISOString().split('T')[0]

  /* ==================== ESTADOS ==================== */

  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [entradasDia, setEntradasDia] = useState(0)

  const [maquinapix, setMaquinapix] = useState('')
  const [dinheiro, setDinheiro] = useState('')
  const [cortesias, setCortesias] = useState('')
  const [empresas, setEmpresas] = useState('')
  const [despesasExtras, setDespesasExtras] = useState('')
  const [descricaoDespesa, setDescricaoDespesa] = useState('')

  const [resultadoFechamento, setResultadoFechamento] = useState<{
    total: number
    tipo: 'positivo' | 'negativo'
  } | null>(null)

  const [error, setError] = useState<string | null>(null)
  const [confirmacaoDel, setConfirmacaoDel] = useState<ConfirmacaoDel>({
    mostrar: false,
    id: null
  })

  const despesasExtrasNum = parseFloat(despesasExtras) || 0

  /* ==================== FETCH DADOS DO DIA ==================== */

  useEffect(() => {
    const fetchReceitaDia = async () => {
      const { data, error } = await supabase
        .from('receitadia')
        .select('entradas')
        .eq('data', dataFechamento)
        .single()

      if (error) {
        console.error('Erro receita dia:', error)
        setEntradasDia(0)
        return
      }

      setEntradasDia(data?.entradas || 0)
    }

    const buscarDespesasNoDia = async () => {
      const { inicio, fim } = obterIntervaloDia(dataFechamento)

      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .gte('created_at', inicio.toISOString())
        .lte('created_at', fim.toISOString())
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro despesas dia:', error)
        setDespesas([])
        return
      }

      setDespesas(data as Despesa[])
    }

    fetchReceitaDia()
    buscarDespesasNoDia()
  }, [dataFechamento])

  /* ==================== CÁLCULOS ==================== */

  const calcularTotais = () => {
    const cortesiasNum = parseFloat(cortesias) || 0
    const empresasNum = parseFloat(empresas) || 0
    const maquinapixNum = parseFloat(maquinapix) || 0
    const dinheiroNum = parseFloat(dinheiro) || 0

    const despesasRegistradas = despesas.reduce(
      (sum, d) => sum + d.valor,
      0
    )

    const totalDespesas = despesasRegistradas + despesasExtrasNum

    const caixaImediato =
      entradasDia - dinheiroNum - maquinapixNum - cortesiasNum - totalDespesas

    const caixaTotal = caixaImediato + empresasNum

    return {
      despesasRegistradas,
      totalDespesas,
      caixaImediato,
      maquinapix: maquinapixNum,
      dinheiro: dinheiroNum,
      caixaTotal,
      cortesias: cortesiasNum,
      empresas: empresasNum
    }
  }

  const totais = calcularTotais()

  /* ==================== FECHAMENTO ==================== */

  const handleFazerFechamento = async () => {
    setError(null)

    if (entradasDia === 0) {
      setError('Não há entradas registradas para este dia')
      return
    }

    if (!descricaoDespesa && despesasExtrasNum > 0) {
      setError('Informe a descrição da despesa extra')
      return
    }

    if (despesasExtrasNum > 0) {
      await supabase.from('despesas').insert({
        descricao: descricaoDespesa,
        valor: despesasExtrasNum,
        created_at: new Date().toISOString()
      })
    }

    const tipo = totais.caixaTotal >= 0 ? 'positivo' : 'negativo'

    setResultadoFechamento({
      total: totais.caixaTotal,
      tipo
    })

    setTimeout(() => {
      setCortesias('')
      setEmpresas('')
      setDespesasExtras('')
      setDescricaoDespesa('')
      setResultadoFechamento(null)
    }, 2000)
  }

  /* ==================== DELETE ==================== */

  const handleDeleteDespesa = async (id: string) => {
    await supabase.from('despesas').delete().eq('id', id)
    setDespesas(despesas.filter(d => d.id !== id))
    setConfirmacaoDel({ mostrar: false, id: null })
  }

  /* ==================== RENDER ==================== */

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <div className="header-content">
          <div>
            <h1>Fechamento</h1>
            <p className="subtitle">Consolidar receitas e despesas do dia</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="fechamento-container">
        <div className="fechamento-grid">
          {/* Coluna Esquerda */}
          <div className="fechamento-column">
            {/* Card Receita */}
            <div className="card receita-card">
              <h2>Receita do Dia</h2>
              <div className="valor-grande positivo">
                R$ {entradasDia.toFixed(2)}
              </div>
            </div>

            {/* Card Despesas */}
            <div className="card despesas-card">
              <h2>Despesas do Dia</h2>
              {despesas.length === 0 ? (
                <p className="empty-state">Nenhuma despesa registrada</p>
              ) : (
                <ul className="lista-saidas">
                  {despesas.map(d => (
                    <li key={d.id} className="saida-item">
                      <div className="saida-info">
                        <span className="saida-descricao">{d.descricao}</span>
                        <span className="saida-valor">R$ {d.valor.toFixed(2)}</span>
                      </div>
                      <button
                        className="btn-remover"
                        onClick={() => setConfirmacaoDel({ mostrar: true, id: d.id })}
                        title="Remover despesa"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Coluna Direita */}
          <div className="fechamento-column">
            {/* Card Ajustes */}
            <div className="card ajustes-card">
              <h2>Ajustes</h2>
              <div className="ajustes-grid">
                {[
                  ['Máquina / PIX', maquinapix, setMaquinapix],
                  ['Dinheiro', dinheiro, setDinheiro],
                  ['Cortesias', cortesias, setCortesias],
                  ['Empresas', empresas, setEmpresas]
                ].map(([label, value, setter]: any) => (
                  <div className="ajuste-card" key={label}>
                    <label>
                      <span className="icon"><MdAttachMoney /></span>
                      {label}
                    </label>
                    <input
                      type="number"
                      value={value}
                      onChange={e => setter(e.target.value)}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                ))}
              </div>

              <div className="ajuste-card extra">
                <label>
                  <span className="icon"><MdAttachMoney /></span>
                  Despesa Extra
                </label>
                <input
                  type="number"
                  value={despesasExtras}
                  onChange={e => setDespesasExtras(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                />
                <input
                  type="text"
                  placeholder="Descrição da despesa"
                  value={descricaoDespesa}
                  onChange={e => setDescricaoDespesa(e.target.value)}
                  disabled={despesasExtrasNum === 0}
                  className="input-descricao"
                />
              </div>
            </div>

            {/* Card Resultado */}
            <div className="card resultado-card">
              <h2>Resumo do Fechamento</h2>
              <div className="resumo-linhas">
                <div className="resumo-linha">
                  <span>Receita Bruta</span>
                  <span className="valor">R$ {entradasDia.toFixed(2)}</span>
                </div>
                <div className="resumo-linha">
                  <span>- Dinheiro</span>
                  <span className="valor negativo">- R$ {(parseFloat(dinheiro) || 0).toFixed(2)}</span>
                </div>
                <div className="resumo-linha">
                  <span>- Máquina/PIX</span>
                  <span className="valor negativo">- R$ {(parseFloat(maquinapix) || 0).toFixed(2)}</span>
                </div>
                <div className="resumo-linha">
                  <span>- Cortesias</span>
                  <span className="valor negativo">- R$ {(parseFloat(cortesias) || 0).toFixed(2)}</span>
                </div>
                <div className="resumo-linha">
                  <span>- Despesas</span>
                  <span className="valor negativo">- R$ {totais.totalDespesas.toFixed(2)}</span>
                </div>
                <div className="resumo-separator"></div>
                <div className="resumo-linha">
                  <span>Caixa Imediato</span>
                  <span className={`valor destaque ${totais.caixaImediato >= 0 ? 'positivo' : 'negativo'}`}>
                    R$ {totais.caixaImediato.toFixed(2)}
                  </span>
                </div>
                <div className="resumo-linha">
                  <span>+ Empresas</span>
                  <span className="valor positivo">+ R$ {(parseFloat(empresas) || 0).toFixed(2)}</span>
                </div>
                <div className="resumo-separator"></div>
                <div className="resumo-linha total">
                  <span>Caixa Total</span>
                  <span className={`valor destaque ${totais.caixaTotal >= 0 ? 'positivo' : 'negativo'}`}>
                    R$ {totais.caixaTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {resultadoFechamento && (
                <div className={`resultado-banner ${resultadoFechamento.tipo}`}>
                  <p>
                    {resultadoFechamento.tipo === 'positivo' ? '✓ Fechamento Positivo' : '⚠ Fechamento Negativo'}
                  </p>
                  <p className="resultado-valor">
                    R$ {Math.abs(resultadoFechamento.total).toFixed(2)}
                  </p>
                </div>
              )}

              <button
                className="btn-fazer-fechamento"
                onClick={handleFazerFechamento}
                disabled={resultadoFechamento !== null}
              >
                Fazer Fechamento
              </button>
            </div>
          </div>
        </div>
      </div>

      {confirmacaoDel.mostrar && (
        <div className="confirmacao-modal-overlay" onClick={() => setConfirmacaoDel({ mostrar: false, id: null })}>
          <div className="confirmacao-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirmacao-header">
              <h3>Confirmar Remoção</h3>
              <button
                className="confirmacao-close"
                onClick={() => setConfirmacaoDel({ mostrar: false, id: null })}
              >
                <IoClose />
              </button>
            </div>
            <p className="confirmacao-texto">
              Deseja remover esta despesa? Esta ação não pode ser desfeita.
            </p>
            <div className="confirmacao-buttons">
              <button
                className="btn-cancelar"
                onClick={() => setConfirmacaoDel({ mostrar: false, id: null })}
              >
                Cancelar
              </button>
              <button
                className="btn-confirmar"
                onClick={() => {
                  if (confirmacaoDel.id) {
                    handleDeleteDespesa(confirmacaoDel.id)
                  }
                }}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
