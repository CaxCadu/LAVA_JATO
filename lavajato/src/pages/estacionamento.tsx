import '../App.css'
import '../styles/forms.css'
import '../styles/checkbox.css'
import { useState, useEffect } from 'react'
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

  const loadEstacionamentos = async () => {
    const { data, error } = await supabase
      .from('estacionamento')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao carregar estacionamentos:', error)
      return
    }

    setEstacionamentos(data ?? [])
  }

  const updatePago = async (id: number, pagoAtual: boolean) => {
    const { error } = await supabase
      .from('estacionamento')
      .update({ pago: !pagoAtual })
      .eq('id', id)

    if (error) {
      console.error('Erro ao atualizar pagamento:', error)
      return
    }

    // atualiza lista localmente
    setEstacionamentos((prev) =>
      prev.map((e) => (e.id === id ? { ...e, pago: !pagoAtual } : e))
    )
  }

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

    // atualiza lista sem refetch
    setEstacionamentos((prev) => [data, ...prev])

    // limpa form
    setCategoria('')
    setPlaca('')
    setValor('')
    setPagamento('')
    setPago(false)
  }

  return (
    <>
      <h1>Estacionamento</h1>

      <form onSubmit={handleSubmit}>
        <label>Registrar novo estacionamento</label>

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          <option value="">Selecione a categoria</option>
          <option value="particular">Particular</option>
          <option value="aplicativo">Aplicativo</option>
          <option value="militar">Militar</option>
        </select>

        <select name="pagamento" id="pagamento" value={pagamento} onChange={(e) => setPagamento(e.target.value)}>
          <option value="">Selecione o pagamento</option>
          <option value="sim">Maquina/PIX</option>
          <option value="nao">Dinheiro</option>
        </select>

        <input
          type="text"
          placeholder="Placa do veículo"
          value={placa}
          onChange={(e) => setPlaca(e.target.value)}
        />

        <input
          type="number"
          placeholder="Valor"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
        />
        <label htmlFor="">Está pago?</label>
 
        <div className="container">
          <input
            type="checkbox"
            className="checkbox"
            id="checkbox"
            checked={pago}
            onChange={(e) => setPago(e.target.checked)}
        />
        
        <label className="switch" htmlFor="checkbox">
          <span className="slider"></span>
        </label>
        </div>


        <button type="submit">
          Registrar Estacionamento
        </button>
      </form>

      <div className="services-section">
        <label>Serviços registrados:</label>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Placa</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Categoria</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Valor</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Pagamento</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Pago</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {estacionamentos.map((e) => (
              <tr key={e.id} style={{ border: '1px solid #ddd' }}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><strong>{e.placa}</strong></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{e.categoria}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>R$ {e.valor}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{e.pagamento === 'sim' ? 'Maquina/PIX' : 'Dinheiro'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{e.pago ? 'Sim' : 'Não'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {!e.pago && (
                    <button onClick={() => updatePago(e.id, e.pago)} style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                      Marcar como Pago
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default Estacionamento
