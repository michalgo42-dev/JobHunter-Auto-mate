import React from 'react';
import { X, ExternalLink, Calendar, Printer } from 'lucide-react';
import { JobSite, ScanResult } from '../types';

interface ResultModalProps {
  site: JobSite;
  result: ScanResult | null;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({ site, result, onClose }) => {
  if (!result) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (!printWindow) return;

    const siteName = site.name;
    const date = site.lastChecked ? new Date(site.lastChecked).toLocaleString('pl-PL') : '-';
    
    // Create safe HTML for sources list
    const sourceListItems = result.sources.map(s => 
      `<li><a href="${s.uri}" target="_blank">${s.title || s.uri}</a></li>`
    ).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Raport - ${siteName}</title>
          <style>
            body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            h1 { font-size: 24px; color: #111; margin-bottom: 5px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .content { font-size: 14px; white-space: pre-wrap; margin-bottom: 30px; }
            .sources { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; page-break-inside: avoid; }
            .sources h4 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #555; }
            ul { padding-left: 20px; margin: 0; }
            li { margin-bottom: 5px; font-size: 13px; }
            a { color: #2563eb; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>${siteName}</h1>
          <div class="meta">
            <strong>Data skanowania:</strong> ${date}<br>
            <strong>Strona:</strong> ${site.url}
          </div>
          <div class="content">${result.text}</div>
          ${result.sources.length > 0 ? `
            <div class="sources">
              <h4>Źródła / Linki</h4>
              <ul>${sourceListItems}</ul>
            </div>
          ` : ''}
          <script>
            window.onload = function() { 
              // Small delay to ensure styles render before print dialog opens
              setTimeout(function() { window.print(); }, 500); 
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" id="result-content">
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
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center shadow-sm"
            title="Drukuj lub Zapisz jako PDF"
          >
            <Printer size={16} className="mr-2" />
            .pdf
          </button>

          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          >
            Przejdź do strony
            <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};
