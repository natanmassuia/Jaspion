import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Radio, Phone, MapPin, Cpu, Camera, Building2, BookOpen, 
  Image as ImageIcon, AlertTriangle, ChevronDown, ChevronRight, 
  Copy, Check, ShieldAlert, Sparkles, ExternalLink, ChevronsUpDown,
  PhoneCall, MessageSquare, Info, Layers, Clock, Globe
} from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';
import m7Lightbulb from '../assets/mascote/m7-lightbulb.png';
import m7Pointing from '../assets/mascote/m7-pointing.png';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { ProcedureContent } from '../components/ProcedureContent';

const UNIT_IMAGES: Record<string, { image: string; label: string }> = {
  'balbo-usa-concentrador': { image: '/assets/balbo-usa.jpg', label: 'Foto oficial — Native / Grupo Balbo (USA)' },
  'balbo-usina-uberaba': { image: '/assets/balbo-ube.jpg', label: 'Foto oficial — Native / Grupo Balbo (UBE)' },
  'balbo-ufra-usina-sao-francisco': { image: '/assets/balbo-ufra.jpg', label: 'Foto oficial — Native / Grupo Balbo (UFRA)' },
  'balbo-native-guarulhos': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Registro fotográfico operacional — CD Guarulhos' },
  'balbo-native-fiusa': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Registro fotográfico operacional — Escritório Fiúsa' },
  'balbo-barrinha-deposito': { image: '/assets/balbo-barrinha-illustrative.png', label: 'Registro fotográfico operacional — Depósito Barrinha' },
  'balbo-santa-ernestina': { image: '/assets/balbo-santa-ernestina-illustrative.png', label: 'Registro fotográfico operacional — Santa Ernestina' },
  'balbo-torre-sertaozinho': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Registro fotográfico operacional — Torre Sertãozinho' },
  'balbo-barueri-gupe': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Registro fotográfico operacional — Barueri GUPE' },
  'balbo-cantagalo': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Registro fotográfico operacional — Cantagalo' },
  'balbo-torre-altinopolis': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Registro fotográfico operacional — Torre Altinópolis' }
};

export function UnidadeDetailPage() {
  const { id } = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados dos Acordeões / Seções Colapsáveis
  const [openSections, setOpenSections] = useState<{
    circuitos: boolean;
    procedimentos: boolean;
    escalonamentos: boolean;
    infraestrutura: boolean;
  }>({
    circuitos: true,
    procedimentos: true,
    escalonamentos: true,
    infraestrutura: false
  });

  const [openCircuits, setOpenCircuits] = useState<Record<string, boolean>>({});
  const [openProcedures, setOpenProcedures] = useState<Record<string, boolean>>({});
  const [openEscalations, setOpenEscalations] = useState<Record<string, boolean>>({
    comercial: true,
    plantao: true,
    operadoras: true,
    microset: false
  });

  const [copiedCircuitId, setCopiedCircuitId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch(`/api/unidades/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUnit(d.data);
          // Abre o primeiro circuito e primeiro procedimento por padrão
          if (d.data.circuits && d.data.circuits.length > 0) {
            setOpenCircuits({ [d.data.circuits[0].id]: true });
          }
          if (d.data.procedures && d.data.procedures.length > 0) {
            setOpenProcedures({ [d.data.procedures[0].id || 'proc-0']: true });
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-micro-muted flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-micro-cyan border-t-transparent rounded-full animate-spin"></div>
        <span>Carregando dados operacionais da unidade...</span>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="text-red-500 font-bold text-lg">Unidade não encontrada.</div>
        <Link to="/clientes" className="text-xs text-micro-cyan font-bold hover:underline">
          Voltar para a lista de clientes
        </Link>
      </div>
    );
  }

  const effectiveImage = unit.imageUrl || (id ? UNIT_IMAGES[id]?.image : null);

  const handleImageUpdated = (newImageUrl: string) => {
    setUnit((prev: any) => ({ ...prev, imageUrl: newImageUrl }));
  };

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleCircuit = (circuitId: string) => {
    setOpenCircuits(prev => ({ ...prev, [circuitId]: !prev[circuitId] }));
  };

  const toggleProcedure = (procId: string) => {
    setOpenProcedures(prev => ({ ...prev, [procId]: !prev[procId] }));
  };

  const toggleEscalation = (escKey: string) => {
    setOpenEscalations(prev => ({ ...prev, [escKey]: !prev[escKey] }));
  };

  const expandAll = () => {
    setOpenSections({ circuitos: true, procedimentos: true, escalonamentos: true, infraestrutura: true });
    if (unit.circuits) {
      const allCircuits: Record<string, boolean> = {};
      unit.circuits.forEach((c: any) => { allCircuits[c.id] = true; });
      setOpenCircuits(allCircuits);
    }
    if (unit.procedures) {
      const allProc: Record<string, boolean> = {};
      unit.procedures.forEach((p: any, i: number) => { allProc[p.id || `proc-${i}`] = true; });
      setOpenProcedures(allProc);
    }
    setOpenEscalations({ comercial: true, plantao: true, operadoras: true, microset: true });
  };

  const collapseAll = () => {
    setOpenSections({ circuitos: false, procedimentos: false, escalonamentos: false, infraestrutura: false });
    setOpenCircuits({});
    setOpenProcedures({});
    setOpenEscalations({ comercial: false, plantao: false, operadoras: false, microset: false });
  };

  const copyCircuitDetails = (c: any) => {
    const text = `[CIRCUITO CCO]\nUnidade: ${unit.name} (${unit.clientName})\nOperadora: ${c.operator} - ${c.technology || ''}\nVelocidade: ${c.speedMbps ? c.speedMbps + ' Mbps' : 'N/A'}\nID do Circuito: ${c.circuitId || 'N/A'}\nContrato: ${c.contractId || 'N/A'}\nIP/VPN: ${c.lpIp || c.lpVpn || 'N/A'}\nTipo: ${c.isPrimary ? 'Principal' : 'Contingência'}\nObs: ${c.notes || 'N/A'}`;
    navigator.clipboard.writeText(text);
    setCopiedCircuitId(c.id);
    setTimeout(() => setCopiedCircuitId(null), 3000);
  };

  // Separação inteligente dos contatos por grupos
  const contacts = unit.contacts || [];
  const contatosComerciais = contacts.filter((ct: any) => 
    !ct.schedule?.toLowerCase().includes('plantão') && 
    !ct.schedule?.toLowerCase().includes('fora') &&
    !ct.roleDescription?.toLowerCase().includes('algar') &&
    !ct.roleDescription?.toLowerCase().includes('gn microset') &&
    !ct.roleDescription?.toLowerCase().includes('escalonamento interno')
  );

  const contatosPlantao = contacts.filter((ct: any) => 
    ct.schedule?.toLowerCase().includes('plantão') || 
    ct.schedule?.toLowerCase().includes('fora') ||
    ct.roleDescription?.toLowerCase().includes('plantão')
  );

  const contatosOperadoras = contacts.filter((ct: any) => 
    ct.roleDescription?.toLowerCase().includes('algar') ||
    ct.roleDescription?.toLowerCase().includes('sdm') ||
    ct.roleDescription?.toLowerCase().includes('vivo') ||
    ct.roleDescription?.toLowerCase().includes('claro')
  );

  const contatosMicroset = contacts.filter((ct: any) => 
    ct.roleDescription?.toLowerCase().includes('gn microset') ||
    ct.roleDescription?.toLowerCase().includes('escalonamento interno') ||
    ct.roleDescription?.toLowerCase().includes('cco')
  );

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb & Navegação Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs font-bold text-micro-muted">
          <Link to="/clientes" className="hover:text-micro-cyan transition-colors">Clientes</Link>
          <span>/</span>
          <Link to={`/clientes/${unit.clientId}`} className="hover:text-micro-cyan transition-colors text-micro-navy dark:text-white">
            {unit.clientName}
          </Link>
          <span>/</span>
          <span className="text-micro-cyan font-black">{unit.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link 
            to={`/clientes/${unit.clientId}`}
            className="inline-flex items-center text-xs font-bold text-micro-cyan hover:underline bg-white dark:bg-micro-navy px-3 py-1.5 rounded-xl border border-micro-line dark:border-white/10 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Voltar para {unit.clientName}
          </Link>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-white dark:bg-micro-navy hover:bg-micro-bg dark:hover:bg-white/5 text-micro-navy dark:text-white px-3 py-1.5 rounded-xl border border-micro-line dark:border-white/10 shadow-sm transition-all cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5 text-micro-cyan" />
            <span>{effectiveImage ? 'Alterar Foto' : 'Adicionar Foto'}</span>
          </button>
        </div>
      </div>

      {/* 2. Banner de Alerta Operacional Crítico (Padrão Intranet CCO Microset) */}
      <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-2 border-red-500/80 animate-fadeIn relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-yellow-400 text-black text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
                  ⚠️ ATENÇÃO OBRIGATÓRIA — DIRETRIZ CCO
                </span>
                <span className="text-[11px] font-bold text-white/90">Protocolo & Escalonamento</span>
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                PROCEDIMENTO CRÍTICO PARA ABERTURA DE CHAMADOS & TRATATIVAS
              </h3>
              <p className="text-xs text-white/90 mt-1 max-w-3xl leading-relaxed">
                Em caso de alarme ou queda de enlace, registrar e avisar <strong>imediatamente</strong> em dois grupos de WhatsApp espelhados: 
                <span className="underline decoration-yellow-300 ml-1 font-bold">GB-MICROSET - NOC - INF</span> (Cliente) e 
                <span className="underline decoration-yellow-300 ml-1 font-bold">INT - Balbo CCO</span> (Interno). 
                Sempre anexar o protocolo da operadora!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 bg-black/25 px-3 py-2 rounded-2xl border border-white/20 backdrop-blur-sm">
            <span className="text-[11px] font-bold text-white">Turno: 24x7 CCO N1</span>
          </div>
        </div>
      </div>

      {/* 3. Header Principal da Unidade com Foto e Identificadores */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {effectiveImage ? (
            <div className="relative group shrink-0">
              <img
                src={effectiveImage}
                alt={unit.name}
                className="w-24 h-24 rounded-2xl object-cover border border-micro-line dark:border-white/10 shadow-md group-hover:scale-105 transition-transform"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 bg-black/40 hover:bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Trocar</span>
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-micro-blue/10 dark:bg-white/10 flex flex-col items-center justify-center text-micro-cyan border border-micro-line dark:border-white/10 shrink-0">
              <Building2 className="w-8 h-8" />
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-[10px] font-bold text-micro-cyan hover:underline mt-1 cursor-pointer"
              >
                + Foto
              </button>
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-micro-navy dark:text-white">
                {unit.name}
              </h1>
              {unit.clientIsVip && (
                <img src={vipBadge} alt="VIP" className="h-6 w-auto" title="Cliente VIP" />
              )}
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-sm ${
                unit.isActive ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'
              }`}>
                {unit.isActive ? '✓ Unidade Ativa' : 'Desativada'}
              </span>
              <span className="bg-micro-blue/15 text-micro-blue dark:text-micro-cyan font-bold text-[10px] px-2.5 py-1 rounded-full">
                {unit.environment || 'Produção'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-micro-muted">
              {unit.city && (
                <span className="flex items-center text-micro-navy dark:text-white font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-micro-orange" />
                  {unit.city}/{unit.state}
                </span>
              )}
              <span>•</span>
              <span>Intranet: <strong className="text-micro-navy dark:text-white font-mono">{unit.intraCode || '—'}</strong></span>
              <span>•</span>
              <span>Sankhya: <strong className="text-micro-navy dark:text-white font-mono">{unit.sankhyaCode || '—'}</strong></span>
              <span>•</span>
              <span>GN Microset: <strong className="text-micro-navy dark:text-white">{unit.gnName || 'Luis Henrique'}</strong></span>
            </div>
          </div>
        </div>

        {/* Barra Rápida de Ações das Seções */}
        <div className="flex sm:flex-col items-end gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={expandAll}
              className="text-xs font-bold text-micro-cyan hover:text-micro-blue bg-micro-cyan/10 hover:bg-micro-cyan/20 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Expandir Tudo
            </button>
            <button
              onClick={collapseAll}
              className="text-xs font-bold text-micro-muted hover:text-micro-navy dark:hover:text-white bg-micro-bg dark:bg-white/5 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
            >
              Recolher Tudo
            </button>
          </div>
          <span className="text-[11px] text-micro-muted hidden sm:block">
            {unit.circuits?.length || 0} circuitos • {unit.contacts?.length || 0} contatos CCO
          </span>
        </div>
      </div>

      {/* =========================================================================
          SEÇÃO 1: CIRCUITOS & CONECTIVIDADE (BARRAS AZUIS ESTILO INTRANET CCO)
          ========================================================================= */}
      <div className="rounded-3xl border border-micro-line dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-micro-navy">
        {/* Barra de Título Principal da Seção */}
        <div 
          onClick={() => toggleSection('circuitos')}
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-white shadow-inner">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">
                Telecomunicações & Enlaces
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                CIRCUITOS & CONEXÕES DE REDE ({unit.circuits?.length || 0})
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-xl hidden sm:inline-block">
              {openSections.circuitos ? 'Seção Aberta' : 'Seção Fechada'}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              {openSections.circuitos ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
            </div>
          </div>
        </div>

        {/* Conteúdo da Seção de Circuitos (Acordeões Individuais) */}
        {openSections.circuitos && (
          <div className="p-4 sm:p-6 space-y-3.5 bg-micro-bg/40 dark:bg-white/[0.02]">
            {(!unit.circuits || unit.circuits.length === 0) ? (
              <div className="p-8 text-center text-xs text-micro-muted bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10">
                Nenhum circuito cadastrado para esta unidade.
              </div>
            ) : (
              unit.circuits.map((c: any, idx: number) => {
                const isOpen = openCircuits[c.id];
                const isPrimary = c.isPrimary;

                return (
                  <div 
                    key={c.id} 
                    className="rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-micro-navy overflow-hidden shadow-sm transition-all"
                  >
                    {/* Linha Cabeçalho do Circuito (Clicável) */}
                    <div 
                      onClick={() => toggleCircuit(c.id)}
                      className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer hover:bg-micro-bg/70 dark:hover:bg-white/5 transition-colors select-none"
                    >
                      <div className="flex items-center space-x-3.5 min-w-0">
                        {/* Indicador [+] ou [-] */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-sm ${
                          isOpen ? 'bg-micro-cyan text-white' : 'bg-micro-bg dark:bg-white/10 text-micro-ink dark:text-white'
                        }`}>
                          {isOpen ? '−' : '+'}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-black text-micro-navy dark:text-white tracking-tight">
                              {c.operator.toUpperCase()} — {c.technology || 'Link Dedicado'}
                            </span>
                            {c.speedMbps && (
                              <span className="text-xs font-black text-micro-cyan bg-micro-cyan/10 px-2 py-0.5 rounded-md">
                                {c.speedMbps} Mbps
                              </span>
                            )}
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isPrimary 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold'
                            }`}>
                              {isPrimary ? '★ Principal' : 'Contingência'}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-micro-muted mt-1 truncate">
                            {c.circuitId && <span>ID: <strong className="text-micro-navy dark:text-white font-mono">{c.circuitId}</strong></span>}
                            {c.lpIp && <span>• IP: <strong className="font-mono">{c.lpIp}</strong></span>}
                            {c.notes && <span className="truncate hidden md:inline">• {c.notes}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCircuitDetails(c);
                          }}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-micro-cyan hover:bg-micro-cyan/10 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copiar dados para chamado"
                        >
                          {copiedCircuitId === c.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-500 text-[11px]">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline text-[11px]">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Gaveta Aberta com Detalhes do Circuito */}
                    {isOpen && (
                      <div className="p-5 border-t border-micro-line dark:border-white/10 bg-micro-bg/40 dark:bg-black/20 space-y-4 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">Operadora</span>
                            <span className="text-sm font-extrabold text-micro-navy dark:text-white mt-0.5 block">{c.operator}</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">Tecnologia</span>
                            <span className="text-sm font-extrabold text-micro-navy dark:text-white mt-0.5 block">{c.technology || 'Não informada'}</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">Banda Contratada</span>
                            <span className="text-sm font-extrabold text-micro-cyan mt-0.5 block">{c.speedMbps ? `${c.speedMbps} Mbps` : 'Não especificada'}</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">Prioridade</span>
                            <span className="text-sm font-extrabold text-micro-navy dark:text-white mt-0.5 block">{isPrimary ? 'Link Principal' : 'Link de Contingência'}</span>
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">Designador / ID Circuito</span>
                            <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.circuitId || '—'}</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">N° Contrato Operadora</span>
                            <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.contractId || '—'}</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">Endereço IP (LAN/WAN)</span>
                            <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.lpIp || '—'}</span>
                          </div>
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10">
                            <span className="text-micro-muted block text-[10px] uppercase font-bold">VPN / Conexão Túnel</span>
                            <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.lpVpn || '—'}</span>
                          </div>
                        </div>

                        {c.notes && (
                          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-micro-navy dark:text-white flex items-start gap-2.5">
                            <Info className="w-4 h-4 text-micro-cyan shrink-0 mt-0.5" />
                            <div>
                              <strong className="block text-micro-cyan text-[11px] uppercase tracking-wider font-extrabold">Diretriz Operacional do Circuito:</strong>
                              <p className="mt-0.5 leading-relaxed">{c.notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SEÇÃO 2: PROCEDIMENTOS OPERACIONAIS (POP CCO)
          ========================================================================= */}
      <div className="rounded-3xl border border-micro-line dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-micro-navy">
        {/* Barra de Título da Seção */}
        <div 
          onClick={() => toggleSection('procedimentos')}
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-white shadow-inner">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">
                Padrões Operacionais Homologados
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                PROCEDIMENTOS OPERACIONAIS & DIRETRIZES POP ({unit.procedures?.length || 0})
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-xl hidden sm:inline-block">
              {openSections.procedimentos ? 'Seção Aberta' : 'Seção Fechada'}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              {openSections.procedimentos ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
            </div>
          </div>
        </div>

        {/* Conteúdo da Seção de Procedimentos */}
        {openSections.procedimentos && (
          <div className="p-4 sm:p-6 space-y-3.5 bg-micro-bg/40 dark:bg-white/[0.02]">
            {(!unit.procedures || unit.procedures.length === 0) ? (
              <div className="p-8 text-center text-xs text-micro-muted bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10">
                Nenhum procedimento específico cadastrado. Siga os procedimentos padrão do catálogo.
              </div>
            ) : (
              unit.procedures.map((p: any, idx: number) => {
                const procKey = p.id || `proc-${idx}`;
                const isOpen = openProcedures[procKey];

                const categoryLabels: Record<string, string> = {
                  telecom: 'TELECOM & ALERTA DE QUEDA',
                  infra: 'INFRAESTRUTURA & SERVIDORES',
                  escalonamento: 'ESCALONAMENTO & SDM'
                };
                const catLabel = categoryLabels[p.category?.toLowerCase()] || p.category?.toUpperCase() || 'PROCEDIMENTO';

                return (
                  <div 
                    key={procKey}
                    className="rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-micro-navy overflow-hidden shadow-sm transition-all"
                  >
                    {/* Header do Procedimento */}
                    <div 
                      onClick={() => toggleProcedure(procKey)}
                      className="p-4 sm:p-4.5 flex items-center justify-between cursor-pointer hover:bg-micro-bg/70 dark:hover:bg-white/5 transition-colors select-none"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-sm shrink-0 shadow-sm ${
                          isOpen ? 'bg-micro-cyan text-white' : 'bg-micro-bg dark:bg-white/10 text-micro-ink dark:text-white'
                        }`}>
                          {isOpen ? '−' : '+'}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-micro-blue/10 text-micro-blue dark:text-micro-cyan tracking-wider">
                              {catLabel}
                            </span>
                            <span className="text-[11px] font-bold text-micro-muted">Versão {p.version || 1}</span>
                          </div>
                          <h3 className="text-sm font-bold text-micro-navy dark:text-white mt-1">
                            {p.category === 'telecom' && 'Instruções Oficiais para Falhas de Telecomunicações & Queda de Links'}
                            {p.category === 'infra' && 'Instruções para Alertas de Infraestrutura, Servidores & Switches'}
                            {p.category === 'escalonamento' && 'Escalonamento Algar Telecom / SDM Atendimento Premium'}
                            {!['telecom', 'infra', 'escalonamento'].includes(p.category) && `Procedimento Operacional ${p.category}`}
                          </h3>
                        </div>
                      </div>

                      <div className="w-7 h-7 rounded-full bg-micro-bg dark:bg-white/5 flex items-center justify-center text-micro-muted shrink-0">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>

                    {/* Conteúdo Renderizado com Markdown */}
                    {isOpen && (
                      <div className="p-6 border-t border-micro-line dark:border-white/10 bg-micro-bg/30 dark:bg-black/20 animate-fadeIn">
                        <ProcedureContent content={p.content} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SEÇÃO 3: ESCALONAMENTOS & CONTATOS DE EMERGÊNCIA
          ========================================================================= */}
      <div className="rounded-3xl border border-micro-line dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-micro-navy">
        {/* Barra de Título da Seção */}
        <div 
          onClick={() => toggleSection('escalonamentos')}
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-white shadow-inner">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">
                Matriz de Comunicação & Acionamento
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                ESCALONAMENTOS & CONTATOS OPERACIONAIS ({contacts.length})
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-blue-200 bg-white/10 px-3 py-1 rounded-xl hidden sm:inline-block">
              {openSections.escalonamentos ? 'Seção Aberta' : 'Seção Fechada'}
            </span>
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              {openSections.escalonamentos ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
            </div>
          </div>
        </div>

        {/* Conteúdo com Sub-Gavetas (Horário Comercial, Plantão, SDM) */}
        {openSections.escalonamentos && (
          <div className="p-4 sm:p-6 space-y-4 bg-micro-bg/40 dark:bg-white/[0.02]">
            {/* 3.1. Sub-seção: Horário Comercial */}
            <div className="rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-micro-navy overflow-hidden">
              <div 
                onClick={() => toggleEscalation('comercial')}
                className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-micro-bg/70 dark:hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                    openEscalations.comercial ? 'bg-micro-cyan text-white' : 'bg-micro-bg dark:bg-white/10 text-micro-ink dark:text-white'
                  }`}>
                    {openEscalations.comercial ? '−' : '+'}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-micro-navy dark:text-white flex items-center gap-2">
                      <span>ESCALONAMENTO — HORÁRIO COMERCIAL (08:00 às 18:00)</span>
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-extrabold px-2 py-0.5 rounded">
                        {contatosComerciais.length} Contatos
                      </span>
                    </h3>
                  </div>
                </div>
                {openEscalations.comercial ? <ChevronDown className="w-4 h-4 text-micro-muted" /> : <ChevronRight className="w-4 h-4 text-micro-muted" />}
              </div>

              {openEscalations.comercial && (
                <div className="p-4 border-t border-micro-line dark:border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-micro-bg/30 dark:bg-black/20">
                  {contatosComerciais.map((ct: any) => (
                    <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                        <div className="text-[11px] text-micro-muted mt-0.5">{ct.roleDescription}</div>
                        {ct.phone && (
                          <div className="mt-2 text-xs font-mono font-bold text-micro-navy dark:text-white">
                            Fixo: {ct.phone}
                          </div>
                        )}
                        {(ct.mobile || ct.whatsapp) && (
                          <div className="text-xs font-mono font-bold text-micro-orange">
                            Cel: {ct.mobile || ct.whatsapp}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-micro-line/60 dark:border-white/10 flex items-center justify-between">
                        {ct.phone ? (
                          <a href={`tel:${ct.phone.replace(/[^0-9]/g, '')}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-micro-cyan hover:underline">
                            <PhoneCall className="w-3 h-3" /> Ligar
                          </a>
                        ) : <span />}
                        {(ct.whatsapp || ct.mobile) && (
                          <a 
                            href={`https://wa.me/55${(ct.whatsapp || ct.mobile).replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3.2. Sub-seção: Fora do Horário Comercial / Plantão */}
            <div className="rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-micro-navy overflow-hidden">
              <div 
                onClick={() => toggleEscalation('plantao')}
                className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-micro-bg/70 dark:hover:bg-white/5 transition-colors select-none"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                    openEscalations.plantao ? 'bg-micro-cyan text-white' : 'bg-micro-bg dark:bg-white/10 text-micro-ink dark:text-white'
                  }`}>
                    {openEscalations.plantao ? '−' : '+'}
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-micro-navy dark:text-white flex items-center gap-2">
                      <span>ESCALONAMENTO — FORA DO HORÁRIO COMERCIAL / PLANTÃO 24x7</span>
                      <span className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold px-2 py-0.5 rounded">
                        {contatosPlantao.length} Contatos de Plantão
                      </span>
                    </h3>
                  </div>
                </div>
                {openEscalations.plantao ? <ChevronDown className="w-4 h-4 text-micro-muted" /> : <ChevronRight className="w-4 h-4 text-micro-muted" />}
              </div>

              {openEscalations.plantao && (
                <div className="p-4 border-t border-micro-line dark:border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-micro-bg/30 dark:bg-black/20">
                  {contatosPlantao.map((ct: any) => (
                    <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-amber-500/20 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                        <div className="text-[11px] text-micro-muted mt-0.5">{ct.roleDescription}</div>
                        {(ct.mobile || ct.whatsapp || ct.phone) && (
                          <div className="mt-2 text-sm font-mono font-black text-micro-orange">
                            {ct.whatsapp || ct.mobile || ct.phone}
                          </div>
                        )}
                        <span className="text-[10px] text-micro-muted mt-1 block">Plantão / Fora do Horário Comercial</span>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-micro-line/60 dark:border-white/10 flex items-center justify-between">
                        {ct.phone && (
                          <a href={`tel:${ct.phone.replace(/[^0-9]/g, '')}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-micro-cyan hover:underline">
                            <PhoneCall className="w-3 h-3" /> Ligar
                          </a>
                        )}
                        {(ct.whatsapp || ct.mobile) && (
                          <a 
                            href={`https://wa.me/55${(ct.whatsapp || ct.mobile).replace(/[^0-9]/g, '')}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            <MessageSquare className="w-3 h-3" /> Enviar WhatsApp
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3.3. Sub-seção: Operadoras & SDM */}
            {contatosOperadoras.length > 0 && (
              <div className="rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-micro-navy overflow-hidden">
                <div 
                  onClick={() => toggleEscalation('operadoras')}
                  className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-micro-bg/70 dark:hover:bg-white/5 transition-colors select-none"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                      openEscalations.operadoras ? 'bg-micro-cyan text-white' : 'bg-micro-bg dark:bg-white/10 text-micro-ink dark:text-white'
                    }`}>
                      {openEscalations.operadoras ? '−' : '+'}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-micro-navy dark:text-white flex items-center gap-2">
                        <span>ESCALONAMENTO OPERADORAS & SDM (ALGAR TELECOM / ATENDIMENTO PREMIUM)</span>
                        <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded">
                          {contatosOperadoras.length} Contatos
                        </span>
                      </h3>
                    </div>
                  </div>
                  {openEscalations.operadoras ? <ChevronDown className="w-4 h-4 text-micro-muted" /> : <ChevronRight className="w-4 h-4 text-micro-muted" />}
                </div>

                {openEscalations.operadoras && (
                  <div className="p-4 border-t border-micro-line dark:border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-micro-bg/30 dark:bg-black/20">
                    {contatosOperadoras.map((ct: any) => (
                      <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                          <div className="text-[11px] text-micro-cyan font-bold mt-0.5">{ct.roleDescription}</div>
                          <div className="mt-2 text-xs font-mono font-bold text-micro-navy dark:text-white">
                            {ct.phone || ct.mobile}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-micro-line/60 dark:border-white/10 flex items-center justify-between">
                          <a href={`tel:${(ct.mobile || ct.phone || '').replace(/[^0-9]/g, '')}`} className="inline-flex items-center gap-1 text-[11px] font-bold text-micro-cyan hover:underline">
                            <PhoneCall className="w-3 h-3" /> Ligar
                          </a>
                          {(ct.whatsapp || ct.mobile) && (
                            <a 
                              href={`https://wa.me/55${(ct.whatsapp || ct.mobile).replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3.4. Sub-seção: Governança Interna Microset CCO */}
            {contatosMicroset.length > 0 && (
              <div className="rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-micro-navy overflow-hidden">
                <div 
                  onClick={() => toggleEscalation('microset')}
                  className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer hover:bg-micro-bg/70 dark:hover:bg-white/5 transition-colors select-none"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                      openEscalations.microset ? 'bg-micro-cyan text-white' : 'bg-micro-bg dark:bg-white/10 text-micro-ink dark:text-white'
                    }`}>
                      {openEscalations.microset ? '−' : '+'}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-micro-navy dark:text-white flex items-center gap-2">
                        <span>ESCALONAMENTO INTERNO MICROSET TELECOM (GN & CCO)</span>
                        <span className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold px-2 py-0.5 rounded">
                          {contatosMicroset.length} Responsáveis
                        </span>
                      </h3>
                    </div>
                  </div>
                  {openEscalations.microset ? <ChevronDown className="w-4 h-4 text-micro-muted" /> : <ChevronRight className="w-4 h-4 text-micro-muted" />}
                </div>

                {openEscalations.microset && (
                  <div className="p-4 border-t border-micro-line dark:border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3.5 bg-micro-bg/30 dark:bg-black/20">
                    {contatosMicroset.map((ct: any) => (
                      <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-bold mt-0.5">{ct.roleDescription}</div>
                          {(ct.phone || ct.mobile) && (
                            <div className="mt-2 text-xs font-mono font-bold text-micro-navy dark:text-white">
                              {ct.mobile || ct.phone}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-micro-line/60 dark:border-white/10 flex items-center justify-between">
                          <span className="text-[10px] text-micro-muted">Microset Telecom</span>
                          {(ct.whatsapp || ct.mobile) && (
                            <a 
                              href={`https://wa.me/55${(ct.whatsapp || ct.mobile).replace(/[^0-9]/g, '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SEÇÃO 4: DADOS CADASTRAIS & INFRAESTRUTURA LOCAL
          ========================================================================= */}
      <div className="rounded-3xl border border-micro-line dark:border-white/10 overflow-hidden shadow-sm bg-white dark:bg-micro-navy">
        {/* Barra de Título da Seção */}
        <div 
          onClick={() => toggleSection('infraestrutura')}
          className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:brightness-105 transition-all select-none"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-white shadow-inner">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-blue-200">
                Logística & Equipamentos
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                ENDEREÇO FÍSICO, HORÁRIOS & INFRAESTRUTURA LOCAL
              </h2>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
              {openSections.infraestrutura ? <ChevronDown className="w-5 h-5 text-white" /> : <ChevronRight className="w-5 h-5 text-white" />}
            </div>
          </div>
        </div>

        {openSections.infraestrutura && (
          <div className="p-6 bg-micro-bg/40 dark:bg-white/[0.02] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fadeIn">
            <div className="p-4 bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-micro-muted">Endereço Completo da Unidade</span>
              <p className="font-medium text-micro-navy dark:text-white leading-relaxed">
                {unit.address || `${unit.city || 'São Paulo'} - ${unit.state || 'SP'}`}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-micro-muted">Horário de Funcionamento Local</span>
              <p className="font-medium text-micro-navy dark:text-white leading-relaxed">
                {unit.businessHours || '08:00 às 18:00 - Segunda a Sexta'}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10 space-y-1.5 md:col-span-2">
              <span className="text-[10px] font-bold uppercase text-micro-muted">Dependências & Observações Técnicas</span>
              <p className="font-medium text-micro-navy dark:text-white leading-relaxed">
                {unit.dependencies ? String(unit.dependencies) : 'Nenhuma dependência ou particularidade técnica adicional registrada para esta unidade.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Dica Operacional M7 no Rodapé */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-white/5 dark:to-white/10 rounded-3xl p-5 border border-micro-cyan/20 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <img src={m7Lightbulb} alt="Dica M7" className="w-12 h-12 object-contain shrink-0 drop-shadow-sm" />
          <div>
            <div className="text-xs font-bold text-micro-navy dark:text-white flex items-center gap-2">
              <span>Orientação Operacional do M7</span>
              <span className="bg-micro-cyan/15 text-micro-cyan text-[10px] font-black px-2 py-0.5 rounded-full">CCO N1</span>
            </div>
            <p className="text-xs text-micro-muted mt-1 leading-relaxed">
              Mantenha as seções colapsadas para navegar rapidamente entre os circuitos. Ao abrir um chamado na operadora, utilize o botão <strong>"Copiar"</strong> no circuito para enviar o designador, IP e contrato formatados sem risco de erro de digitação.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Upload/Edição de Foto da Unidade */}
      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Alterar Imagem da Unidade"
        subtitle={unit.name}
        targetType="unit"
        targetId={unit.id}
        currentImageUrl={effectiveImage}
        onSuccess={handleImageUpdated}
      />
    </div>
  );
}
