"use client";

import { useState } from "react";
import { X, Bookmark, Loader2, Save } from "lucide-react";
import { saveSearchAction } from "@/actions/empresas";

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    cnaes: string;
    municipios: string;
    onlyWithFantasyName: boolean;
  };
}

export default function SaveSearchModal({ isOpen, onClose, filters }: SaveSearchModalProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const res = await saveSearchAction(name, filters);
      if (res.success) {
        alert("Busca salva com sucesso!");
        setName("");
        onClose();
      } else {
        alert("Erro ao salvar busca: " + res.error);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao processar salvamento.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-brand-50)]/50">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[var(--color-brand-600)]" />
            <h3 className="text-sm font-bold text-[var(--color-brand-900)]">Salvar Filtros</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[var(--color-brand-100)] rounded-full transition-colors">
            <X className="w-5 h-5 text-[var(--color-text-light)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-brand-700)] uppercase tracking-wider">Descrição da Busca</label>
            <div className="relative group">
              <Bookmark className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-text-light)] group-focus-within:text-[var(--color-brand-500)] transition-colors" />
              <input 
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Clínicas em São Paulo"
                className="input pl-icon h-11 text-sm bg-[var(--color-brand-50)]/30 border-[var(--color-border)] focus:bg-white"
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
              />
            </div>
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] leading-relaxed italic">
            Dica: Use nomes curtos e descritivos para identificar facilmente esta busca no futuro.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[var(--color-brand-50)]/30 border-t border-[var(--color-border)] flex gap-3">
          <button onClick={onClose} className="btn btn-ghost flex-1 h-10 text-sm">Cancelar</button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            className="btn btn-primary flex-1 h-10 text-sm shadow-lg shadow-brand/20"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Agora
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
