import React from "react"

const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-block relative mb-2">
        {/* <img
          src="/assets/sarkop_logo.jpg"
          alt="Sarkop Logo"
          width={200}
          height={200}
        /> */}
        <h1
          className="text-6xl md:text-7xl font-serif font-bold text-white tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sark<span className="relative">o</span>p.
        </h1>
      </div>
      <p className="text-white/80 text-lg">Daily Stock Monitoring</p>
    </header>
  )
}

export default Header
