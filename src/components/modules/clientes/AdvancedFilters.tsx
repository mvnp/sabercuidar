"use client";

import { useState, useEffect } from "react";
import { Filter, X, Search, Loader2, MapPin, Hash, Plus, Bookmark, Check } from "lucide-react";
import { getEmpresasAvancado, getMunicipios } from "@/actions/empresas";
import SaveSearchModal from "./SaveSearchModal";

interface Item {
  codigo: number;
  descricao: string;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Empresa {
  cnpjBasico: string;
  razaoSocial: string;
  porteEmpresa: string;
  capitalSocial: string;
}

interface AdvancedFiltersProps {
  onSearch: (data: Empresa[], pagination: Pagination, filters: { cnaes: string; municipios: string; onlyWithFantasyName: boolean }) => void;
}

export default function AdvancedFilters({ onSearch }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  
  // Selected Tags
  const [selectedCnaes, setSelectedCnaes] = useState<Item[]>([]);
  const [selectedMunicipios, setSelectedMunicipios] = useState<Item[]>([]);
  const [onlyWithFantasyName, setOnlyWithFantasyName] = useState(false);

  // Search States
  const [cnaeInput, setCnaeInput] = useState("");
  const [munInput, setMunInput] = useState("");
  const [munResults, setMunResults] = useState<Item[]>([]);
  const [isSearchingMun, setIsSearchingMun] = useState(false);

  // Search Municípios
  useEffect(() => {
    if (munInput.length < 2) {
      setMunResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingMun(true);
      const res = await getMunicipios(munInput);
      setMunResults(res);
      setIsSearchingMun(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [munInput]);

  const handleSearch = async () => {
    setIsPending(true);
    try {
      const cnaeCodes = selectedCnaes.map(c => c.codigo).join(",");
      const munCodes = selectedMunicipios.map(m => m.codigo).join(",");
      
      const filters = { 
        cnaes: cnaeCodes, 
        municipios: munCodes,
        onlyWithFantasyName
      };
      
      const result = await getEmpresasAvancado(filters);
      onSearch(result.data as Empresa[], result.pagination as Pagination, filters);
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  const handleClear = () => {
    setSelectedCnaes([]);
    setSelectedMunicipios([]);
    setOnlyWithFantasyName(false);
    setCnaeInput("");
    setMunInput("");
  };

  const toggleCnae = (item: Item) => {
    if (selectedCnaes.find(c => c.codigo === item.codigo)) {
      setSelectedCnaes(selectedCnaes.filter(c => c.codigo !== item.codigo));
    } else {
      setSelectedCnaes([...selectedCnaes, item]);
      setCnaeInput("");
    }
  };

  const handleCnaeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const code = cnaeInput.trim().replace(",", "");
      if (code && !selectedCnaes.find(c => c.codigo.toString() === code)) {
        setSelectedCnaes([...selectedCnaes, { codigo: parseInt(code), descricao: code }]);
        setCnaeInput("");
      }
    }
  };

  const toggleMun = (item: Item) => {
    if (selectedMunicipios.find(m => m.codigo === item.codigo)) {
      setSelectedMunicipios(selectedMunicipios.filter(m => m.codigo !== item.codigo));
    } else {
      setSelectedMunicipios([...selectedMunicipios, item]);
      setMunInput("");
    }
  };

  const currentFilters = {
    cnaes: selectedCnaes.map(c => c.codigo).join(","),
    municipios: selectedMunicipios.map(m => m.codigo).join(","),
    onlyWithFantasyName
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn btn-ghost h-10 px-3 text-[var(--color-text-muted)] border border-[var(--color-border)] hover:border-[var(--color-brand-300)]"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filtros Avançados
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-modal w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header */}
            <div className="px-8 py-6 border-b border-[var(--color-border)] flex items-center justify-between bg-[var(--color-brand-50)]/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] flex items-center justify-center shadow-lg shadow-brand/20">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--color-brand-900)]">Mineração de Empresas</h3>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">Configure os parâmetros para busca avançada</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-[var(--color-brand-100)] rounded-full transition-all text-[var(--color-text-light)] hover:text-[var(--color-brand-700)]"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              
              {/* Checkbox Section */}
              <div className="flex items-center gap-3 p-4 bg-[var(--color-brand-50)]/50 rounded-2xl border border-[var(--color-brand-100)] cursor-pointer hover:bg-[var(--color-brand-50)] transition-colors"
                   onClick={() => setOnlyWithFantasyName(!onlyWithFantasyName)}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${onlyWithFantasyName ? 'bg-[var(--color-brand-600)] border-[var(--color-brand-600)]' : 'border-[var(--color-brand-200)] bg-white'}`}>
                  {onlyWithFantasyName && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>
                <span className="text-sm font-semibold text-[var(--color-brand-800)]">
                  Somente empresas com nome fantasia ou razão social
                </span>
              </div>

              {/* Cidades Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[var(--color-brand-800)] flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--color-brand-500)]" />
                    Cidades (Municípios)
                  </label>
                  <span className="text-[10px] font-bold text-[var(--color-brand-50)] bg-[var(--color-brand-50)] px-2 py-0.5 rounded-full uppercase">
                    {selectedMunicipios.length} selecionadas
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-1">
                  {selectedMunicipios.map(mun => (
                    <div key={mun.codigo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-brand-100)] text-[var(--color-brand-800)] rounded-xl text-xs font-semibold">
                      <MapPin className="w-3 h-3 opacity-60" />
                      <span>{mun.descricao}</span>
                      <button onClick={() => toggleMun(mun)} className="hover:text-danger ml-1 p-0.5 rounded-md hover:bg-white/50">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative group">
                  <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors ${isSearchingMun ? 'text-[var(--color-brand-500)]' : 'text-[var(--color-text-light)]'}`} />
                  <input
                    value={munInput}
                    onChange={(e) => setMunInput(e.target.value)}
                    placeholder="Busque pelo nome da cidade..."
                    className="input pl-icon h-12 bg-[var(--color-brand-50)] border-transparent focus:bg-white text-sm"
                  />
                  {isSearchingMun && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 animate-spin text-[var(--color-brand-500)]" />
                  )}

                  {munResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] z-[300] overflow-hidden py-1 animate-in fade-in slide-in-from-top-2">
                      {munResults.map(item => (
                        <button
                          key={item.codigo}
                          onClick={() => toggleMun(item)}
                          className="w-full px-4 py-3 text-left hover:bg-[var(--color-brand-50)] flex items-center justify-between group transition-colors"
                        >
                          <span className="text-sm text-[var(--color-text)]">{item.descricao}</span>
                          <Plus className="w-4 h-4 text-[var(--color-text-light)] group-hover:text-[var(--color-brand-600)]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CNAEs Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-[var(--color-brand-800)] flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[var(--color-brand-500)]" />
                    Atividades Econômicas (CNAEs)
                  </label>
                  <span className="text-[10px] font-bold text-[var(--color-brand-50)] bg-[var(--color-brand-50)] px-2 py-0.5 rounded-full uppercase">
                    {selectedCnaes.length} selecionados
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-1">
                  {selectedCnaes.map(cnae => (
                    <div key={cnae.codigo} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-brand-100)] text-[var(--color-brand-800)] rounded-xl text-xs font-bold shadow-sm border border-[var(--color-brand-200)]">
                      <span>{cnae.codigo}</span>
                      <button onClick={() => toggleCnae(cnae)} className="hover:text-danger ml-1 p-0.5 rounded-md hover:bg-white/50">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-text-light)]" />
                  <input
                    value={cnaeInput}
                    onChange={(e) => setCnaeInput(e.target.value)}
                    onKeyDown={handleCnaeKeyDown}
                    placeholder="Digite o código CNAE e aperte Enter ou vírgula..."
                    className="input pl-icon h-12 bg-[var(--color-brand-50)] border-transparent focus:bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-[var(--color-brand-50)]/30 border-t border-[var(--color-border)] flex items-center justify-between">
              <button 
                onClick={() => setShowSaveModal(true)}
                className="btn btn-ghost text-sm h-12 px-6 text-[var(--color-brand-600)]"
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Salvar esta busca
              </button>
              
              <div className="flex gap-3">
                <button onClick={handleClear} className="btn btn-ghost text-sm h-12 px-6">Limpar Tudo</button>
                <button 
                  onClick={handleSearch}
                  disabled={isPending}
                  className="btn btn-primary text-sm h-12 px-10 shadow-xl shadow-brand/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Aplicar Filtros
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Save Modal */}
      <SaveSearchModal 
        isOpen={showSaveModal} 
        onClose={() => setShowSaveModal(false)} 
        filters={currentFilters}
      />
    </>
  );
}
