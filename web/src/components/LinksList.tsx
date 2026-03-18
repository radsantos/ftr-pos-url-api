import React, { useState } from "react";
import { ExternalLink, Trash2, Download } from 'lucide-react';
import { LinkItem, PaginationData } from "../types/index";
import { BACKEND } from "../utils/constants";
import { ConfirmationModal } from "./ConfirmationModal";
import { GlobalMessage } from "./GlobalMessage";
import { EmptyState } from "./EmptyState";
import { PaginationCursor } from "./PaginationCursor";

interface LinksListProps {
  items: LinkItem[];
  onRefresh: () => void;
  loading: boolean;
  pagination: PaginationData;
}

export function LinksList({ 
  items, 
  onRefresh, 
  loading,
  pagination 
}: LinksListProps) { 
  const [linkToDelete, setLinkToDelete] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' | 'warning' } | null>(null);

  const showMessage = (text: string, type: 'error' | 'success' | 'warning') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleDeleteConfirm() { 
    const id = linkToDelete;
    setLinkToDelete(null); 
    if (!id) return;
    
    try {
      const res = await fetch(`${BACKEND}/links/${id}`, { method: 'DELETE' }); 
      if (!res.ok) throw new Error(`Erro ao deletar: ${res.status}`);
      
      if (items.length === 1 && pagination.currentPage > 1) {
        pagination.previousPage();
      } else {
        onRefresh();
      }
      
      showMessage("Link deletado com sucesso!", 'success');
    } catch (err: any) {
      showMessage(err.message || String(err), 'error');
    }
  } 

  async function handleExport() { 
    setMessage(null);
    try { 
      const res = await fetch(`${BACKEND}/exports`, { method: 'POST' }); 
      if (!res.ok) throw new Error(`Erro ${res.status} ao exportar`); 
      const data = await res.json(); 
      
      if (data.url) { 
        window.open(data.url, '_blank');
        showMessage("Arquivo CSV gerado com sucesso!", 'success');
      } else if (data.csv) {
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
    } catch (err: any) { 
      showMessage(err.message || 'Erro na exportação.', 'error');
    }
  }

  const ListContent = () => (
    <div className="space-y-4 pt-4">
      {items.map(it => (
        <div key={it.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition duration-200">
          <div className="min-w-0 flex-1">
            <a 
              href={`${BACKEND}/${it.shortCode}`} 
              target="_blank" 
              rel="noreferrer" 
              className="text-indigo-600 font-medium hover:underline flex items-center gap-1 truncate max-w-full"
            >
              <span className="truncate">brev.ly/{it.shortCode}</span>
              <ExternalLink size={14} className="shrink-0"/>
            </a>
            <div className="text-sm text-gray-600 truncate mt-1">{it.originalUrl}</div>
            <div className="text-xs text-gray-400 mt-1">
              Criado em: {new Date(it.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-3 sm:mt-0 text-sm shrink-0">
            <div className="text-gray-700 text-center mr-3">
              <strong className="font-bold text-lg text-indigo-600 block">{it.accessCount}</strong>
              <span className="text-xs">Acessos</span>
            </div>
            
            <button 
              onClick={() => setLinkToDelete(it.id)} 
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
      {linkToDelete && (
        <ConfirmationModal 
          message="Tem certeza que deseja deletar este link? Esta ação é irreversível." 
          onConfirm={handleDeleteConfirm} 
          onCancel={() => setLinkToDelete(null)}
        />
      )}
      
      {message && <GlobalMessage message={message.text} type={message.type} onClose={() => setMessage(null)} />}

      <div className="bg-white p-8 rounded-xl shadow-lg h-full flex flex-col">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-xl font-semibold text-gray-800">Meus links</h3>
          <button 
            onClick={handleExport}
            disabled={items.length === 0 || loading}
            className={`px-4 py-2 rounded-lg transition text-sm font-medium flex items-center gap-2 
              ${items.length === 0 || loading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
          >
            <Download size={16}/> Exportar CSV
          </button>
        </div>
        
        <div className="grow overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center text-lg text-indigo-600">Carregando links...</div>
          ) : !items.length ? (
            <EmptyState text="Nenhum link encontrado"/>
          ) : (
            <>
              <ListContent/>
              
              <PaginationCursor
                currentPage={pagination.currentPage}
                canGoBack={pagination.canGoBack}
                canGoForward={pagination.canGoForward}
                hasItems={items.length > 0}
                loading={loading}
                itemCount={items.length}
                onNext={pagination.nextPage}
                onPrevious={pagination.previousPage}
                onLimitChange={pagination.changeLimit}
                currentLimit={pagination.limit}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}