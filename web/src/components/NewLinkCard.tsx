import React, { useState } from "react";
import { RefreshCw } from 'lucide-react';
import { BACKEND, SHORT_CODE_REGEX } from "../utils/constants";

interface NewLinkCardProps {
  onCreated: () => void;
}

export function NewLinkCard({ onCreated }: NewLinkCardProps) { 
  const [originalUrl, setOriginalUrl] = useState(''); 
  const [shortCode, setShortCode] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  
  async function handleSubmit(e?: React.FormEvent) { 
    if (e) e.preventDefault(); 
    setError(null); 
    
    try { 
      const url = originalUrl.trim(); 
      if (!url) throw new Error('Informe a URL original'); 
      
      let validated = url; 
      // Garante que a URL comece com http(s)
      if (!/^https?:\/\//i.test(validated)) validated = 'https://' + validated; 
      
      try { 
        new URL(validated); 
      } catch { 
        throw new Error('URL original inválida'); 
      } 
      
      if (shortCode) { 
        if (!SHORT_CODE_REGEX.test(shortCode)) throw new Error('Formato inválido'); 
      } 
      
      setLoading(true); 
      
      const payload: any = { original_url: validated }; 
      if (shortCode) payload.short_code = shortCode; 
      
      const res = await fetch(`${BACKEND}/links`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload) 
      }); 
      
      if (res.status === 201) { 
        setOriginalUrl(''); 
        setShortCode(''); 
        onCreated(); 
      } else if (res.status === 409) { 
        const data = await res.json(); 
        setError(data.error || 'Short já existe');
      } else { 
        const data = await res.json().catch(() => ({})); 
        setError(data.error || `Erro ${res.status}`);
      } 
    } catch (err: any) { 
      setError(err.message || String(err));
    } finally { 
      setLoading(false); 
    } 
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full h-full min-h-[350px]">
      <h3 className="text-xl font-semibold mb-6 text-gray-800">Novo link</h3>
      
      <label className="block text-xs font-medium text-gray-700 mb-1">LINK ORIGINAL</label>
      <input 
        placeholder="www.exemplo.com.br" 
        value={originalUrl} 
        onChange={e => setOriginalUrl(e.target.value)} 
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-gray-500"
        required
      />
      
      <label className="block text-xs font-medium text-gray-700 mb-1">LINK ENCURTADO</label>
      <div className="flex mb-8">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg font-medium">
          brev.ly/
        </span>
        <input 
          placeholder="meu-link" 
          value={shortCode} 
          onChange={e => setShortCode(e.target.value)} 
          className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-indigo-300 focus:border-indigo-300 min-w-0"
        />
      </div>
      
      {error && (
        <div className="text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-200 text-sm font-medium">
          {error}
        </div>
      )}
      
      <button 
        disabled={loading} 
        className="w-full p-3 bg-indigo-400 text-white font-medium rounded-lg hover:bg-indigo-500 transition duration-150 disabled:bg-indigo-200 disabled:text-gray-500 flex items-center justify-center gap-2 shadow-md"
      >
        {loading ? <RefreshCw size={18} className="animate-spin" /> : 'Salvar link'}
      </button>
    </form>
  );
}