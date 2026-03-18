import React from 'react';
import { useFetchLinks } from '../hooks/useFetchLinks'; 
import { NewLinkCard } from '../components/NewLinkCard';
import { LinksList } from '../components/LinksList';

export function HomePage() { 
  const { items, loading, error, refresh, pagination } = useFetchLinks(); 
  
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start"> 
        <div className="lg:col-span-1">
          <NewLinkCard onCreated={() => {
            pagination.changeLimit(pagination.limit);
          }}/>
        </div>
        <div className="lg:col-span-2">
          <LinksList 
            items={items} 
            onRefresh={refresh} 
            loading={loading}
            pagination={pagination}
          />
          {error && (
            <div className="text-red-600 mt-4 bg-red-50 p-4 rounded-lg border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  ); 
}