import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Link as LinkIcon } from 'lucide-react';
import { BACKEND } from "../utils/constants"

export function RedirectPage() { 
  const { short } = useParams<{ short: string }>(); 
  const navigate = useNavigate(); 
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => { 
    if (short) { 
      window.location.replace(`${BACKEND}/${short}`);
    } else {
      setError('Código curto não fornecido.');
    }
  }, [short]); 
  
  if (error) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg">
        <X className="w-12 h-12 mb-4 text-red-500 mx-auto"/>
        <h2 className="text-2xl font-bold text-red-500 mb-4">Link Não Encontrado</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">
          Voltar para Home
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg">
        <LinkIcon className="w-12 h-12 mb-4 text-indigo-500 animate-pulse mx-auto"/>
        <h2 className="text-2xl font-semibold text-gray-800">Redirecionando...</h2>
        <p className="text-gray-600 mt-2">Aguarde um momento enquanto processamos o seu link.</p>
      </div>
    </div>
  );
}