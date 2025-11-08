import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, Link } from "react-router-dom";
import { X, ExternalLink, Trash2, Download, RefreshCw, Link as LinkIcon } from 'lucide-react';

// Função para resolver a URL do backend 
function resolveBackendUrl(): string {
  try {
    const env = (import.meta as any)?.env;
    if (env && typeof env.VITE_BACKEND_URL === "string" && env.VITE_BACKEND_URL.trim() !== "") {
      return env.VITE_BACKEND_URL.replace(/\/$/, "");
    }
  } catch {}
  try {
    const p = (process as any)?.env;
    if (p && typeof p.VITE_BACKEND_URL === "string" && p.VITE_BACKEND_URL.trim() !== "") {
      return p.VITE_BACKEND_URL.replace(/\/$/, "");
    }
  } catch {}
  // URL de fallback
  return "http://localhost:3000"; 
}

const BACKEND = resolveBackendUrl();
// Regex para códigos curtos (min 4, max 64, alfanumérico, hífen, underline)
const SHORT_CODE_REGEX = /^[0-9A-Za-z_-]{4,64}$/;


type LinkItem = { 
  id: string; 
  originalUrl: string; // Espera camelCase
  shortCode: string;   // Espera camelCase
  accessCount: number; // Espera camelCase
  createdAt: string;   // Espera camelCase
};

// --- Hooks ---
function useFetchLinks(){ 
  const [items,setItems]=useState<LinkItem[]>([]); 
  const [loading,setLoading]=useState(false); 
  const [error,setError]=useState<string|null>(null);

  async function fetchList(){ 
    if (loading) return; // Garante que não haja fetches concorrentes
    setLoading(true); setError(null); 
    try{ 
      const res = await fetch(`${BACKEND}/links`); 
      if(!res.ok) throw new Error(`HTTP ${res.status}`); 
      const data = await res.json(); 
      
      console.log("Dados brutos recebidos da API:", data); 

      // O Backend retorna { items: [ ... ] }, então extraímos o array.
      const rawList = data.items || [];

      // Mapear chaves de snake_case para camelCase
      const list: LinkItem[] = rawList.map((item: any) => ({
        id: item.id,
        originalUrl: item.original_url, // original_url -> originalUrl
        shortCode: item.short_code,     // short_code -> shortCode
        accessCount: item.access_count, // access_count -> accessCount
        createdAt: item.created_at      // created_at -> createdAt
      }));
      
      setItems(list);
      
    }catch(err:any){ 
      setError(err.message||String(err)); 
    } finally { 
      setLoading(false); 
    } 
  }

  // 1. Fetch inicial e Polling em background
  useEffect(()=>{ 
    void fetchList(); 

    // Polling a cada 15 segundos para atualização em background
    const interval = setInterval(() => {
      void fetchList();
    }, 15000); 

    return () => clearInterval(interval);
  },[]); 
  
  // 2. Listener de Visibilidade (Atualiza ao retornar para a aba)
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Se a aba voltar a ficar visível, force um fetch
      if (document.visibilityState === 'visible') {
        console.log("Tab visível. Atualizando links após retorno.");
        void fetchList();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {items,loading,error,refresh:fetchList,setItems}; 
}


function LogoIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#8B9BEF"/>
      <img src="../asst/img/Logo.svg"/>
    </svg>
    
    
  );
}


function ConfirmationModal({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100">
        <p className="text-lg font-semibold mb-6 text-gray-800">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancelar</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Confirmar</button>
        </div>
      </div>
    </div>
  );
}

function GlobalMessage({ message, type, onClose }: { message: string; type: 'error' | 'success' | 'warning'; onClose: () => void }) {
  const baseClasses = "fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl flex items-center max-w-sm transition duration-300 transform translate-y-0";
  const typeClasses = {
    error: 'bg-red-100 border border-red-400 text-red-700',
    success: 'bg-green-100 border border-green-400 text-green-700',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700',
  }[type];

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      <span className="block sm:inline mr-4 font-medium">{message}</span>
      <button onClick={onClose} className="ml-auto text-xl font-bold p-1 rounded-full hover:bg-opacity-75">
        <X size={18} />
      </button>
    </div>
  );
}

function EmptyState({text}:{text?:string}){ 
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400 h-full min-h-[200px]">
      <LinkIcon className="w-10 h-10 mb-4 text-gray-400"/>
      <div className="text-lg font-medium text-center">{text||'AINDA NÃO EXISTEM LINKS CADASTRADOS'}</div>
    </div>
  );
}

function Header(){ 
  return (
    <header className="max-w-6xl mx-auto px-4 py-8 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <LogoIcon /> {}
        <div className="text-2xl font-bold text-gray-800">brev.ly</div>
      </div>
    </header> 
  );
}

function NewLinkCard({onCreated}:{onCreated:()=>void}){ 
  const [originalUrl,setOriginalUrl]=useState(''); 
  const [shortCode,setShortCode]=useState(''); 
  const [loading,setLoading]=useState(false); 
  const [error,setError]=useState<string|null>(null);
  
  async function handleSubmit(e?:React.FormEvent){ 
    if(e) e.preventDefault(); 
    setError(null); 
    try{ 
      const url = originalUrl.trim(); 
      if(!url) throw new Error('Informe a URL original'); 
      let validated = url; 
      // Garante que a URL comece com http(s)
      if(!/^https?:\/\//i.test(validated)) validated = 'https://'+validated; 
      try{ new URL(validated); }catch{ throw new Error('URL original inválida') } 
      
      if(shortCode){ 
        if(!SHORT_CODE_REGEX.test(shortCode)) throw new Error('Formato inválido') 
      } 
      
      setLoading(true); 
      const payload:any={original_url:validated}; 
      if(shortCode) payload.short_code=shortCode; 
      
      const res = await fetch(`${BACKEND}/links`,{ 
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body:JSON.stringify(payload) 
      }); 
      
      if(res.status===201){ 
        setOriginalUrl(''); 
        setShortCode(''); 
        onCreated(); 
      } else if(res.status===409){ 
        const data=await res.json(); 
        setError(data.error||'Short já existe');
      } else { 
        const data=await res.json().catch(()=>({})); 
        setError(data.error||`Erro ${res.status}`);
      } 
    }catch(err:any){ 
      setError(err.message||String(err));
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
        onChange={e=>setOriginalUrl(e.target.value)} 
        className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:ring-indigo-300 focus:border-indigo-300 placeholder:text-gray-500"
        required
      />
      
      <label className="block text-xs font-medium text-gray-700 mb-1">LINK ENCURTADO</label>
      <div className="flex mb-8">
        <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg font-medium">
          {/* 💥 ALTERAÇÃO AQUI: Substituindo a URL dinâmica por 'brev.ly' */}
          brev.ly/
        </span>
        <input 
          placeholder="brev.ly" 
          value={shortCode} 
          onChange={e=>setShortCode(e.target.value)} 
          className="flex-1 p-3 border border-gray-300 rounded-r-lg focus:ring-indigo-300 focus:border-indigo-300 min-w-0"
        />
      </div>
      
      {error&&<div className="text-red-600 mb-6 bg-red-50 p-3 rounded-lg border border-red-200 text-sm font-medium">{error}</div>}
      
      <button 
        disabled={loading} 
        className="w-full p-3 bg-indigo-400 text-white font-medium rounded-lg hover:bg-indigo-500 transition duration-150 disabled:bg-indigo-200 disabled:text-gray-500 flex items-center justify-center gap-2 shadow-md"
      >
        {loading ? <RefreshCw size={18} className="animate-spin"/> : 'Salvar link'}
      </button>
    </form>
  );
}

function LinksList({items,onRefresh,loading}:{items:LinkItem[];onRefresh:()=>void;loading:boolean}){ 
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);

  const showMessage = (text: string, type: 'error' | 'success' | 'warning') => {
      setMessage({ text, type });
      setTimeout(() => setMessage(null), 5000);
  }

  // Deleta o link no backend
  async function handleDeleteConfirm(){ 
    const id = linkToDelete;
    setLinkToDelete(null); 
    if (!id) return;
    
    try {
      const res = await fetch(`${BACKEND}/links/${id}`,{method:'DELETE'}); 
      if(!res.ok) throw new Error(`Erro ao deletar: ${res.status}`);
      onRefresh(); 
      showMessage("Link deletado com sucesso!", 'success');
    } catch(err:any) {
      showMessage(err.message || String(err), 'error');
    }
  } 

  // Exporta todos os links como CSV
  async function handleExport(){ 
    setMessage(null);
    try{ 
      const res=await fetch(`${BACKEND}/exports`,{method:'POST'}); 
      if(!res.ok) throw new Error(`Erro ${res.status} ao exportar`); 
      const data = await res.json(); 
      if(data.csv){ 
        const blob = new Blob([data.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'links_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showMessage("CSV exportado com sucesso!", 'success');
      } else {
        throw new Error("Resposta de exportação inválida.");
      }
    }catch(err:any){ 
      showMessage(err.message||'Erro na exportação.', 'error');
    }
  }

  const ListContent = () => (
    <div className="space-y-4 pt-4">
      {items.map(it=> (
        <div key={it.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition duration-200">
          <div className="min-w-0 flex-1">
            <a 
              // 🚀 CORREÇÃO: Adicionando o prefixo '/r/' para chamar a rota de redirecionamento do Fastify
              href={`${BACKEND}/r/${it.shortCode}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 font-medium hover:underline flex items-center gap-1 truncate max-w-full"
            >
              {/* 💥 ALTERAÇÃO AQUI: Substituindo a URL dinâmica por 'brev.ly' */}
              <span className="truncate">brev.ly/r/{it.shortCode}</span>
              <ExternalLink size={14} className="shrink-0"/>
            </a>
            <div className="text-sm text-gray-600 truncate mt-1">{it.originalUrl}</div>
          </div>
          
          <div className="flex items-center gap-3 mt-3 sm:mt-0 text-sm shrink-0">
            <div className="text-gray-700 text-center mr-3">
              <strong className="font-bold text-lg text-indigo-600 block">{it.accessCount}</strong>
              <span className="text-xs">Acessos</span>
            </div>
            
            <button 
              onClick={()=>setLinkToDelete(it.id)} 
              className="p-1 text-red-500 hover:text-red-700 transition"
              title="Deletar Link"
            >
              <Trash2 size={18}/>
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Modal de Confirmação */}
      {linkToDelete && (
          <ConfirmationModal 
              message="Tem certeza que deseja deletar este link? Esta ação é irreversível." 
              onConfirm={handleDeleteConfirm} 
              onCancel={() => setLinkToDelete(null)}
          />
      )}
      
      {/* Mensagem Global de Notificação */}
      {message && <GlobalMessage message={message.text} type={message.type} onClose={() => setMessage(null)} />}

      <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800">Meus links</h3>
          <div>
            <button 
              onClick={handleExport}
              disabled={items.length === 0 || loading}
              className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 
                ${items.length === 0 || loading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
            >
              <Download size={16}/> Baixar CSV
            </button>
          </div>
        </div>
        
        <div className="grow overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-lg text-indigo-600">Carregando links...</div>
          ) : !items.length ? (
            <EmptyState/>
          ) : (
            <ListContent/>
          )}
        </div>
      </div>
    </>
  ); 
}

// --- Páginas ---
function HomePage(){ 
  const {items,loading,error,refresh} = useFetchLinks(); 
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"> 
        <div className="lg:col-span-1">
          <NewLinkCard onCreated={refresh}/>
        </div>
        <div className="lg:col-span-2">
          <LinksList items={items} onRefresh={refresh} loading={loading}/>
          {error&&<div className="text-red-600 mt-4 bg-red-50 p-4 rounded-lg border border-red-200 text-sm font-medium">{error}</div>}
        </div>
      </div>
    </div>
  ); 
}

function RedirectPage(){ 
  const { short } = useParams<{ short: string }>(); 
  const navigate = useNavigate(); 
  const [error,setError]=useState<string|null>(null);
  
  useEffect(()=>{ 
    if(short){ 
      // Redireciona o navegador para o endpoint do Fastify
      // NOTE: Não é mais necessário, pois o link da lista já aponta para a rota de redirecionamento (/r/:short)
      // Esta página é mantida para capturar links que vieram do frontend (ex: /boll), mas o ideal é que os links
      // da lista de links já funcionem diretamente.
      window.location.replace(`${BACKEND}/${short}`);
    } else {
      setError('Código curto não fornecido.');
    }
  },[short]); 
  
  if(error) return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg">
        <X className="w-12 h-12 mb-4 text-red-500 mx-auto"/>
        <h2 className="text-2xl font-bold text-red-500 mb-4">Link Não Encontrado</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={()=>navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">Voltar para Home</button>
      </div>
    </div>
  );
  
  // Exibe tela de carregamento enquanto o redirecionamento acontece
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

function NotFound(){ 
  return (
    <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-12 rounded-xl shadow-lg">
        <h1 className="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Página Não Encontrada</h2>
        <p className="text-lg text-gray-600 mb-6">Parece que você se perdeu. O link que você tentou acessar pode não existir.</p>
        <Link to={'/'} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md">Ir para Home</Link>
      </div>
    </div>
  ); 
}

export default function App(){ 
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 font-sans">
        <Header/>
        <main className="pb-10">
          <Routes>
            <Route path='/' element={<HomePage/>}/>
            <Route path='/:short' element={<RedirectPage/>}/>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
        </main>
      </div>
    </Router>
  ); 
}