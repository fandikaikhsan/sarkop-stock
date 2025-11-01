
import React from 'react';

const Header: React.FC = () => {
    return (
        <header className="text-center">
            <div className="inline-block relative mb-2">
                <h1 className="text-6xl md:text-7xl font-serif font-bold text-white tracking-tight" style={{fontFamily: "'Playfair Display', serif"}}>
                    Sark<span className="relative">o</span>p.
                </h1>
                <div className="absolute flex items-center justify-center" style={{ top: '22%', left: '50.5%', width: '3.5rem', height: '3.5rem' }}>
                    <div className="absolute w-12 h-12 bg-white rounded-full"></div>
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-8 bg-white/80"
                            style={{
                                transform: `rotate(${i * 30}deg) translateY(-1.5rem)`,
                                transformOrigin: 'center 2.2rem',
                                clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)'
                            }}
                        />
                    ))}
                </div>
            </div>
            <p className="text-white/80 text-lg">Daily Stock Monitoring</p>
        </header>
    );
};

export default Header;
