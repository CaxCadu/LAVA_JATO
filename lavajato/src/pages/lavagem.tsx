import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import { supabase } from '../services/supabaseClient'

interface Lavador {
  id: number
  nome: string
}

interface Lavagem {
  id: number
  lavador_id: number
  categoria: string
  placa: string
  valor: number
  created_at: string
  lavadores: {
    nome: string
  }
}

export function Lavagem() {
  const [lavadores, setLavadores] = useState<Lavador[]>([])
  const [lavagens, setLavagens] = useState<Lavagem[]>([])
  const [formData, setFormData] = useState({
    lavador: '',
    categoria: '',
    placa: '',
    valor: '',
  })

  const loadData = async () => {
    const { data: lavData, error: lErr } = await supabase.from('lavadores').select('*').order('nome')
    if (lErr) console.error('Erro lavadores:', lErr)
    else setLavadores((lavData as any) || [])

    const { data: lavsData, error: lavsErr } = await supabase
      .from('lavagens')
      .select(`
        *,
        lavadores (
          nome
        )
      `)
      .order('created_at', { ascending: false })
    if (lavsErr) console.error('Erro lavagens:', lavsErr)
    else setLavagens((lavsData as any) || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.lavador || !formData.categoria || !formData.placa || !formData.valor) {
      alert('Preencha todos os campos!')
      return
    }


    const { error } = await supabase.from('lavagens').insert({
      lavador_id: Number(formData.lavador),
      categoria: formData.categoria,
      placa: formData.placa,
      valor: Number(formData.valor),
    })

    if (error) {
      console.error('Erro inserir lavagem:', error)
      alert('Erro ao registrar lavagem')
    } else {
      setFormData({ lavador: '', categoria: '', placa: '', valor: '' })
      loadData()
    }
  }

  const handleDeleteLavagem = async (id: number) => {
    if (!confirm('Remover lavagem?')) return
    const { error } = await supabase.from('lavagens').delete().eq('id', id)
    if (error) console.error('Erro deletar lavagem:', error)
    else setLavagens((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="page-wrapper">
      <header className="page-header">
        <h1>Lavagem</h1>
        <p className="subtitle">Registre as lavagens realizadas</p>
      </header>

      <main className="page-content">
        <div className="content-container">
          <form onSubmit={handleSubmit} className="form-card">
            <h2>Registrar Nova Lavagem</h2>
            
            <select 
              name="lavador" 
              id="lavador" 
              value={formData.lavador} 
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um lavador</option>
              {lavadores.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.nome}</option>
              ))}
            </select>

            <select 
              name="categoria" 
              id="categoria" 
              value={formData.categoria} 
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione a categoria</option>
              <option value="particular">Particular</option>
              <option value="aplicativo">Aplicativo</option>
              <option value="militar">Militar</option>
            </select>

            <input 
              type="text" 
              name="placa" 
              placeholder="Placa do veículo" 
              value={formData.placa} 
              onChange={handleInputChange}
              required
            />

            <input 
              type="number" 
              step="0.01"
              name="valor" 
              placeholder="Valor" 
              value={formData.valor} 
              onChange={handleInputChange}
              required
            />

            <button type="submit">Registrar Lavagem</button>
          </form>

          <div className="list-section">
            <h2>Serviços Registrados</h2>
            {lavagens.length === 0 ? (
              <p className="empty-message">Nenhuma lavagem registrada.</p>
            ) : (
              <div className="lavagens-list">
                {lavagens.map((lav) => (
                  <div key={lav.id} className="lavagem-card">
                    <div className="lavagem-info">
                      <div className="info-row">
                        <span className="info-label">Lavador:</span>
                        <span className="info-value">{lav.lavadores?.nome || 'Desconhecido'}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Categoria:</span>
                        <span className="info-value">{lav.categoria}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Placa:</span>
                        <span className="info-value">{lav.placa}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Valor:</span>
                        <span className="info-value highlight">R$ {lav.valor.toFixed(2)}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Data:</span>
                        <span className="info-value">{new Date(lav.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                    <button className="btn-delete" onClick={() => handleDeleteLavagem(lav.id)}>Remover</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Lavagem
