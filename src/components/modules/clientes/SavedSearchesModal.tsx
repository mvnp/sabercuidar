"use client";

import { useState, useEffect } from "react";
import { Bookmark, X, Search, Trash2, Loader2, Play } from "lucide-react";
import { getSavedSearchesAction, deleteSavedSearchAction } from "@/actions/empresas";

interface SavedSearch {
  id: string;
  name: string;
  filters: string;
  createdAt: Date;
}

interface SavedSearchesModalProps {
  onSelect: (filters: any) => void;
}

export default function SavedSearchesModal({ onSelect }: SavedSearchesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSearches = async () => {
    setIsLoading(true);
    const data = await getSavedSearchesAction();
    setSearches(data as any);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadSearches();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta busca salva?")) return;
    const res = await deleteSavedSearchAction(id);
    if (res.success) {
      setSearches(searches.filter(s => s.id !== id));
    }
  };

  const handleSelect = (search: SavedSearch) => {
    const filters = JSON.parse(search.filters);
    onSelect(filters);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-secondary h-10 px-3 text-[var(--color-brand-700)] border border-[var(--color-brand-200)]"
      >
        <Bookmark className="w-4 h-4 mr-2" />
        Buscas Salvas
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-brand-50)]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-soft flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-[var(--color-brand-600)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-900)]">Buscas Salvas</h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">Seus filtros favoritos para mineração</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--color-brand-100)] rounded-full transition-all text-[var(--color-text-light)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--color-brand-600)]" />
                  <span className="text-sm text-[var(--color-text-muted)]">Carregando suas buscas...</span>
                </div>
              ) : searches.length > 0 ? (
                <div className="space-y-2">
                  {searches.map(search => (
                    <div 
                      key={search.id}
                      className="group flex items-center justify-between p-4 rounded-2xl hover:bg-[var(--color-brand-50)] border border-transparent hover:border-[var(--color-brand-100)] transition-all"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-[var(--color-brand-900)] group-hover:text-[var(--color-brand-700)] transition-colors">
                          {search.name}
                        </span>
                        <span className="text-[10px] text-[var(--color-text-light)] font-medium uppercase tracking-wider">
                          Criada em {new Date(search.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleSelect(search)}
                          className="btn btn-primary h-9 px-4 text-xs shadow-md"
                        >
                          <Play className="w-3.5 h-3.5 mr-1.5" />
                          Executar
                        </button>
                        <button 
                          onClick={() => handleDelete(search.id)}
                          className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <Bookmark className="w-12 h-12 text-[var(--color-brand-100)] mx-auto mb-4" />
                  <p className="text-[var(--color-text-muted)] font-medium">Você ainda não tem buscas salvas.</p>
                  <p className="text-xs text-[var(--color-text-light)] mt-1">Salve filtros na tela de Filtros Avançados.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 bg-[var(--color-brand-50)]/30 border-t border-[var(--color-border)] flex items-center justify-end">
              <button 
                onClick={() => setIsOpen(false)}
                className="btn btn-ghost text-sm h-10 px-6"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
