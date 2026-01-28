import React, { useState } from 'react';
import { JobSite } from '../types';
import { Trash2, ExternalLink, Clock, Pencil, ArrowLeft, ArrowRight, Check, X } from 'lucide-react';

interface SiteCardProps {
  site: JobSite;
  index: number;
  totalCount: number;
  onDelete: (id: string) => void;
  onViewResult: (site: JobSite) => void;
  onEdit: (id: string, newTitle: string) => void;
  onMove: (index: number, direction: 'left' | 'right') => void;
}

export const SiteCard: React.FC<SiteCardProps> = ({ 
  site, 
  index,
  totalCount,
  onDelete, 
  onViewResult,
  onEdit,
  onMove
}) => {
  const isLoading = site.status === 'loading';
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(site.name);

  const handleSaveEdit = () => {
    if (editTitle.trim()) {
      onEdit(site.id, editTitle.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(site.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group relative">
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0 mr-2">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSaveEdit();
                  }} 
                  className="text-green-600 hover:bg-green-50 p-1 rounded"
                >
                  <Check size={16} />
                </button>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelEdit();
                  }} 
                  className="text-red-600 hover:bg-red-50 p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 overflow-hidden">
                <h3 className="font-semibold text-lg text-gray-900 truncate" title={site.name}>
                  {site.name}
                </h3>
                <a 
                  href={site.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-400 hover:text-blue-600 transition-colors flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
          
          <div className="flex items-center flex-shrink-0">
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

        {/* Action Bar */}
        <div className="flex items-center justify-between gap-2">
          {site.lastResult ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewResult(site);
              }}
              className="flex-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium rounded-lg transition-colors text-sm truncate"
            >
              Zobacz wynik
            </button>
          ) : <div className="flex-1"></div>}
          
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(index, 'left');
              }}
              disabled={index === 0}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              title="Przesuń w lewo"
            >
              <ArrowLeft size={18} />
            </button>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onMove(index, 'right');
              }}
              disabled={index === totalCount - 1}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
              title="Przesuń w prawo"
            >
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditTitle(site.name);
                setIsEditing(true);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edytuj nazwę"
            >
              <Pencil size={18} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(site.id);
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Usuń stronę"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
