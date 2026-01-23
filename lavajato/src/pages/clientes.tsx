import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import { supabase } from '../services/supabaseClient'

type Cliente = {
  id: number
  nome: string
  telefone: string
  data_nascimento?: string
  placa: string
  modelo: string
  ano_carro: string
}

type FormData = {
  nome: string
  telefone: string
  data_nascimento: string
  placa: string
  ano_carro: string
  modelo: string
}

export function Clientes() {
  const [showForm, setShowForm] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    data_nascimento: '',
    placa: '',
    ano_carro: '',
    modelo: '',
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

    const {
      nome,
      telefone,
      data_nascimento,
      placa,
      ano_carro,
      modelo,
    } = formData

    if (!nome || !telefone || !placa) {
      alert('Preencha os campos obrigatórios')
      return
    }

    // 1️⃣ Cria cliente
    const { data: cliente, error: clienteErr } = await supabase
      .from('clientes')
      .insert({
        nome,
        telefone,
        placa,
        modelo,
        ano_carro,
        data_nascimento: data_nascimento || null,
      })
      .select('id')
      .single()

    if (clienteErr || !cliente) {
      console.error(clienteErr)
      alert('Erro ao cadastrar cliente')
      return
    }


    await loadInitialData()

    setFormData({
      nome: '',
      telefone: '',
      data_nascimento: '',
      placa: '',
      ano_carro: '',
      modelo: '',
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
      alert('Erro ao remover cliente')
      return
    }

    setClientes(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Clientes</h1>
        <p className="subtitle">Gerencie clientes e veículos</p>
      </header>

      <main className="page-content">
        <div className="content-container">
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
            <div className="list-section">
              <h2>Lista de Clientes</h2>
              <div className="clientes-list">
                {clientes.map(cliente => (
                  <div key={cliente.id} className="cliente-card">
                    <div className="cliente-info">
                      <h3>{cliente.nome}</h3>
                      <p><strong>Telefone:</strong> {cliente.telefone}</p>
                      {cliente.data_nascimento && (
                      <p><strong>Nascimento:</strong> {cliente.data_nascimento}</p>
                      )}
                      <p><strong>Placa:</strong> {cliente.placa}</p>
                      <p><strong>Modelo:</strong> {cliente.modelo}</p>
                      <p><strong>Ano:</strong> {cliente.ano_carro}</p>
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
            </div>
          )}

          {showForm && (
            <form onSubmit={handleAddCliente} className="form-card">
              <h2>Novo Cliente</h2>

              <label htmlFor="nome">Nome</label>
              <input id="nome" value={formData.nome} onChange={handleInputChange} />

              <label htmlFor="telefone">Telefone</label>
              <input id="telefone" value={formData.telefone} onChange={handleInputChange} />

              <label htmlFor="data_nascimento">Data de Nascimento</label>
              <input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={handleInputChange}
              />

              <label htmlFor="placa">Placa</label>
              <input id="placa" value={formData.placa} onChange={handleInputChange} />

              <label htmlFor="ano_carro">Ano</label>
              <input
                id="ano_carro"
                type="number"
                value={formData.ano_carro}
                onChange={handleInputChange}
              />

              <label htmlFor="modelo">Modelo</label>
              <input id="modelo" value={formData.modelo} onChange={handleInputChange} />

              <div className="form-buttons">
                <button type="submit">Salvar</button>
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
        </div>
      </main>
    </div>
  )
}

export default Clientes
