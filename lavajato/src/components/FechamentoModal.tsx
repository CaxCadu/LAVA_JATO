import { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { MdAttachMoney } from 'react-icons/md'
import '../styles/fechamento-modal.css'

type FechamentoModalProps = {
  isOpen: boolean
  onClose: () => void
  valorTotalDia: number
}

export function FechamentoModal({ isOpen, onClose, valorTotalDia }: FechamentoModalProps) {
  const [valueMaquinaPix, setValueMaquinaPix] = useState('')
  const [valueDinheiro, setValueDinheiro] = useState('')

  const maquinaPixNum = parseFloat(valueMaquinaPix) || 0
  const dinheiroNum = parseFloat(valueDinheiro) || 0
  const totalContabilizado = maquinaPixNum + dinheiroNum
  const saldo = valorTotalDia - totalContabilizado

  const handleReset = () => {
    setValueMaquinaPix('')
    setValueDinheiro('')
  }

  if (!isOpen) return null

  return (
    <div className="fechamento-modal-overlay" onClick={onClose}>
      <div className="fechamento-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="fechamento-modal-header">
          <h2>Fazer Fechamento do Dia</h2>
          <button className="fechamento-modal-close" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <div className="fechamento-modal-body">
          {/* Card do total do dia */}
          <div className="total-dia-card">
            <span className="total-dia-label">Receita Total do Dia</span>
            <span className="total-dia-value">R$ {valorTotalDia.toFixed(2)}</span>
          </div>

          {/* Calculadora */}
          <div className="calculadora-section">
            <div className="form-group">
              <label htmlFor="maquina-pix">
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Valor Máquina/PIX
              </label>
              <input
                type="number"
                id="maquina-pix"
                placeholder="0.00"
                value={valueMaquinaPix}
                onChange={(e) => setValueMaquinaPix(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dinheiro">
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Dinheiro
              </label>
              <input
                type="number"
                id="dinheiro"
                placeholder="0.00"
                value={valueDinheiro}
                onChange={(e) => setValueDinheiro(e.target.value)}
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Resumo de Cálculo */}
          <div className="resumo-calculo">
            <div className="resumo-row">
              <span className="resumo-label">Total Contabilizado</span>
              <span className="resumo-value">R$ {totalContabilizado.toFixed(2)}</span>
            </div>
            <div className="resumo-row separator"></div>
            <div className="resumo-row">
              <span className="resumo-label">Saldo</span>
              <span className={`resumo-value saldo ${saldo >= 0 ? 'positivo' : 'negativo'}`}>
                R$ {saldo.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Botões */}
          <div className="modal-actions">
            <button className="btn-secondary" onClick={handleReset}>
              Limpar
            </button>
            <button className="btn-primary" onClick={onClose}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
