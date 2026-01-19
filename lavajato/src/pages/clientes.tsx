import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import { supabase } from '../services/supabaseClient'

type Cliente = {
  id: number
  nome: string
  telefone: string
}

export function Clientes() {
  const [showForm, setShowForm] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    placa: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }))
  }

  const loadInitialData = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      console.error('Erro ao carregar clientes:', error)
      return
    }

    setClientes(data ?? [])
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  const handleAddCliente = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.telefone || !formData.placa) {
      alert('Preencha todos os campos!')
      return
    }

    const { data: cliente, error: clienteErr } = await supabase
      .from('clientes')
      .insert({
        nome: formData.nome,
        telefone: formData.telefone,
      })
      .select('id, nome, telefone')
      .single()

    if (clienteErr || !cliente) {
      console.error(clienteErr)
      alert('Erro ao cadastrar cliente')
      return
    }

    const { error: veiculoErr } = await supabase
      .from('veiculos')
      .insert({
        cliente_id: cliente.id,
        placa: formData.placa,
      })

    if (veiculoErr) console.error('Erro ao cadastrar veículo:', veiculoErr)

    await loadInitialData()

    setFormData({
      nome: '',
      telefone: '',
      placa: '',
    })

    setShowForm(false)
  }

  const handleDeleteCliente = async (id: number) => {
    if (!confirm('Remover cliente e todos os dados relacionados?')) return

    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao remover cliente:', error)
      return
    }

    setClientes(prev => prev.filter(c => c.id !== id))
  }

  return (
    <>
      <h1>Clientes</h1>

      <div className="clientes-container">
        <h2>Lista de Clientes</h2>

        {!showForm && (
          <div className="btn-container">
            <button className="btn-add" onClick={() => setShowForm(true)}>
              + Adicionar Cliente
            </button>
          </div>
        )}

        {clientes.length === 0 ? (
          <p className="empty-message">Nenhum cliente cadastrado.</p>
        ) : (
          <div className="clientes-list">
            {clientes.map(cliente => (
              <div key={cliente.id} className="cliente-card">
                <div className="cliente-info">
                  <h3>{cliente.nome}</h3>
                  <p>
                    <strong>Telefone:</strong> {cliente.telefone}
                  </p>
                </div>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteCliente(cliente.id)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleAddCliente}>
          <label htmlFor="nome">Nome do Cliente:</label>
          <input
            id="nome"
            type="text"
            value={formData.nome}
            onChange={handleInputChange}
          />

          <label htmlFor="telefone">Telefone:</label>
          <input
            id="telefone"
            type="tel"
            value={formData.telefone}
            onChange={handleInputChange}
          />

          <label htmlFor="placa">Placa do Carro:</label>
          <input
            id="placa"
            type="text"
            value={formData.placa}
            onChange={handleInputChange}
          />

          <div className="form-buttons">
            <button type="submit">Adicionar Cliente</button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowForm(false)}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </>
  )
}

export default Clientes
