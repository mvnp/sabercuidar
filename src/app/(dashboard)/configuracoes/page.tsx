import { getAiSettingsAction } from "@/actions/settings";
import AiSettingsForm from "@/components/modules/configuracoes/AiSettingsForm";
import { Settings, Bot } from "lucide-react";

export const metadata = {
  title: "Configurações | SaberCuidar",
  description: "Configurações do sistema e integração com IA",
};

export default async function ConfiguracoesPage() {
  const { data } = await getAiSettingsAction();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl gradient-brand flex items-center justify-center shadow-sm">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-brand-900)]">Configurações</h1>
        </div>
        <p className="text-[var(--color-text-muted)] text-sm pl-11">
          Gerencie as integrações e preferências do sistema
        </p>
      </div>

      {/* Seção IA */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bot className="w-4 h-4 text-[var(--color-brand-600)]" />
          <h2 className="text-base font-semibold text-[var(--color-brand-900)]">Inteligência Artificial</h2>
        </div>
        <AiSettingsForm
          initialToken={data?.openAiToken ?? null}
          initialModel={data?.openAiModel ?? "gpt-4o-mini"}
        />
      </div>
    </div>
  );
}
