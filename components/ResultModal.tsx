import React from 'react';
import { X, ExternalLink, Calendar } from 'lucide-react';
import { JobSite, ScanResult } from '../types';

interface ResultModalProps {
  site: JobSite;
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ site, result, onClose }) => {
  if (!result) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] shadow-2xl flex flex-col animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{site.name}</h2>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar size={14} className="mr-1" />
              <span>Skanowano: {site.lastChecked ? new Date(site.lastChecked).toLocaleString('pl-PL') : '-'}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white rounded-full text-gray-400 hover:text-gray-900 shadow-sm hover:shadow transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="prose prose-blue max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {result.text}
            </div>
          </div>

          {result.sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Źródła</h4>
              <ul className="space-y-2">
                {result.sources.map((source, idx) => (
                  <li key={idx}>
                    <a 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group"
                    >
                      <ExternalLink size={14} className="mr-2 flex-shrink-0" />
                      <span className="truncate text-sm font-medium">{source.title || source.uri}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Przejdź do strony
            <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};
