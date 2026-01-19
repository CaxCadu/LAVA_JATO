import { useEffect, useState } from 'react'
import '../App.css'
import '../styles/forms.css'
import { supabase } from '../services/supabaseClient'

interface Lavador {
  id: number
  nome: string
  telefone?: string
}

export function Lavadores() {
  const [nome, setNome] = useState('')
  const [lavadores, setLavadores] = useState<Lavador[]>([])

  const load = async () => {
    const { data, error } = await supabase.from('lavadores').select('*').order('id', { ascending: false })
    if (error) console.error('Erro lavadores:', error)
    else setLavadores((data as any) || [])
  }

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome) return alert('Digite o nome do lavador')
    const { error } = await supabase.from('lavadores').insert({ nome }).select()
    if (error) console.error('Erro inserir lavador:', error)
    else {
      setNome('')
      load()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Remover lavador?')) return
    const { error } = await supabase.from('lavadores').delete().eq('id', id)
    if (error) console.error('Erro deletar lavador:', error)
    else setLavadores((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <>
      <h1>Lavadores</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="lavador">Nome do Lavador:</label>
        <input id="lavador" value={nome} onChange={(e) => setNome(e.target.value)} type="text" placeholder='Digite o nome do lavador'/>
        <button type="submit">Adicionar Lavador</button>
      </form>

      <div>
        <h2>Lista de Lavadores</h2>
        <div className="clientes-list">
          {lavadores.map((l) => (
            <div key={l.id} className="cliente-card">
              <div className="cliente-info">
                <h3>{l.nome}</h3>
                {l.telefone && <p><strong>Telefone:</strong> {l.telefone}</p>}
              </div>
              <button className="btn-delete" onClick={() => handleDelete(l.id)}>Remover</button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default Lavadores
