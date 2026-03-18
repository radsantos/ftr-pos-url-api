import React from 'react';
import { PaginationCursorProps } from '../types/index'; 

export function PaginationCursor({ 
  currentPage,
  canGoBack,
  canGoForward,
  hasItems,
  loading,
  itemCount,
  onNext,
  onPrevious,
  onLimitChange,
  currentLimit = 20
}: PaginationCursorProps) { 
  
  const limitOptions = [10, 20, 50, 100];

  if (!hasItems) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-4">
      <div className="text-sm text-gray-600">
        Página {currentPage} • {itemCount} {itemCount === 1 ? 'item' : 'itens'} nesta página
      </div>
      
      <div className="flex items-center gap-4">
        {onLimitChange && (
          <select
            value={currentLimit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-white"
            disabled={loading}
          >
            {limitOptions.map(option => (
              <option key={option} value={option}>
                {option} por página
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2">
          {/* Botão Anterior */}
          <button
            onClick={onPrevious}
            disabled={!canGoBack || loading}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
              flex items-center gap-2 border
              ${!canGoBack || loading 
                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-sm active:bg-indigo-100'
              }
            `}
            title={!canGoBack ? 'Você está na primeira página' : 'Página anterior'}
          >
            <span className="text-lg leading-4">←</span>
            <span className="hidden sm:inline">Anterior</span>
          </button>
          
          {/* Indicador de Página Atual */}
          <div className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded-lg">
            <span className="text-sm font-bold text-indigo-700">{currentPage}</span>
          </div>
          
          {/* Botão Próxima */}
          <button
            onClick={onNext}
            disabled={!canGoForward || loading}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
              flex items-center gap-2 border
              ${!canGoForward || loading 
                ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' 
                : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50 hover:border-indigo-400 hover:shadow-sm active:bg-indigo-100'
              }
            `}
            title={!canGoForward ? 'Não há mais páginas' : 'Próxima página'}
          >
            <span className="hidden sm:inline">Próxima</span>
            <span className="text-lg leading-4">→</span>
          </button>

          {/* Mensagem quando não há mais páginas */}
          {!canGoForward && currentPage > 1 && (
            <div className="text-sm text-gray-500 ml-2 italic">
              (Não há mais links)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}