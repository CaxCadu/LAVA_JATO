import { useState, useEffect } from 'react'
import '../styles/fechamento.css'
import { supabase } from '../services/supabaseClient'
import { MdAttachMoney, MdDelete } from 'react-icons/md'
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

/* ==================== COMPONENTE PRINCIPAL ==================== */

export function Fechamento() {
  // Estados de dados
  const [despesas, setDespesas] = useState<Despesa[]>([])

  // Estados de campos do fechamento
  const [dinheroMaquina, setDinheroMaquina] = useState('')
  const [dinheiro, setDinheiro] = useState('')
  const [cortesias, setCortesias] = useState('')
  const [empresas, setEmpresas] = useState('')
  const [despesasExtras, setDespesasExtras] = useState('')
  const [descricaoDespesa, setDescricaoDespesa] = useState('')

  // Estados de UI
  const [resultadoFechamento, setResultadoFechamento] = useState<{ total: number; tipo: 'positivo' | 'negativo' } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmacaoDel, setConfirmacaoDel] = useState<ConfirmacaoDel>({ mostrar: false, id: null })
  const dataFechamento = new Date().toISOString().split('T')[0]

  // Calcular despesasExtrasNum uma única vez
  const despesasExtrasNum = parseFloat(despesasExtras) || 0

  /* ==================== FETCH DE DESPESAS ==================== */

  useEffect(() => {
    const fetchDespesas = async () => {
      try {
        const dataInicio = new Date(dataFechamento)
        const dataFim = new Date(dataFechamento)
        dataInicio.setHours(0, 0, 0, 0)
        dataFim.setHours(23, 59, 59, 999)

        const { data, error: err } = await supabase
          .from('despesas')
          .select('*')
          .gte('created_at', dataInicio.toISOString())
          .lte('created_at', dataFim.toISOString())
          .order('created_at', { ascending: false })

        if (err) throw err
        setDespesas(data || [])
      } catch (error) {
        console.error('Erro ao carregar despesas:', error)
      }
    }

    fetchDespesas()
  }, [dataFechamento])

  /* ==================== FUNÇÕES DE CÁLCULO ==================== */

  const calcularTotais = () => {
    const totalDespesasRegistradas = despesas.reduce((sum, d) => sum + (d.valor || 0), 0)

    const dinheroMaquinaNum = parseFloat(dinheroMaquina) || 0
    const dinheiroNum = parseFloat(dinheiro) || 0
    const cortesiasNum = parseFloat(cortesias) || 0
    const empresasNum = parseFloat(empresas) || 0
    const despesasExtrasNumLocal = parseFloat(despesasExtras) || 0

    const totalCaixa = dinheroMaquinaNum + dinheiroNum
    const totalDespesasGeral = totalDespesasRegistradas + despesasExtrasNumLocal
    const caixaImediato = totalCaixa - cortesiasNum - totalDespesasGeral
    const caixaTotal = caixaImediato + empresasNum

    return {
      dinheroMaquina: dinheroMaquinaNum,
      dinheiro: dinheiroNum,
      totalCaixa,
      despesasExtras: despesasExtrasNumLocal,
      totalDespesasRegistradas,
      totalDespesasGeral,
      cortesias: cortesiasNum,
      empresas: empresasNum,
      caixaImediato,
      caixaTotal
    }
  }

  const totais = calcularTotais()

  /* ==================== FUNÇÃO DE DELETAR SAÍDA ==================== */

  const handleDeleteDespesa = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from('despesas')
        .delete()
        .eq('id', id)

      if (err) throw err

      setDespesas(despesas.filter(d => d.id !== id))
      setConfirmacaoDel({ mostrar: false, id: null })
    } catch (error) {
      console.error('Erro ao deletar despesa:', error)
      alert('Erro ao remover saída')
    }
  }

  /* ==================== FUNÇÃO DE FAZER FECHAMENTO ==================== */

  const handleFazerFechamento = async () => {
    setError(null)
    
    try {
      // Validação: verificar se há valores inseridos
      if (totais.totalCaixa === 0 && totais.caixaTotal === 0) {
        setError('Insira pelo menos um valor para fazer o fechamento')
        return
      }

      // Validação: se houver despesa extra, deve ter descrição
      if (!descricaoDespesa && despesasExtrasNum > 0) {
        setError('Por favor, insira uma descrição para a despesa extra')
        return
      }

      // Se houver despesa extra, adicionar à tabela
      if (despesasExtrasNum > 0 && descricaoDespesa) {
        const { error: insertError } = await supabase
          .from('despesas')
          .insert({
            descricao: descricaoDespesa,
            valor: despesasExtrasNum,
            created_at: new Date(dataFechamento).toISOString()
          })

        if (insertError) throw insertError
        setDespesasExtras('')
        setDescricaoDespesa('')
      }

      const totalFinal = totais.caixaTotal
      const tipo = totalFinal >= 0 ? 'positivo' : 'negativo'

      setResultadoFechamento({ total: totalFinal, tipo })

      // Reset campos após 2 segundos
      setTimeout(() => {
        setDinheroMaquina('')
        setDinheiro('')
        setCortesias('')
        setEmpresas('')
        setDespesasExtras('')
        setDescricaoDespesa('')
        setResultadoFechamento(null)
      }, 2000)
    } catch (error) {
      console.error('Erro ao fazer fechamento:', error)
      setError('Erro ao fazer fechamento. Tente novamente.')
    }
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
          {/* Seção: Campos de Dinheiro e Ajustes */}
          <div className="fechamento-section">
            <h2>Entrada de Caixa</h2>

            {/* Card Dinheiro Máquina/PIX */}
            <div className="ajuste-card">
              <label>
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Dinheiro Máquina/PIX
              </label>
              <input
                type="number"
                placeholder="0.00"
                value={dinheroMaquina}
                onChange={(e) => setDinheroMaquina(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Valor recebido em máquina ou PIX</span>
            </div>

            {/* Card Dinheiro */}
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
                onChange={(e) => setDinheiro(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Valor recebido em dinheiro</span>
            </div>

            <h2 style={{ marginTop: '32px' }}>Ajustes e Deduções</h2>

            {/* Card Cortesias */}
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
                onChange={(e) => setCortesias(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Reduz o total final</span>
            </div>

            {/* Card Empresas (A Receber) */}
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
                onChange={(e) => setEmpresas(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <span className="ajuste-descricao">Não entra como caixa imediato</span>
            </div>

            {/* Card Despesas Extras */}
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
                onChange={(e) => setDespesasExtras(e.target.value)}
                step="0.01"
                min="0"
                className="ajuste-input"
              />
              <input
                type="text"
                placeholder="Descrição da despesa"
                value={descricaoDespesa}
                onChange={(e) => setDescricaoDespesa(e.target.value)}
                className="ajuste-input descricao-input"
                disabled={despesasExtrasNum === 0}
              />
              <span className="ajuste-descricao">Será adicionada às despesas do dia</span>
            </div>

            {/* Card Saídas Registradas */}
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

            {/* Card Resumo do Fechamento */}
            <div className="resumo-card">
              <div className="resumo-header">
                <h3>Resumo do Fechamento</h3>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">Máquina/PIX</span>
                <span className="resumo-valor">R$ {totais.dinheroMaquina.toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">Dinheiro</span>
                <span className="resumo-valor">R$ {totais.dinheiro.toFixed(2)}</span>
              </div>

              <div className="resumo-linha separator"></div>

              <div className="resumo-linha destaque">
                <span className="resumo-label">Total Caixa</span>
                <span className="resumo-valor">R$ {totais.totalCaixa.toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">- Cortesias</span>
                <span className="resumo-valor negativo">- R$ {totais.cortesias.toFixed(2)}</span>
              </div>

              <div className="resumo-linha">
                <span className="resumo-label">- Despesas</span>
                <span className="resumo-valor negativo">
                  - R$ {totais.totalDespesasGeral.toFixed(2)}
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

            {/* Resultado do Fechamento */}
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

            {/* Botão de Fazer Fechamento */}
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

      {/* Modal de Confirmação de Deleção */}
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