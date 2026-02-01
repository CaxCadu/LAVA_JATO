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
  categoria: string
  sexo: string
}

type FormData = {
  nome: string
  telefone: string
  data_nascimento: string
  placa: string
  ano_carro: string
  modelo: string
  categoria: string
  sexo: string
}

export function Clientes() {
  const [showForm, setShowForm] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    telefone: '',
    data_nascimento: '',
    placa: '',
    ano_carro: '',
    modelo: '',
    categoria: 'particular',
    sexo: '',
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      categoria,
      sexo,
    } = formData

    if (!nome || !telefone || !placa) {
      alert('Preencha os campos obrigatórios')
      return
    }

    // Se estiver editando
    if (editingId !== null) {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome,
          telefone,
          placa,
          modelo,
          ano_carro,
          categoria,
          sexo,
          data_nascimento: data_nascimento || null,
        })
        .eq('id', editingId)

      if (error) {
        console.error(error)
        alert('Erro ao atualizar cliente')
        return
      }

      await loadInitialData()
      setShowForm(false)
      setEditingId(null)
      setFormData({
        nome: '',
        telefone: '',
        data_nascimento: '',
        placa: '',
        ano_carro: '',
        modelo: '',
        categoria: 'particular',
        sexo: '',
      })
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
        categoria,
        sexo,
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
      categoria: 'particular',
      sexo: '',
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

  const handleEditCliente = (cliente: Cliente) => {
    setEditingId(cliente.id)
    setFormData({
      nome: cliente.nome,
      telefone: cliente.telefone,
      data_nascimento: cliente.data_nascimento || '',
      placa: cliente.placa,
      ano_carro: cliente.ano_carro,
      modelo: cliente.modelo,
      categoria: cliente.categoria,
      sexo: cliente.sexo,
    })
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nome: '',
      telefone: '',
      data_nascimento: '',
      placa: '',
      ano_carro: '',
      modelo: '',
      categoria: 'particular',
      sexo: '',
    })
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Clientes</h1>
        <p className="subtitle">Gerencie clientes e veículos</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          {showForm && (
            <form onSubmit={handleAddCliente} className="form-card">
              <h2>{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>

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

              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" value={formData.categoria} onChange={handleInputChange}>
                <option value="particular">Particular</option>
                <option value="militar">Militar</option>
                <option value="aplicativo">Aplicativo</option>
              </select>

              <label htmlFor="sexo">Sexo</label>
              <select id="sexo" value={formData.sexo} onChange={handleInputChange}>
                <option value="">Selecione</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
              </select>

              <div className="form-buttons">
                <button type="submit">{editingId ? 'Atualizar' : 'Salvar'}</button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

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
              <h2>Lista de Clientes ({clientes.length})</h2>
              
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Pesquisar por nome, telefone, placa ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="clientes-list">
                {clientes
                  .filter(cliente =>
                    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    cliente.telefone.includes(searchTerm) ||
                    cliente.placa.toUpperCase().includes(searchTerm.toUpperCase()) ||
                    cliente.categoria.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(cliente => (
                  <div key={cliente.id} className="cliente-card">
                    <div className="cliente-info">
                      <h3>{cliente.nome}</h3>
                      <p><strong>Telefone:</strong> {cliente.telefone}</p>
                      {cliente.data_nascimento && (
                      <p><strong>Nascimento:</strong> {cliente.data_nascimento}</p>
                      )}
                      <p><strong>Categoria:</strong> {cliente.categoria}</p>
                      <p><strong>Placa:</strong> {cliente.placa}</p>
                      <p><strong>Modelo:</strong> {cliente.modelo}</p>
                      <p><strong>Ano:</strong> {cliente.ano_carro}</p>
                      <p><strong>Sexo:</strong> {cliente.sexo}</p>
                    </div>
                    <div className="cliente-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditCliente(cliente)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteCliente(cliente.id)}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Clientes
