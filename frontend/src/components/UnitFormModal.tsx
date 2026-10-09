import React, { useState, useEffect } from 'react';
import { X, MapPin, Radio, Phone, Sparkles, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { apiFetch } from '../services/api';

interface UnitFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUnit: any) => void;
  defaultClientId?: string;
  defaultClientName?: string;
}

export function UnitFormModal({
  isOpen,
  onClose,
  onSuccess,
  defaultClientId,
  defaultClientName
}: UnitFormModalProps) {
  const [clientId, setClientId] = useState(defaultClientId || '');
  const [clientsList, setClientsList] = useState<Array<{ id: string; name: string }>>([]);

  // Dados da Unidade
  const [name, setName] = useState('');
  const [intraCode, setIntraCode] = useState('');
  const [sankhyaCode, setSankhyaCode] = useState('');
  const [environment, setEnvironment] = useState('Produção');
  const [isActive, setIsActive] = useState(true);
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [address, setAddress] = useState('');
  const [businessHours, setBusinessHours] = useState('08:00 às 18:00 - Seg a Sex');
  const [phone, setPhone] = useState('');
  const [dependencies, setDependencies] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Seção opcional: Circuito
  const [includeCircuit, setIncludeCircuit] = useState(false);
  const [circuitOperator, setCircuitOperator] = useState('Vivo');
  const [circuitTechnology, setCircuitTechnology] = useState('Fibra');
  const [circuitSpeed, setCircuitSpeed] = useState('50');
  const [circuitIdDesignator, setCircuitIdDesignator] = useState('');
  const [circuitContract, setCircuitContract] = useState('');
  const [circuitLpIp, setCircuitLpIp] = useState('');
  const [circuitIsPrimary, setCircuitIsPrimary] = useState(true);
  const [circuitNotes, setCircuitNotes] = useState('');

  // Seção opcional: Contato
  const [includeContact, setIncludeContact] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('Responsável Técnico (1º Contato)');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMobile, setContactMobile] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactSchedule, setContactSchedule] = useState('Comercial');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (defaultClientId) {
      setClientId(defaultClientId);
    } else if (isOpen) {
      apiFetch('/api/clientes')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) {
            setClientsList(d.data);
            if (!clientId && d.data.length > 0) {
              setClientId(d.data[0].id);
            }
          }
        })
        .catch(() => {});
    }
  }, [defaultClientId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da unidade é obrigatório.');
      return;
    }
    if (!clientId) {
      setError('Selecione o cliente vinculado à unidade.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: any = {
      clientId,
      name: name.trim(),
      intraCode: intraCode.trim() || null,
      sankhyaCode: sankhyaCode.trim() || null,
      environment,
      isActive,
      city: city.trim() || null,
      state: state.trim() || null,
      address: address.trim() || null,
      businessHours: businessHours.trim() || null,
      phone: phone.trim() || null,
      dependencies: dependencies.trim() || null,
      imageUrl: imageUrl.trim() || null
    };

    if (includeCircuit && circuitOperator.trim()) {
      payload.circuit = {
        operator: circuitOperator.trim(),
        technology: circuitTechnology.trim() || 'Fibra',
        speedMbps: circuitSpeed ? parseInt(circuitSpeed, 10) : null,
        circuitId: circuitIdDesignator.trim() || null,
        contractId: circuitContract.trim() || null,
        lpIp: circuitLpIp.trim() || null,
        isPrimary: circuitIsPrimary,
        notes: circuitNotes.trim() || null
      };
    }

    if (includeContact && contactName.trim()) {
      payload.contact = {
        name: contactName.trim(),
        roleDescription: contactRole.trim() || null,
        phone: contactPhone.trim() || null,
        mobile: contactMobile.trim() || null,
        whatsapp: contactWhatsapp.trim() || null,
        schedule: contactSchedule.trim() || null
      };
    }

    try {
      const res = await apiFetch('/api/unidades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Erro ao cadastrar unidade.');
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
      <div className="bg-white dark:bg-micro-navy border border-micro-line dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-micro-line dark:border-white/10 flex items-center justify-between bg-micro-bg/50 dark:bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-micro-blue/10 text-micro-cyan flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-micro-cyan">
                  Central de Cadastro
                </span>
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Nova Unidade
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-micro-navy dark:text-white">
                Cadastrar Unidade Operacional
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

          {/* 1. Vínculo e Dados Gerais */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-micro-muted flex items-center gap-1.5">
              <span>1. Identificação da Unidade</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Cliente Vinculado <span className="text-red-500">*</span>
                </label>
                {defaultClientName ? (
                  <div className="w-full bg-micro-bg/70 dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs font-bold text-micro-navy dark:text-white">
                    {defaultClientName}
                  </div>
                ) : (
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                  >
                    {clientsList.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Nome da Unidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sao Paulo - Sede Administrativa, UBE - Usina Uberaba"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Código Intranet (Identificador Oficial)
                </label>
                <input
                  type="text"
                  placeholder="Ex: GRUPO BALBO - SAO PAULO, BALBO - UBERABA"
                  value={intraCode}
                  onChange={e => setIntraCode(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Código Sankhya da Unidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: 9273, 8081, 8083"
                  value={sankhyaCode}
                  onChange={e => setSankhyaCode(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Ambiente Operacional
                </label>
                <select
                  value={environment}
                  onChange={e => setEnvironment(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                >
                  <option value="Produção">Produção</option>
                  <option value="Crítico">Crítico / Concentrador</option>
                  <option value="Filial">Filial / Escritório</option>
                  <option value="CD / Armazém">CD / Distribuição</option>
                  <option value="Homologação">Homologação / Testes</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-micro-bg/70 dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-micro-navy dark:text-white">Status da Unidade</div>
                  <div className="text-[10px] text-micro-muted">Ativa no catálogo operacional</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    isActive ? 'bg-emerald-500' : 'bg-micro-line dark:bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Localização e Atendimento */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-micro-muted flex items-center gap-1.5">
              <span>2. Localização & Atendimento</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Cidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo, Sertãozinho, Uberaba..."
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Estado (UF)
                </label>
                <input
                  type="text"
                  maxLength={2}
                  placeholder="SP"
                  value={state}
                  onChange={e => setState(e.target.value.toUpperCase())}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan uppercase"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Endereço Completo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Avenida Cantagalo, 74, Conjunto 1007, Vila Gomes Cardim, São Paulo-SP"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Horário de Funcionamento / Atendimento
                </label>
                <input
                  type="text"
                  placeholder="Ex: 08:00 às 18:00 - Seg a Sex, ou 24x7 Plantão"
                  value={businessHours}
                  onChange={e => setBusinessHours(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Telefone da Unidade
                </label>
                <input
                  type="text"
                  placeholder="Ex: (16) 3946-4000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  Dependências / Observações Técnicas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Concentrador de rádio para unidades rurais, gerador próprio..."
                  value={dependencies}
                  onChange={e => setDependencies(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-micro-navy dark:text-white mb-1.5">
                  URL da Foto da Fachada (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: /uploads/unidade_foto.jpg ou deixe em branco para enviar depois"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-micro-ink dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
                />
              </div>
            </div>
          </div>

          {/* 3. Circuito Principal (Opcional) */}
          <div className="border border-micro-line dark:border-white/10 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIncludeCircuit(!includeCircuit)}
              className="w-full p-4 flex items-center justify-between bg-micro-bg/50 dark:bg-white/5 hover:bg-micro-bg transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-micro-cyan" />
                <span className="text-xs font-extrabold text-micro-navy dark:text-white">
                  3. Circuito de Telecomunicação Inicial (Opcional)
                </span>
                <span className="text-[10px] text-micro-muted bg-white dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {includeCircuit ? 'Configurando' : 'Clique para adicionar'}
                </span>
              </div>
              {includeCircuit ? <ChevronUp className="w-4 h-4 text-micro-muted" /> : <ChevronDown className="w-4 h-4 text-micro-muted" />}
            </button>

            {includeCircuit && (
              <div className="p-4 bg-white dark:bg-micro-navy border-t border-micro-line dark:border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Operadora</label>
                  <input
                    type="text"
                    placeholder="Vivo, Algar, Claro, Embratel"
                    value={circuitOperator}
                    onChange={e => setCircuitOperator(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Tecnologia</label>
                  <input
                    type="text"
                    placeholder="Fibra, Rádio, Satélite, VPN"
                    value={circuitTechnology}
                    onChange={e => setCircuitTechnology(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Velocidade (Mbps)</label>
                  <input
                    type="number"
                    placeholder="Ex: 50"
                    value={circuitSpeed}
                    onChange={e => setCircuitSpeed(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">ID do Circuito / Designador</label>
                  <input
                    type="text"
                    placeholder="Ex: SP-50M-VIVO-01"
                    value={circuitIdDesignator}
                    onChange={e => setCircuitIdDesignator(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Contrato</label>
                  <input
                    type="text"
                    placeholder="Ex: CT-2024-998"
                    value={circuitContract}
                    onChange={e => setCircuitContract(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">IP LAN / WAN / VPN</label>
                  <input
                    type="text"
                    placeholder="Ex: 10.200.1.1 / VPN Colaboradores"
                    value={circuitLpIp}
                    onChange={e => setCircuitLpIp(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Contato Chave / Escalonamento (Opcional) */}
          <div className="border border-micro-line dark:border-white/10 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setIncludeContact(!includeContact)}
              className="w-full p-4 flex items-center justify-between bg-micro-bg/50 dark:bg-white/5 hover:bg-micro-bg transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-micro-orange" />
                <span className="text-xs font-extrabold text-micro-navy dark:text-white">
                  4. Contato Operacional / Escalonamento (Opcional)
                </span>
                <span className="text-[10px] text-micro-muted bg-white dark:bg-white/10 px-2 py-0.5 rounded-full">
                  {includeContact ? 'Configurando' : 'Clique para adicionar'}
                </span>
              </div>
              {includeContact ? <ChevronUp className="w-4 h-4 text-micro-muted" /> : <ChevronDown className="w-4 h-4 text-micro-muted" />}
            </button>

            {includeContact && (
              <div className="p-4 bg-white dark:bg-micro-navy border-t border-micro-line dark:border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Nome do Responsável</label>
                  <input
                    type="text"
                    placeholder="Ex: Douglas, José Carlos..."
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Função / Papel</label>
                  <input
                    type="text"
                    placeholder="Ex: Responsável Técnico / Comercial (1º Contato)"
                    value={contactRole}
                    onChange={e => setContactRole(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Telefone Fixo / Ramal</label>
                  <input
                    type="text"
                    placeholder="Ex: (16) 3946-4062"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-micro-navy dark:text-white mb-1">Celular / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="Ex: (16) 98146-0581"
                    value={contactMobile}
                    onChange={e => {
                      setContactMobile(e.target.value);
                      if (!contactWhatsapp) setContactWhatsapp(e.target.value);
                    }}
                    className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-3 py-2 text-xs text-micro-ink dark:text-white outline-none"
                  />
                </div>
              </div>
            )}
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
                  <span>Cadastrar Unidade</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
