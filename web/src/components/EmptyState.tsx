import React from 'react';
import { Link as LinkIcon } from 'lucide-react';

export function EmptyState({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-400 h-full min-h-[200px]">
      <LinkIcon className="w-10 h-10 mb-4 text-gray-400"/>
      <div className="text-lg font-medium text-center">
        {text || 'AINDA NÃO EXISTEM LINKS CADASTRADOS'}
      </div>
    </div>
  );
}