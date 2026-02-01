import '../App.css'
import '../styles/forms.css'
import '../styles/checkbox.css'
import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

type Estacionamento = {
  id: number
  categoria: string
  placa: string
  valor: number
  pagamento: string
  pago: boolean
  created_at: string
}

export function Estacionamento() {
  const [estacionamentos, setEstacionamentos] = useState<Estacionamento[]>([])

  const [categoria, setCategoria] = useState('')
  const [placa, setPlaca] = useState('')
  const [valor, setValor] = useState<number | ''>('')
  const [pagamento, setPagamento] = useState('')
  const [pago, setPago] = useState(false)

  // 🔹 BUSCA OS DADOS AO CARREGAR A PÁGINA
  useEffect(() => {
    const fetchEstacionamentos = async () => {
      const { data, error } = await supabase
        .from('estacionamento')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar estacionamentos:', error)
        return
      }

      setEstacionamentos(data || [])
    }

    fetchEstacionamentos()
  }, [])

  // 🔹 ATUALIZA STATUS DE PAGAMENTO
  const updatePago = async (id: number, pagoAtual: boolean) => {
    const { error } = await supabase
      .from('estacionamento')
      .update({ pago: !pagoAtual })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar pagamento:', error)
      return
    }

    setEstacionamentos(prev =>
      prev.map(e =>
        e.id === id ? { ...e, pago: !pagoAtual } : e
      )
    )
  }

  // 🔹 DELETA ESTACIONAMENTO
  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja apagar este estacionamento?')) {
      return
    }

    const { error } = await supabase
      .from('estacionamento')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao apagar estacionamento:', error)
      return
    }

    setEstacionamentos(prev => prev.filter(e => e.id !== id))
  }

  // 🔹 REGISTRA NOVO ESTACIONAMENTO
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!categoria || !placa || !valor || !pagamento) {
      alert('Preencha todos os campos')
      return
    }

    const { data, error } = await supabase
      .from('estacionamento')
      .insert({
        categoria,
        placa,
        valor,
        pagamento,
        pago
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao registrar estacionamento:', error)
      return
    }

    setEstacionamentos(prev => [data, ...prev])

    setCategoria('')
    setPlaca('')
    setValor('')
    setPagamento('')
    setPago(false)
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Estacionamento</h1>
        <p className="subtitle">Registre e acompanhe os estacionamentos</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Registrar Novo Estacionamento</h2>

            <select value={categoria} onChange={e => setCategoria(e.target.value)}>
              <option value="">Selecione a categoria</option>
              <option value="particular">Particular</option>
              <option value="aplicativo">Aplicativo</option>
              <option value="militar">Militar</option>
            </select>

            <select value={pagamento} onChange={e => setPagamento(e.target.value)}>
              <option value="">Selecione o pagamento</option>
              <option value="sim">Máquina / PIX</option>
              <option value="nao">Dinheiro</option>
            </select>

            <input
              type="text"
              placeholder="Placa do veículo"
              value={placa}
              onChange={e => setPlaca(e.target.value)}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Valor"
              value={valor}
              onChange={e => setValor(Number(e.target.value))}
            />

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={pago}
                onChange={e => setPago(e.target.checked)}
              />
              <span>Já foi pago?</span>
            </label>

            <button type="submit">Registrar Estacionamento</button>
          </form>

          <div className="list-section">
            <h2>Estacionamentos Registrados</h2>

            {estacionamentos.length === 0 ? (
              <p className="empty-message">Nenhum estacionamento registrado.</p>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Placa</th>
                      <th>Categoria</th>
                      <th>Valor</th>
                      <th>Pagamento</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {estacionamentos.map(e => (
                      <tr key={e.id} className={e.pago ? 'pago' : 'pendente'}>
                        <td><strong>{e.placa}</strong></td>
                        <td>{e.categoria}</td>
                        <td>R$ {e.valor.toFixed(2)}</td>
                        <td>{e.pagamento === 'sim' ? 'Máquina/PIX' : 'Dinheiro'}</td>
                        <td>
                          <span className={`status-badge ${e.pago ? 'pago' : 'pendente'}`}>
                            {e.pago ? 'Pago' : 'Pendente'}
                          </span>
                        </td>
                        <td>
                          {!e.pago && (
                            <button
                              className="btn-action"
                              onClick={() => updatePago(e.id, e.pago)}
                            >
                              Marcar Pago
                            </button>
                          )}
                          <button
                            className="btn-action btn-delete"
                            onClick={() => handleDelete(e.id)}
                          >
                            Apagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Estacionamento
