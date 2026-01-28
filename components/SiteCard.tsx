import React from 'react';
import { JobSite } from '../types';
import { Trash2, ExternalLink, Clock, GripVertical } from 'lucide-react';

interface SiteCardProps {
  site: JobSite;
  onDelete: (id: string) => void;
  onViewResult: (site: JobSite) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export const SiteCard: React.FC<SiteCardProps> = ({ 
  site, 
  onDelete, 
  onViewResult,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging
}) => {
  const isLoading = site.status === 'loading';

  return (
    <div 
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group ${
        isDragging ? 'opacity-40 scale-95 border-blue-400 border-dashed' : ''
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2 overflow-hidden mr-2">
            <h3 className="font-semibold text-lg text-gray-900 truncate" title={site.name}>
              {site.name}
            </h3>
            <a 
              href={site.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
            >
              <ExternalLink size={16} />
            </a>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              site.status === 'success' ? 'bg-green-100 text-green-700' :
              site.status === 'error' ? 'bg-red-100 text-red-700' :
              site.status === 'loading' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {site.status === 'loading' ? 'Skanowanie...' :
               site.status === 'success' ? 'Sprawdzono' :
               site.status === 'error' ? 'Błąd' : 'Oczekuje'}
            </div>
            
            {/* Drag Handle */}
            <div 
              className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 transition-colors p-1 -mr-2"
              title="Przeciągnij, aby zmienić kolejność"
            >
              <GripVertical size={20} />
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2" title={site.url}>
          {site.url}
        </p>

        {site.keywords && (
          <div className="flex flex-wrap gap-2 mb-4">
            {site.keywords.split(',').map((k, i) => (
              <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                {k.trim()}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center text-xs text-gray-400 mb-4">
          <Clock size={12} className="mr-1" />
          <span>Ostatnio: {site.lastChecked ? new Date(site.lastChecked).toLocaleString('pl-PL') : 'Nigdy'}</span>
        </div>

        <div className="flex gap-2">
          {site.lastResult && (
            <button
              onClick={() => onViewResult(site)}
              className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors"
              title="Zobacz wynik"
            >
              Zobacz wynik
            </button>
          )}

          <button
            onClick={() => onDelete(site.id)}
            disabled={isLoading}
            className={`px-3 py-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${!site.lastResult ? 'ml-auto' : ''}`}
            title="Usuń stronę"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
