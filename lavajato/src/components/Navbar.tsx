import './Navbar.css'

export function Navbar({ title }: { title: string }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">{title}</h1>
      </div>
    </nav>
  )
}
