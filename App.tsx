import React, { useState, useEffect } from 'react';
import { JobSite, ScanResult } from './types';
import { checkWebsiteForJobs } from './services/geminiService';
import { SiteCard } from './components/SiteCard';
import { AddSiteForm } from './components/AddSiteForm';
import { ResultModal } from './components/ResultModal';
import { Plus, ListChecks, Briefcase, Play, Loader2 } from 'lucide-react';

const STORAGE_KEY = 'jobhunter_sites';

const App: React.FC = () => {
  const [sites, setSites] = useState<JobSite[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<{site: JobSite, result: ScanResult} | null>(null);
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sites", e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
  }, [sites]);

  const handleAddSite = (newSite: Omit<JobSite, 'id' | 'lastChecked' | 'lastResult' | 'status'>) => {
    // Generate ID safely (fallback for non-secure contexts)
    const newId = (typeof crypto !== 'undefined' && crypto.randomUUID) 
      ? crypto.randomUUID() 
      : `site-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const site: JobSite = {
      ...newSite,
      id: newId,
      lastChecked: null,
      lastResult: null,
      status: 'idle'
    };
    setSites(prev => [...prev, site]);
  };

  const handleDeleteSite = (id: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć tę stronę z listy?')) {
      setSites(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleScan = async (id: string): Promise<void> => {
    const site = sites.find(s => s.id === id);
    if (!site) return;

    // Update status to loading
    setSites(prev => prev.map(s => s.id === id ? { ...s, status: 'loading' } : s));

    try {
      const result = await checkWebsiteForJobs(site.name, site.url, site.keywords);
      
      setSites(prev => prev.map(s => s.id === id ? { 
        ...s, 
        status: 'success',
        lastChecked: new Date().toISOString(),
        lastResult: JSON.stringify(result)
      } : s));

      // Only open result immediately if not in bulk scan mode
      if (!isBulkScanning) {
        setSelectedResult({ site, result });
      }

    } catch (error) {
      setSites(prev => prev.map(s => s.id === id ? { ...s, status: 'error' } : s));
      console.error(`Błąd podczas skanowania ${site.name}:`, error);
      // Removed alert to allow smooth bulk scanning
    }
  };

  const handleScanAll = async () => {
    if (sites.length === 0 || isBulkScanning) return;

    setIsBulkScanning(true);
    
    // Process sequentially to be safe with rate limits and nice visual progression
    for (const site of sites) {
      await handleScan(site.id);
    }

    setIsBulkScanning(false);
  };

  const handleViewResult = (site: JobSite) => {
    if (site.lastResult) {
      try {
        const result = JSON.parse(site.lastResult);
        setSelectedResult({ site, result });
      } catch (e) {
        console.error("Error parsing stored result", e);
      }
    }
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    // Needed for Firefox to allow drag
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSites = [...sites];
    const [draggedItem] = newSites.splice(draggedIndex, 1);
    newSites.splice(dropIndex, 0, draggedItem);
    
    setSites(newSites);
    setDraggedIndex(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-32">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <Briefcase className="text-white h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">JobHunter Auto-mate</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setIsAddModalOpen(true)}
                disabled={isBulkScanning}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="mr-2 h-5 w-5" />
                Dodaj stronę
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro / Stats */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Twoje obserwowane strony</h2>
        </div>

        {/* Grid */}
        {sites.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 mb-4">
              <ListChecks className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900">Brak dodanych stron</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
              Zacznij od dodania strony z ofertami pracy, którą odwiedzasz regularnie.
            </p>
            <div className="mt-6">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Dodaj pierwszą stronę
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site, index) => (
              <SiteCard
                key={site.id}
                site={site}
                onDelete={handleDeleteSite}
                onViewResult={handleViewResult}
                draggable={!isBulkScanning} // Disable drag during scanning
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                isDragging={draggedIndex === index}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Action Bar */}
      {sites.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleScanAll}
              disabled={isBulkScanning}
              className={`w-full flex items-center justify-center py-4 px-6 rounded-xl text-lg font-semibold text-white shadow-lg transition-all transform active:scale-[0.99] ${
                isBulkScanning 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl'
              }`}
            >
              {isBulkScanning ? (
                <>
                  <Loader2 className="animate-spin mr-3 h-6 w-6" />
                  Skanowanie stron...
                </>
              ) : (
                <>
                  <Play className="mr-3 h-6 w-6 fill-current" />
                  Sprawdź wszystkie strony ({sites.length})
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddSiteForm
          onAdd={handleAddSite}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}

      {selectedResult && (
        <ResultModal
          site={selectedResult.site}
          result={selectedResult.result}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

export default App;
