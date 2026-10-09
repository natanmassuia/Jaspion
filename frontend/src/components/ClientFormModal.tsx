import React, { useState } from 'react';
import { X, Building2, Crown, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '../services/api';
import vipBadge from '../assets/vip-badge.png';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newClient: any) => void;
}

export function ClientFormModal({ isOpen, onClose, onSuccess }: ClientFormModalProps) {
  const [name, setName] = useState('');
  const [economicGroup, setEconomicGroup] = useState('');
  const [isVip, setIsVip] = useState(false);
  const [gnName, setGnName] = useState('');
  const [managerName, setManagerName] = useState('');
  const [sankhyaCode, setSankhyaCode] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do cliente é obrigatório.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          economicGroup: economicGroup.trim() || null,
          isVip,
          gnName: gnName.trim() || null,
          managerName: managerName.trim() || null,
          sankhyaCode: sankhyaCode.trim() || null,
          description: description.trim() || null,
          imageUrl: imageUrl.trim() || null
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Erro ao cadastrar cliente.');
      }

      onSuccess(data.data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Falha na comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-micro-navy border border-micro-line dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-micro-line dark:border-white/10 flex items-center justify-between bg-micro-bg/50 dark:bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-micro-cyan/10 text-micro-cyan flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-micro-cyan">
                  Central de Cadastro
                </span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Novo Cliente
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-micro-navy dark:text-white">
                Cadastrar Cliente Corporativo
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-micro-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dados Principais */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-micro-muted flex items-center gap-1.5">
              <span>1. Identificação Principal</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Nome do Cliente / Razão Social <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Grupo Balbo, Usina Batatais, Destilaria..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Grupo Econômico / Segmento
                </label>
                <input
                  type="text"
                  placeholder="Ex: Grupo Balbo, Sucroalcooleiro"
                  value={economicGroup}
                  onChange={e => setEconomicGroup(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Código Sankhya (ERP)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 882005329 ou código do parceiro"
                  value={sankhyaCode}
                  onChange={e => setSankhyaCode(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>
            </div>

            {/* Toggle VIP */}
            <div className="flex items-center justify-between p-3.5 bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-micro-navy dark:text-white flex items-center gap-2">
                    <span>Cliente VIP / Prioritário CCO</span>
                    {isVip && <img src={vipBadge} alt="VIP" className="h-4 w-auto" />}
                  </div>
                  <div className="text-[11px] text-micro-muted">
                    Prioridade no atendimento, triagem automática e regras de SLA especial.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsVip(!isVip)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isVip ? 'bg-amber-500' : 'bg-micro-line dark:bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isVip ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Governança e Contatos */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-micro-muted flex items-center gap-1.5">
              <span>2. Governança & Gestão de Contas</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Gerente de Negócios (GN Microset)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Luis Henrique, Marta Corrêa..."
                  value={gnName}
                  onChange={e => setGnName(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Gestor da Conta / Coordenador
                </label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo, Aloysio Rosseti..."
                  value={managerName}
                  onChange={e => setManagerName(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>
            </div>
          </div>

          {/* Detalhes Operacionais & Logo */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-micro-muted flex items-center gap-1.5">
              <span>3. Perfil Operacional & Identidade</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                URL da Logomarca ou Imagem (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: /uploads/balbo-logo.png ou link externo..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
              />
              <span className="text-[10px] text-micro-muted mt-1 block">
                Você também poderá anexar fotos diretamente do computador após o cadastro.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                Descrição & Contextualização Operacional
              </label>
              <textarea
                rows={3}
                placeholder="Descreva particularidades do cliente, escopo monitorado, usinas, unidades prioritárias..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl p-3 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-micro-line dark:border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-micro-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-micro-blue to-micro-cyan hover:from-micro-cyan hover:to-micro-blue text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cadastrar Cliente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
