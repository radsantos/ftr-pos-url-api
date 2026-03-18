import React from "react";
import { Link } from "react-router-dom";

export function NotFound() { 
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg">
        <h1 className="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Página Não Encontrada</h2>
        <p className="text-lg text-gray-600 mb-6">
          Parece que você se perdeu. O link que você tentou acessar pode não existir.
        </p>
        <Link to={'/'} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
          Ir para Home
        </Link>
      </div>
    </div>
  ); 
}