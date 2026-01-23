import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { IoClose } from 'react-icons/io5'
import { MdDescription, MdAttachMoney } from 'react-icons/md'
import '../styles/saida-modal.css'

type SaidaModalProps = {
  isOpen: boolean
  onClose: () => void
  onSaidaRegistered?: () => void
}

export function SaidaModal({ isOpen, onClose, onSaidaRegistered }: SaidaModalProps) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validação
    if (!descricao.trim()) {
      setError('Descrição é obrigatória')
      return
    }

    if (!valor || parseFloat(valor) <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('despesas')
        .insert([
          {
            descricao: descricao.trim(),
            valor: parseFloat(valor),
          },
        ])

      if (insertError) {
        throw insertError
      }

      setSuccess('Saída registrada com sucesso!')
      setDescricao('')
      setValor('')

      // Aguarda um momento e fecha o modal
      setTimeout(() => {
        onClose()
        onSaidaRegistered?.()
      }, 1500)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao registrar saída'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="saida-modal-overlay" onClick={onClose}>
      <div className="saida-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="saida-modal-header">
          <h2>Registrar Saída Financeira</h2>
          <button className="saida-modal-close" onClick={onClose}>
            <IoClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="saida-modal-form">
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="descricao">
                <span className="form-icon-wrapper">
                  <MdDescription />
                </span>
                Descrição
              </label>
              <input
                type="text"
                id="descricao"
                placeholder="Ex: Compra de sabão, manutenção, combustível..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                disabled={loading}
                maxLength={100}
                className={descricao.trim() ? 'filled' : ''}
              />
              <div className="form-counter">
                <span className={descricao.length > 80 ? 'warning' : ''}>
                  {descricao.length}/100
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="valor">
                <span className="form-icon-wrapper">
                  <MdAttachMoney />
                </span>
                Valor (R$)
              </label>
              <input
                type="number"
                id="valor"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                disabled={loading}
                step="0.01"
                min="0"
                className={valor ? 'filled' : ''}
              />
              {valor && (
                <div className="valor-preview">
                  Valor: <strong>R$ {parseFloat(valor).toFixed(2)}</strong>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="saida-modal-error">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div className="saida-modal-success">
              <span>✓</span> {success}
            </div>
          )}

          <div className="saida-modal-actions">
            <button type="button" onClick={onClose} disabled={loading} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-submit">
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Registrando...
                </>
              ) : (
                <>
                  ✓ Registrar Saída
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
