import React from 'react';
import Logo from '../assets/img/Logo.svg';

function LogoIcon() {
  return <img src={Logo} alt="brev.ly" className="w-20 h-20" />;
}

export function Header() { 
  return (
    <header className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-start">
      <LogoIcon />
    </header> 
  );
}