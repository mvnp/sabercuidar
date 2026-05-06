"use client";

import { useState, useTransition } from "react";
import { saveAiSettingsAction } from "@/actions/settings";
import { Bot, Key, Cpu, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff, Check } from "lucide-react";

// ─── Catálogo completo de modelos OpenAI com preços (por 1M tokens) ───
const OPENAI_MODELS = [
  // === Budget ===
  { value: "gpt-5-nano",        label: "GPT-5 nano",        description: "Mais barato de todos os modelos",           tier: "BUDGET",    inputPer1M: "$0.05",  outputPer1M: "$0.40",  vision: true  },
  { value: "gpt-4.1-nano",      label: "GPT-4.1 nano",      description: "Classificação e extração em alta escala",   tier: "BUDGET",    inputPer1M: "$0.10",  outputPer1M: "$0.40",  vision: true  },
  { value: "gpt-4o-mini",       label: "GPT-4o mini",       description: "Rápido e acessível para tarefas leves",     tier: "BUDGET",    inputPer1M: "$0.15",  outputPer1M: "$0.60",  vision: true  },
  { value: "gpt-5.4-nano",      label: "GPT-5.4 Nano",      description: "Mais barato da família 5.4",                tier: "BUDGET",    inputPer1M: "$0.20",  outputPer1M: "$1.25",  vision: false },
  { value: "gpt-3.5-turbo",     label: "GPT-3.5 Turbo",     description: "Modelo legado econômico",                   tier: "BUDGET",    inputPer1M: "$0.50",  outputPer1M: "$1.50",  vision: false },
  // === Balanced ===
  { value: "gpt-4.1-mini",      label: "GPT-4.1 mini",      description: "Equilíbrio entre custo e desempenho",       tier: "BALANCED",  inputPer1M: "$0.40",  outputPer1M: "$1.60",  vision: true  },
  { value: "gpt-4o",            label: "GPT-4o",             description: "Multimodal avançado e rápido",              tier: "BALANCED",  inputPer1M: "$2.50",  outputPer1M: "$10.00", vision: true  },
  { value: "gpt-4.1",           label: "GPT-4.1",            description: "Raciocínio e instrução aprimorados",        tier: "BALANCED",  inputPer1M: "$2.00",  outputPer1M: "$8.00",  vision: true  },
  { value: "gpt-5.4",           label: "GPT-5.4",            description: "Família 5.4 balanceada",                   tier: "BALANCED",  inputPer1M: "$3.00",  outputPer1M: "$12.00", vision: true  },
  // === Premium ===
  { value: "gpt-4-turbo",       label: "GPT-4 Turbo",        description: "Alto desempenho com visão",                tier: "PREMIUM",   inputPer1M: "$10.00", outputPer1M: "$30.00", vision: true  },
  { value: "gpt-4.5-preview",   label: "GPT-4.5 Preview",    description: "Preview com capacidades expandidas",       tier: "PREMIUM",   inputPer1M: "$75.00", outputPer1M: "$150.00",vision: true  },
  { value: "gpt-5",             label: "GPT-5",               description: "O mais poderoso modelo da OpenAI",         tier: "PREMIUM",   inputPer1M: "$5.00",  outputPer1M: "$20.00", vision: true  },
  // === Reasoning ===
  { value: "o1-mini",           label: "o1 mini",             description: "Raciocínio eficiente para STEM",           tier: "REASONING", inputPer1M: "$1.10",  outputPer1M: "$4.40",  vision: false },
  { value: "o1",                label: "o1",                  description: "Raciocínio profundo para problemas complexos", tier: "REASONING", inputPer1M: "$15.00", outputPer1M: "$60.00", vision: true },
  { value: "o3",                label: "o3",                  description: "Raciocínio de última geração",             tier: "REASONING", inputPer1M: "$10.00", outputPer1M: "$40.00", vision: true  },
  { value: "o3-mini",           label: "o3 mini",             description: "Raciocínio avançado econômico",            tier: "REASONING", inputPer1M: "$1.10",  outputPer1M: "$4.40",  vision: false },
  { value: "o4-mini",           label: "o4 mini",             description: "Raciocínio rápido e eficiente",            tier: "REASONING", inputPer1M: "$1.10",  outputPer1M: "$4.40",  vision: true  },
];

const TIER_COLORS: Record<string, string> = {
  BUDGET:    "bg-emerald-100 text-emerald-700 border-emerald-200",
  BALANCED:  "bg-sky-100 text-sky-700 border-sky-200",
  PREMIUM:   "bg-purple-100 text-purple-700 border-purple-200",
  REASONING: "bg-amber-100 text-amber-700 border-amber-200",
};

interface AiSettingsFormProps {
  initialToken: string | null;
  initialModel: string;
}

export default function AiSettingsForm({ initialToken, initialModel }: AiSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [selectedModel, setSelectedModel] = useState(initialModel || "gpt-4o-mini");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const currentModel = OPENAI_MODELS.find(m => m.value === selectedModel) ?? OPENAI_MODELS[2];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);
    formData.set("openAiModel", selectedModel);
    startTransition(async () => {
      const result = await saveAiSettingsAction(formData);
      if (result.success) {
        setFeedback({ type: "success", message: "Configurações salvas com sucesso!" });
      } else {
        setFeedback({ type: "error", message: result.error ?? "Erro ao salvar." });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {feedback && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium animate-fade-in ${
          feedback.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
        }`}>
          {feedback.type === "success"
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          {feedback.message}
        </div>
      )}

      {/* ── Token ── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Key className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--color-brand-900)]">Token da OpenAI</h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">
              Obtenha em{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
                className="text-[var(--color-brand-600)] hover:underline">
                platform.openai.com/api-keys
              </a>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
            API Key <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              name="openAiToken"
              type={showToken ? "text" : "password"}
              className="input pr-10 font-mono text-sm"
              placeholder="sk-..."
              defaultValue={initialToken ?? ""}
            />
            <button type="button" onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] hover:text-[var(--color-brand-700)] transition-colors">
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            O token é armazenado de forma segura e usado apenas para avaliações de pacientes.
          </p>
        </div>
      </div>

      {/* ── Modelo ── */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-[var(--color-brand-900)]">Modelo de IA</h2>
            <p className="text-[11px] text-[var(--color-text-muted)]">Escolha o modelo para avaliações clínicas</p>
          </div>
        </div>

        {/* Custom dropdown */}
        <div className="relative">
          <input type="hidden" name="openAiModel" value={selectedModel} />

          {/* Trigger */}
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl text-left transition-all ${
              dropdownOpen
                ? "border-[var(--color-brand-500)] shadow-sm"
                : "border-[var(--color-border)] hover:border-[var(--color-brand-300)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[var(--color-brand-900)]">{currentModel.label}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TIER_COLORS[currentModel.tier]}`}>
                    {currentModel.tier}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--color-text-muted)]">
                  <span>Input: <strong className="text-[var(--color-brand-700)]">{currentModel.inputPer1M}</strong>/1M</span>
                  <span>Output: <strong className="text-[var(--color-brand-700)]">{currentModel.outputPer1M}</strong>/1M</span>
                </div>
              </div>
            </div>
            <span className={`transition-transform duration-200 text-[var(--color-text-light)] ${dropdownOpen ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>

          {/* Dropdown list */}
          {dropdownOpen && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-4 py-2 bg-[var(--color-brand-50)] border-b border-[var(--color-border)]">
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Modelo</span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Tier</span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Input /1M</span>
                <span className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider text-right">Output /1M</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[var(--color-border)]">
                {OPENAI_MODELS.map((model) => (
                  <button
                    key={model.value}
                    type="button"
                    onClick={() => { setSelectedModel(model.value); setDropdownOpen(false); }}
                    className={`w-full grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-4 py-3 text-left transition-colors hover:bg-[var(--color-brand-50)] ${
                      selectedModel === model.value ? "bg-[var(--color-brand-50)]" : ""
                    }`}
                  >
                    {/* Nome + desc */}
                    <div className="flex items-center gap-2 min-w-0">
                      {selectedModel === model.value
                        ? <Check className="w-3.5 h-3.5 text-[var(--color-brand-600)] flex-shrink-0" />
                        : <span className="w-3.5 h-3.5 flex-shrink-0" />}
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[var(--color-brand-900)] truncate">{model.label}</p>
                        <p className="text-[11px] text-[var(--color-text-muted)] truncate">{model.description}</p>
                      </div>
                    </div>

                    {/* Tier */}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap ${TIER_COLORS[model.tier]}`}>
                      {model.tier}
                    </span>

                    {/* Input */}
                    <span className="text-xs font-semibold text-[var(--color-brand-700)] text-right whitespace-nowrap">
                      {model.inputPer1M}
                    </span>

                    {/* Output */}
                    <span className="text-xs font-semibold text-[var(--color-text-muted)] text-right whitespace-nowrap">
                      {model.outputPer1M}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Info ── */}
      <div className="bg-[var(--color-brand-50)] border border-[var(--color-brand-100)] rounded-xl p-4 flex items-start gap-3">
        <Bot className="w-5 h-5 text-[var(--color-brand-500)] flex-shrink-0 mt-0.5" />
        <div className="text-sm text-[var(--color-brand-800)]">
          <p className="font-semibold mb-1">Como funciona a avaliação de pacientes?</p>
          <ul className="text-[var(--color-brand-700)] space-y-1 text-xs list-disc pl-4">
            <li>A ficha clínica completa do paciente é enviada para a IA no formato JSON.</li>
            <li>A IA retorna uma avaliação com pontos críticos, riscos e recomendações.</li>
            <li>Cada laudo é salvo no histórico do paciente para consulta futura.</li>
            <li>Limite: <strong>3 avaliações por paciente a cada 24 horas</strong>.</li>
            <li>Os preços exibidos são por 1 milhão de tokens e variam conforme o modelo.</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary min-w-[160px]" disabled={isPending}>
          {isPending
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
            : "Salvar Configurações"}
        </button>
      </div>
    </form>
  );
}
