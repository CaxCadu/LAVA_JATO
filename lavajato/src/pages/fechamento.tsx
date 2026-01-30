import { useState, useEffect } from 'react'
import '../styles/fechamento.css'
import { supabase } from '../services/supabaseClient'
import { MdAttachMoney, MdDelete } from 'react-icons/md'
import { IoClose } from 'react-icons/io5'

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

  /* ==================== FETCH RECEITA DO DIA ==================== */

  useEffect(() => {
    const fetchReceitaDia = async () => {
      const { data, error } = await supabase
        .from('receitadia')
        .select('entradas')
        .eq('data', dataFechamento)
        .single()

      if (error) {
        console.error(error)
        setEntradasDia(0)
        return
      }

      setEntradasDia(data?.entradas || 0)
    }

    const fetchDespesas = async () => {
      const inicio = new Date(dataFechamento)
      inicio.setHours(0, 0, 0, 0)

      const fim = new Date(dataFechamento)
      fim.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from('despesas')
        .select('*')
        .gte('created_at', inicio.toISOString())
        .lte('created_at', fim.toISOString())
        .order('created_at', { ascending: false })

      if (!error) setDespesas(data || [])
    }

    fetchReceitaDia()
    fetchDespesas()
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

    // Reset após 2 segundos
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
            <p className="subtitle">Consolidar receitas, despesas e entradas do dia</p>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      <div className="fechamento-container">
        <div className="fechamento-grid-single">
          <div className="fechamento-section">
            <h2>Entradas do Dia</h2>

            <div className="resumo-card destaque">
              <div className="resumo-header">
                <h3>Receita Bruta</h3>
              </div>
              <div className="valor-principal">R$ {entradasDia.toFixed(2)}</div>
            </div>

            <h2 style={{ marginTop: '32px' }}>Ajustes e Deduções</h2>

            <div className="ajuste-card">
              <label>
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Máquina/PIX
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={maquinapix}
                onChange={e => setMaquinapix(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Reduz o total final</span>
            </div>
            <div className="ajuste-card">
              <label>
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Dinheiro
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={dinheiro}
                onChange={e => setDinheiro(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Reduz o total final</span>
            </div>
            <div className="ajuste-card">
              <label>
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Cortesias
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={cortesias}
                onChange={e => setCortesias(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Reduz o total final</span>
            </div>

            <div className="ajuste-card">
              <label>
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Empresas (A Receber)
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={empresas}
                onChange={e => setEmpresas(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Não entra como caixa imediato</span>
            </div>

            <div className="ajuste-card">
              <label>
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Despesas Extras
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={despesasExtras}
                onChange={e => setDespesasExtras(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <input
                type="text"
                placeholder="Descrição da despesa"
                value={descricaoDespesa}
                onChange={e => setDescricaoDespesa(e.target.value)}
                className="ajuste-input descricao-input"
                disabled={despesasExtrasNum === 0}
              />
              <span className="ajuste-descricao">Será adicionada às despesas do dia</span>
            </div>

            {despesas.length > 0 && (
              <div className="ajuste-card saidas-card">
                <div className="saidas-header">
                  <label style={{ margin: 0 }}>
                    <span className="form-icon-wrapper">
                      <MdAttachMoney />
                    </span>
                    Saídas Registradas
                  </label>
                  <span className="saidas-count">{despesas.length}</span>
                </div>
                <div className="saidas-lista">
                  {despesas.map(d => (
                    <div key={d.id} className="saida-item">
                      <div className="saida-info">
                        <span className="saida-descricao">{d.descricao}</span>
                        <span className="saida-valor">R$ {d.valor.toFixed(2)}</span>
                      </div>
                      <button
                        className="btn-saida-delete"
                        onClick={() => setConfirmacaoDel({ mostrar: true, id: d.id })}
                        title="Remover saída"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="resumo-card">
              <div className="resumo-header">
                <h3>Resumo do Fechamento</h3>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">Receita Bruta</span>
                <span className="resumo-valor">R$ {entradasDia.toFixed(2)}</span>
              </div>

              <div className="resumo-linha separator"></div>

              <div className="resumo-linha">
                <span className="resumo-label">- Dinheiro</span>
                <span className="resumo-valor negativo">- R$ {totais.dinheiro.toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">- Máquina/PIX</span>
                <span className="resumo-valor negativo">- R$ {totais.maquinapix.toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">- Cortesias</span>
                <span className="resumo-valor negativo">- R$ {totais.cortesias.toFixed(2)}</span>
              </div>
            
              <div className="resumo-linha">
                <span className="resumo-label">- Despesas</span>
                <span className="resumo-valor negativo">
                  - R$ {totais.totalDespesas.toFixed(2)}
                </span>
              </div>

              <div className="resumo-linha separator"></div>

              <div className="resumo-linha destaque">
                <span className="resumo-label">Caixa Imediato</span>
                <span className={`resumo-valor ${totais.caixaImediato >= 0 ? 'positivo' : 'negativo'}`}>
                  R$ {totais.caixaImediato.toFixed(2)}
                </span>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">+ A Receber (Empresas)</span>
                <span className="resumo-valor positivo">+ R$ {totais.empresas.toFixed(2)}</span>
              </div>

              <div className="resumo-linha separator"></div>

              <div className="resumo-linha total">
                <span className="resumo-label">Total (Caixa + Empresas)</span>
                <span className={`resumo-valor highlight ${totais.caixaTotal >= 0 ? 'positivo' : 'negativo'}`}>
                  R$ {totais.caixaTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {resultadoFechamento && (
              <div className={`resultado-fechamento ${resultadoFechamento.tipo}`}>
                <p className="resultado-titulo">
                  {resultadoFechamento.tipo === 'positivo' ? '✓ Fechamento Positivo' : '⚠ Fechamento Negativo'}
                </p>
                <p className="resultado-valor">
                  R$ {Math.abs(resultadoFechamento.total).toFixed(2)}
                </p>
              </div>
            )}

            <button
              className="btn-salvar-fechamento"
              onClick={handleFazerFechamento}
              disabled={resultadoFechamento !== null}
            >
              Fazer Fechamento
            </button>
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
              Deseja remover esta saída? Esta ação não pode ser desfeita.
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