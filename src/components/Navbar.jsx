import './Navbar.css'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <a href="#home" className="navbar-logo">
          🧠 THINKER
        </a>
      </div>
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#about">About</a></li>
        <li><a href="#meme">Meme</a></li>
      </ul>
      <div className="navbar-right" aria-hidden="true" />
    </nav>
  )
}
