import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Radio, Phone, MapPin, Cpu, Camera, Building2, BookOpen, 
  Image as ImageIcon, AlertTriangle, ChevronDown, ChevronRight, 
  Copy, Check, ShieldAlert, Sparkles, ExternalLink, ChevronsUpDown,
  PhoneCall, MessageSquare, Layers, Clock, Globe, Info, AlertCircle, X, ZoomIn,
  UserCheck, ShieldCheck
} from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';
import m7Lightbulb from '../assets/mascote/m7-lightbulb.png';
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

  // Estado do Modal de Preview / Lightbox de Imagem
  const [previewImage, setPreviewImage] = useState<{ src: string; label?: string } | null>(null);

  // Fechar Preview de Imagem ao pressionar tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };
    if (previewImage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [previewImage]);

  // As seções operacionais sempre iniciam RECOLHIDAS ao abrir a página
  const [openSections, setOpenSections] = useState<{
    circuitos: boolean;
    procedimentos: boolean;
    escalonamentos: boolean;
  }>({
    circuitos: false,
    procedimentos: false,
    escalonamentos: false
  });

  const [openCircuits, setOpenCircuits] = useState<Record<string, boolean>>({});
  const [openProcedures, setOpenProcedures] = useState<Record<string, boolean>>({});
  const [openEscalations, setOpenEscalations] = useState<Record<string, boolean>>({
    comercial: false,
    plantao: false,
    microset: false
  });

  // Estado unificado de cópia rápida para QUALQUER card da página
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);

  const copyCardText = (cardId: string, textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedCardId(cardId);
    setTimeout(() => {
      setCopiedCardId((prev) => (prev === cardId ? null : prev));
    }, 2500);
  };

  useEffect(() => {
    apiFetch(`/api/unidades/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUnit(d.data);
          setOpenCircuits({});
          setOpenProcedures({});
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
  const effectiveLabel = unit.imageUrl 
    ? 'Foto Personalizada da Unidade' 
    : (id && UNIT_IMAGES[id]?.label ? UNIT_IMAGES[id].label : 'Imagem Operacional Oficial');

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
    setOpenSections({ circuitos: true, procedimentos: true, escalonamentos: true });
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
    setOpenEscalations({ comercial: true, plantao: true, microset: true });
  };

  const collapseAll = () => {
    setOpenSections({ circuitos: false, procedimentos: false, escalonamentos: false });
    setOpenCircuits({});
    setOpenProcedures({});
    setOpenEscalations({ comercial: false, plantao: false, microset: false });
  };

  const copyCircuitDetails = (c: any) => {
    const text = `[CIRCUITO CCO]\nUnidade: ${unit.name} (${unit.clientName})\nOperadora: ${c.operator} - ${c.technology || ''}\nVelocidade: ${c.speedMbps ? c.speedMbps + ' Mbps' : 'N/A'}\nID do Circuito: ${c.circuitId || 'N/A'}\nContrato: ${c.contractId || 'N/A'}\nIP/VPN: ${c.lpIp || c.lpVpn || 'N/A'}\nTipo: ${c.isPrimary ? 'Principal' : 'Contingência'}\nObs: ${c.notes || 'N/A'}`;
    copyCardText(`circuit-${c.id}`, text);
  };

  // Separação inteligente dos contatos por grupos
  const contacts = unit.contacts || [];

  // Função para vincular contatos da operadora diretamente dentro do "balaio" do circuito
  const getOperatorContactsForCircuit = (operatorName: string) => {
    const op = (operatorName || '').toLowerCase().trim();
    const matched = contacts.filter((ct: any) => {
      const role = (ct.roleDescription || '').toLowerCase();
      const name = (ct.name || '').toLowerCase();
      const notes = (ct.notes || '').toLowerCase();
      if (op.includes('algar') && (role.includes('algar') || role.includes('sdm') || notes.includes('algar'))) return true;
      if (op.includes('vivo') && (role.includes('vivo') || notes.includes('vivo'))) return true;
      if (op.includes('claro') && (role.includes('claro') || notes.includes('claro'))) return true;
      if (op.includes('nicnet') && (role.includes('nicnet') || notes.includes('nicnet'))) return true;
      if (op.includes('client') && (role.includes('client') || notes.includes('client'))) return true;
      return role.includes(op) || name.includes(op);
    });

    if (matched.length === 0 && op.includes('algar')) {
      return [
        {
          id: 'algar-sdm-diego',
          name: 'Diego Ribeiro',
          roleDescription: 'SDM Algar Telecom — Gerente de Atendimento Exclusivo',
          phone: '(34) 99880-0382',
          mobile: '(34) 99880-0382',
          whatsapp: '34998800382',
          schedule: 'Seg a Sex (08:00 às 18:00)'
        },
        {
          id: 'algar-suporte-0800',
          name: 'Central de Suporte Algar Telecom',
          roleDescription: '10312 / 0800 942 1212 - Suporte Corporativo Algar',
          phone: '10312',
          mobile: null,
          whatsapp: null,
          schedule: 'Plantão 24x7 NOC Operadora'
        }
      ];
    }

    if (matched.length === 0 && op.includes('wcs')) {
      return [
        {
          id: 'wcs-suporte-noc',
          name: 'Suporte Técnico WCS Telecom',
          roleDescription: 'Central de Operações de Rede WCS Telecom (MPLS)',
          phone: '(11) 4003-8200',
          mobile: null,
          whatsapp: null,
          schedule: 'Plantão 24x7 NOC Operadora'
        }
      ];
    }

    if (matched.length === 0 && op.includes('vivo')) {
      return [
        {
          id: 'vivo-central-10315',
          name: 'Central Telefônica Vivo Empresas',
          roleDescription: '10315 (Opção 2 -> 2) - CNPJ 71.324.792/0001-06',
          phone: '10315',
          mobile: null,
          whatsapp: null,
          schedule: 'Central 24x7 Telefônica'
        },
        {
          id: 'vivo-gn-maria-luisa',
          name: 'Maria Luisa (GN Pós-Vendas Vivo)',
          roleDescription: 'maria.luisa@telefonica.com / andre.sandron@telefonica.com',
          phone: null,
          mobile: null,
          whatsapp: null,
          schedule: 'Seg a Sex (Comercial / E-mail)'
        }
      ];
    }

    return matched;
  };

  // Na aba de Escalonamentos da Unidade, NÃO misturamos operadoras; apenas contatos locais e governança
  const contatosComerciais = contacts.filter((ct: any) => 
    !ct.schedule?.toLowerCase().includes('plantão') && 
    !ct.schedule?.toLowerCase().includes('fora') &&
    !ct.roleDescription?.toLowerCase().includes('algar') &&
    !ct.roleDescription?.toLowerCase().includes('sdm') &&
    !ct.roleDescription?.toLowerCase().includes('vivo') &&
    !ct.roleDescription?.toLowerCase().includes('claro') &&
    !ct.roleDescription?.toLowerCase().includes('nicnet') &&
    !ct.roleDescription?.toLowerCase().includes('gn microset') &&
    !ct.roleDescription?.toLowerCase().includes('escalonamento interno')
  );

  const contatosPlantao = contacts.filter((ct: any) => 
    (ct.schedule?.toLowerCase().includes('plantão') || 
     ct.schedule?.toLowerCase().includes('fora') ||
     ct.roleDescription?.toLowerCase().includes('plantão')) &&
    !ct.roleDescription?.toLowerCase().includes('algar') &&
    !ct.roleDescription?.toLowerCase().includes('sdm') &&
    !ct.roleDescription?.toLowerCase().includes('vivo') &&
    !ct.roleDescription?.toLowerCase().includes('claro')
  );

  const contatosMicroset = contacts.filter((ct: any) => 
    ct.roleDescription?.toLowerCase().includes('gn microset') ||
    ct.roleDescription?.toLowerCase().includes('escalonamento interno') ||
    ct.roleDescription?.toLowerCase().includes('cco')
  );

  const totalContatosLocais = contatosComerciais.length + contatosPlantao.length + contatosMicroset.length;

  // Procedimentos gerais (excluindo escalonamento de operadora que fica dentro do circuito)
  const generalProcedures = (unit.procedures || []).filter((p: any) => {
    const id = (p.id || '').toLowerCase();
    const cat = (p.category || '').toLowerCase();
    const content = (p.content || '').toLowerCase();
    if (id.includes('algar') || cat === 'escalonamento' || content.includes('algar telecom')) return false;
    if (id === 'proc_gupe_vivo' || (content.includes('chamado - vivo') && content.includes('10315'))) return false;
    return true;
  });

  // Determina se a unidade necessita de integração de técnicos para atendimento local
  const getIntegrationStatus = (u: any) => {
    if (!u) return { required: false };
    
    const deps = (u.dependencies || '').trim();
    const depsLower = deps.toLowerCase();
    const idLower = (u.id || '').toLowerCase();
    const nameLower = (u.name || '').toLowerCase();

    // Se explicitamente indicado no campo
    if (depsLower.includes('não necessita') || depsLower.includes('nao necessita') || depsLower.includes('dispensa integração')) {
      return { required: false };
    }
    
    if (depsLower.includes('necessita de integração') || depsLower.includes('necessita integracao') || depsLower.includes('integração')) {
      return { required: true };
    }

    // Unidades industriais / usinas / CD / Barueri GUPE que obrigatoriamente exigem integração de técnicos Microset/Parceiro
    const isIndustrialOrPlant = 
      idLower.includes('usa') ||
      idLower.includes('uberaba') ||
      idLower.includes('ufra') ||
      idLower.includes('barracao') ||
      idLower.includes('guarulhos') ||
      idLower.includes('gupe') ||
      nameLower.includes('gupe') ||
      nameLower.includes('usina') ||
      nameLower.includes('concentrador') ||
      nameLower.includes('cd guarulhos') ||
      nameLower.includes('barracão');

    // Unidades puramente administrativas ou repetidoras sem integração
    const isOfficeOrTower = 
      idLower.includes('cantagalo') ||
      idLower.includes('sede') ||
      idLower.includes('fiusa') ||
      idLower.includes('torre') ||
      idLower.includes('imobiliaria') ||
      idLower.includes('quiosque');

    const required = isIndustrialOrPlant && !isOfficeOrTower;
    return { required };
  };

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

      {/* 2. Banner de Alerta Operacional Crítico de Escalonamento (Em Primeiro Lugar na Página) */}
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

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => copyCardText('alerta-cco', 'DIRETRIZ CCO BALBO: Em caso de alarme ou queda de enlace, avisar imediatamente nos grupos WhatsApp GB-MICROSET - NOC - INF (Cliente) e INT - Balbo CCO (Interno) com protocolo da operadora.')}
              className="bg-black/35 hover:bg-black/50 text-white p-2.5 rounded-xl border border-white/25 flex items-center justify-center transition-all cursor-pointer shadow-sm"
              title="Copiar diretriz de acionamento CCO"
            >
              {copiedCardId === 'alerta-cco' ? (
                <Check className="w-4 h-4 text-yellow-300 animate-scaleIn" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <div className="bg-black/25 px-3 py-2 rounded-xl border border-white/20 backdrop-blur-sm text-[11px] font-bold text-white">
              24x7 CCO N1
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cabeçalho Principal da Unidade + Dados de Urgência Operacional */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-extrabold text-micro-cyan tracking-wider">{unit.clientName}</span>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow-sm">
                🌿 Carteira N1 - AGRO
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                unit.isActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-gray-700 text-gray-200'
              }`}>
                {unit.isActive ? '✓ Unidade Ativa' : 'Desativada'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-micro-navy dark:text-white tracking-tight">
              {unit.name}
            </h1>

            {/* Metadados: Sem Código Intranet, mantendo Sankhya e GN */}
            <div className="flex flex-wrap items-center text-xs text-micro-muted mt-2 gap-3 sm:gap-4">
              <span>Ambiente: <strong className="text-micro-cyan font-bold">{unit.environment || 'Produção'}</strong></span>
              {unit.sankhyaCode && (
                <>
                  <span>•</span>
                  <span>Código Sankhya: <strong className="text-micro-navy dark:text-white font-mono">{unit.sankhyaCode}</strong></span>
                </>
              )}
              <span>•</span>
              <span>GN Microset: <strong className="text-micro-navy dark:text-white">{unit.gnName || 'Luis Henrique'}</strong></span>
            </div>
          </div>

          {/* Destaque Direita: Selo VIP em Evidência (Clicável para preview em Modal) */}
          {unit.clientIsVip && (
            <div 
              onClick={() => setPreviewImage({ src: vipBadge, label: 'Selo Oficial de Contrato VIP — Central CCO Microset' })}
              className="flex items-center space-x-3.5 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/5 dark:from-amber-400/20 dark:to-yellow-500/10 px-4 py-3 rounded-2xl border-2 border-amber-400/60 shadow-md shrink-0 cursor-zoom-in hover:brightness-105 transition-all group"
              title="Clique para visualizar o selo ampliado"
            >
              <img 
                src={vipBadge} 
                alt="Selo VIP" 
                className="h-12 w-auto object-contain drop-shadow-md transform group-hover:scale-110 transition-transform" 
              />
              <div className="text-left pr-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">
                    CONTRATO VIP
                  </span>
                </div>
                <div className="text-[11px] font-bold text-micro-navy dark:text-white leading-tight mt-0.5">
                  Atendimento Prioritário
                </div>
                <div className="text-[10px] text-micro-muted font-medium">SLA N1 Especial CCO</div>
              </div>
            </div>
          )}
        </div>

        {/* 3.1. INFORMAÇÕES DE URGÊNCIA CCO NO CABEÇALHO (Ícones de cópia intrínsecos e limpos) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-micro-line/60 dark:border-white/10">
          {/* Card 1: Endereço Completo */}
          <div className="bg-micro-bg/80 dark:bg-white/5 p-4 rounded-2xl border border-micro-line dark:border-white/10 flex items-start justify-between gap-3 shadow-xs group relative">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-micro-muted block">
                  Localização & Endereço Completo
                </span>
                <p className="text-xs font-bold text-micro-navy dark:text-white leading-relaxed mt-1 break-words">
                  {unit.address || `${unit.city || 'São Paulo'} - ${unit.state || 'SP'}`}
                </p>
                {unit.city && (
                  <span className="text-[11px] font-semibold text-micro-orange mt-1 block">
                    {unit.city}/{unit.state}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyCardText('urgencia-endereco', unit.address || `${unit.city || ''} - ${unit.state || ''}`)}
              className="p-2 rounded-xl text-micro-muted hover:text-micro-cyan hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-micro-line dark:hover:border-white/10 transition-all shrink-0 cursor-pointer shadow-xs"
              title="Copiar endereço completo"
            >
              {copiedCardId === 'urgencia-endereco' ? (
                <Check className="w-4 h-4 text-emerald-500 animate-scaleIn" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Card 2: Horário de Atendimento */}
          <div className="bg-micro-bg/80 dark:bg-white/5 p-4 rounded-2xl border border-micro-line dark:border-white/10 flex items-start justify-between gap-3 shadow-xs group relative">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-micro-cyan flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-black tracking-wider text-micro-muted block">
                  Horário de Funcionamento Local
                </span>
                <p className="text-xs font-bold text-micro-navy dark:text-white leading-relaxed mt-1">
                  {unit.businessHours || '08:00 às 18:00 — Segunda a Sexta'}
                </p>
                {unit.phone && (
                  <span className="text-[11px] font-mono text-micro-muted mt-1 block">
                    Fixo Local: <strong>{unit.phone}</strong>
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => copyCardText('urgencia-horario', `Horário: ${unit.businessHours || '08:00 às 18:00'}${unit.phone ? ` | Telefone: ${unit.phone}` : ''}`)}
              className="p-2 rounded-xl text-micro-muted hover:text-micro-cyan hover:bg-white dark:hover:bg-white/10 border border-transparent hover:border-micro-line dark:hover:border-white/10 transition-all shrink-0 cursor-pointer shadow-xs"
              title="Copiar horários e telefone"
            >
              {copiedCardId === 'urgencia-horario' ? (
                <Check className="w-4 h-4 text-emerald-500 animate-scaleIn" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Card 3: Aviso de Integração / Atendimento Local */}
          {(() => {
            const intStatus = getIntegrationStatus(unit);
            const copyText = intStatus.required
              ? '• Esta unidade necessita de integração de técnico Microset/Parceiro para atendimento local. Para acessar o sistema de controle de integração de técnicos https://hub.microset.net.br/ • Dúvidas quanto ao tema, questionar no grupo de WhatsApp: INTERNOM7-CCO/Integração M7-Fornecedores'
              : '• Esta unidade não necessita de integração de técnico Microset/Parceiro para atendimento local.';

            return (
              <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow-xs group relative transition-all ${
                intStatus.required
                  ? 'bg-amber-500/10 dark:bg-amber-400/10 border-amber-500/30'
                  : 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20'
              }`}>
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    intStatus.required
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {intStatus.required ? (
                      <ShieldCheck className="w-5 h-5" />
                    ) : (
                      <UserCheck className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`text-[10px] uppercase font-black tracking-wider ${
                        intStatus.required ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-400'
                      }`}>
                        Aviso de Integração
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        intStatus.required
                          ? 'bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/30'
                          : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25'
                      }`}>
                        {intStatus.required ? '⚠️ Integração Obrigatória' : '✓ Não Necessita de Integração'}
                      </span>
                    </div>

                    {intStatus.required ? (
                      <div className="text-xs text-micro-navy dark:text-white leading-relaxed space-y-1 font-medium">
                        <p>
                          • Esta unidade necessita de integração de técnico Microset/Parceiro para atendimento local. Para acessar o sistema de controle de integração de técnicos{' '}
                          <a 
                            href="https://hub.microset.net.br/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-0.5 font-bold text-micro-cyan hover:underline decoration-micro-cyan"
                          >
                            <span>clique aqui</span>
                            <ExternalLink className="w-3 h-3 inline" />
                          </a>.
                        </p>
                        <p className="text-[11px] text-micro-muted">
                          • Dúvidas quanto ao tema, questionar no grupo de WhatsApp:{' '}
                          <strong className="text-micro-navy dark:text-white font-bold">
                            INTERNOM7-CCO/Integração M7-Fornecedores
                          </strong>
                        </p>
                        <div className="pt-0.5 flex items-center gap-2">
                          <span className="text-[10px] font-mono font-semibold text-micro-muted bg-white/60 dark:bg-black/20 px-2 py-0.5 rounded border border-micro-line/50 dark:border-white/10">
                            Ticket#882005329
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-micro-navy dark:text-white leading-relaxed font-medium">
                        <p>
                          • Esta unidade não necessita de integração de técnico Microset/Parceiro para atendimento local.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyCardText('urgencia-integracao', copyText)}
                  className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer shadow-xs border ${
                    intStatus.required
                      ? 'text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border-transparent hover:border-amber-500/30'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-transparent hover:border-emerald-500/30'
                  }`}
                  title="Copiar aviso de integração"
                >
                  {copiedCardId === 'urgencia-integracao' ? (
                    <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-scaleIn" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 4. Imagem Grandona da Unidade (Hero Banner Clicável para Preview) */}
      {effectiveImage ? (
        <div className="bg-white dark:bg-micro-navy rounded-3xl overflow-hidden border border-micro-line dark:border-white/10 shadow-xl relative group">
          <div 
            onClick={() => setPreviewImage({ src: effectiveImage, label: `${unit.name} — ${effectiveLabel}` })}
            className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900 cursor-zoom-in"
            title="Clique para abrir imagem em tamanho real"
          >
            <img
              src={effectiveImage}
              alt={unit.name}
              className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-6">
              <div className="flex items-center justify-between w-full text-white">
                <div className="flex items-center space-x-2">
                  <ZoomIn className="w-4 h-4 text-micro-cyan" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow">
                    {effectiveLabel} (Clique para ampliar)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/80 hidden sm:block font-mono">
                    {unit.city} — {unit.state}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsModalOpen(true);
                    }}
                    className="bg-black/60 hover:bg-black/85 text-white text-xs font-bold px-3 py-1.5 rounded-xl backdrop-blur-sm flex items-center gap-1.5 transition-all shadow-md hover:scale-105 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Alterar Imagem</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Painel quando unidade ainda não tem foto */
        <div className="bg-white dark:bg-micro-navy rounded-3xl p-10 border border-dashed border-micro-line dark:border-white/15 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-micro-cyan/10 text-micro-cyan flex items-center justify-center">
            <ImageIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-micro-navy dark:text-white">Nenhuma imagem cadastrada para esta unidade</h3>
            <p className="text-xs text-micro-muted mt-1 max-w-md">
              Envie uma foto de fachada, rack ou dependência técnica para ilustrar o cadastro oficial do CCO.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-2 bg-gradient-to-r from-micro-blue to-micro-cyan hover:from-micro-cyan hover:to-micro-blue text-white text-xs font-extrabold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>Adicionar Imagem da Unidade</span>
          </button>
        </div>
      )}

      {/* 5. Barra de Controle Rápido das Seções */}
      <div className="flex items-center justify-between bg-white dark:bg-micro-navy rounded-2xl px-5 py-3 border border-micro-line dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-micro-muted">
          <Layers className="w-4 h-4 text-micro-cyan" />
          <span className="font-bold text-micro-navy dark:text-white">Seções Operacionais da Unidade</span>
          <span>•</span>
          <span>{unit.circuits?.length || 0} circuitos</span>
          <span>•</span>
          <span>{unit.procedures?.length || 0} procedimentos POP</span>
          <span>•</span>
          <span>{totalContatosLocais} contatos locais</span>
        </div>

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
      </div>

      {/* =========================================================================
          SEÇÃO 1: CIRCUITOS & CONECTIVIDADE (COM ESCALONAMENTO DA OPERADORA NO MESMO BALAIO)
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
              unit.circuits.map((c: any) => {
                const isOpen = openCircuits[c.id];
                const isPrimary = c.isPrimary;
                const isCopied = copiedCardId === `circuit-${c.id}`;
                const operatorContacts = getOperatorContactsForCircuit(c.operator);

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
                            {operatorContacts.length > 0 && (
                              <span className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 font-extrabold px-2 py-0.5 rounded">
                                {operatorContacts.length} Contato(s) Operadora
                              </span>
                            )}
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
                          className="p-2 rounded-xl text-micro-muted hover:text-micro-cyan hover:bg-micro-cyan/10 bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                          title="Copiar dados formatados do circuito"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-500 animate-scaleIn" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Gaveta Aberta com Detalhes do Circuito + ESCALONAMENTO DA OPERADORA NO MESMO BALAIO */}
                    {isOpen && (
                      <div className="p-5 border-t border-micro-line dark:border-white/10 bg-micro-bg/40 dark:bg-black/20 space-y-4 animate-fadeIn">
                        {/* 1.1. Grid de Parâmetros Técnicos do Circuito */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">Operadora</span>
                              <span className="text-sm font-extrabold text-micro-navy dark:text-white mt-0.5 block">{c.operator}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyCardText(`op-${c.id}`, c.operator)}
                              className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                              title="Copiar Operadora"
                            >
                              {copiedCardId === `op-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">Tecnologia</span>
                              <span className="text-sm font-extrabold text-micro-navy dark:text-white mt-0.5 block">{c.technology || 'Não informada'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyCardText(`tec-${c.id}`, c.technology || '')}
                              className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                              title="Copiar Tecnologia"
                            >
                              {copiedCardId === `tec-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">Banda Contratada</span>
                              <span className="text-sm font-extrabold text-micro-cyan mt-0.5 block">{c.speedMbps ? `${c.speedMbps} Mbps` : 'Não especificada'}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyCardText(`spd-${c.id}`, c.speedMbps ? `${c.speedMbps} Mbps` : '')}
                              className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                              title="Copiar Banda"
                            >
                              {copiedCardId === `spd-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">Prioridade</span>
                              <span className="text-sm font-extrabold text-micro-navy dark:text-white mt-0.5 block">{isPrimary ? 'Link Principal' : 'Link de Contingência'}</span>
                            </div>
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">Designador / ID Circuito</span>
                              <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.circuitId || '—'}</span>
                            </div>
                            {c.circuitId && (
                              <button
                                type="button"
                                onClick={() => copyCardText(`cid-${c.id}`, c.circuitId)}
                                className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                                title="Copiar ID Circuito"
                              >
                                {copiedCardId === `cid-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">N° Contrato Operadora</span>
                              <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.contractId || '—'}</span>
                            </div>
                            {c.contractId && (
                              <button
                                type="button"
                                onClick={() => copyCardText(`cnt-${c.id}`, c.contractId)}
                                className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                                title="Copiar Contrato"
                              >
                                {copiedCardId === `cnt-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">Endereço IP (LAN/WAN)</span>
                              <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.lpIp || '—'}</span>
                            </div>
                            {c.lpIp && (
                              <button
                                type="button"
                                onClick={() => copyCardText(`ip-${c.id}`, c.lpIp)}
                                className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                                title="Copiar IP"
                              >
                                {copiedCardId === `ip-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>

                          <div className="p-3 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 flex items-start justify-between">
                            <div>
                              <span className="text-micro-muted block text-[10px] uppercase font-bold">VPN / Conexão Túnel</span>
                              <span className="text-xs font-mono font-bold text-micro-navy dark:text-white mt-0.5 block select-all">{c.lpVpn || '—'}</span>
                            </div>
                            {c.lpVpn && (
                              <button
                                type="button"
                                onClick={() => copyCardText(`vpn-${c.id}`, c.lpVpn)}
                                className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg"
                                title="Copiar VPN"
                              >
                                {copiedCardId === `vpn-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {c.notes && (
                          <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-micro-navy dark:text-white flex items-start justify-between gap-2.5">
                            <div className="flex items-start gap-2.5">
                              <Info className="w-4 h-4 text-micro-cyan shrink-0 mt-0.5" />
                              <div>
                                <strong className="block text-micro-cyan text-[11px] uppercase tracking-wider font-extrabold">Diretriz Operacional do Circuito:</strong>
                                <p className="mt-0.5 leading-relaxed">{c.notes}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => copyCardText(`notes-${c.id}`, c.notes)}
                              className="text-micro-cyan hover:bg-micro-cyan/10 p-1.5 rounded-lg shrink-0 cursor-pointer"
                              title="Copiar diretriz"
                            >
                              {copiedCardId === `notes-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}

                        {/* 1.2. NO MESMO BALAIO: ESCALONAMENTO & CONTATOS DESTA OPERADORA */}
                        {operatorContacts.length > 0 && (
                          <div className="pt-3 border-t border-micro-line dark:border-white/10 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <PhoneCall className="w-4 h-4 text-micro-cyan" />
                                <span className="text-xs font-black uppercase tracking-wider text-micro-navy dark:text-white">
                                  Escalonamento & Contatos Diretos — {c.operator.toUpperCase()}
                                </span>
                                <span className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-extrabold px-2 py-0.5 rounded">
                                  {operatorContacts.length} Contato(s) da Operadora
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {operatorContacts.map((ct: any) => {
                                const isCtCopied = copiedCardId === `ct-circ-${c.id}-${ct.id}`;
                                return (
                                  <div 
                                    key={ct.id} 
                                    className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-blue-500/30 dark:border-white/15 shadow-xs flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const info = `[${c.operator.toUpperCase()}] ${ct.name} (${ct.roleDescription}) - Tel: ${ct.phone || ct.mobile || 'N/A'}`;
                                            copyCardText(`ct-circ-${c.id}-${ct.id}`, info);
                                          }}
                                          className="text-micro-muted hover:text-micro-cyan p-1 rounded-lg transition-colors cursor-pointer"
                                          title="Copiar contato operadora"
                                        >
                                          {isCtCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                        </button>
                                      </div>
                                      <div className="text-[11px] text-micro-cyan font-bold mt-0.5">{ct.roleDescription}</div>
                                      {(ct.phone || ct.mobile) && (
                                        <div className="mt-2 text-xs font-mono font-bold text-micro-navy dark:text-white">
                                          {ct.phone || ct.mobile}
                                        </div>
                                      )}
                                      {ct.schedule && (
                                        <div className="text-[10px] text-micro-muted mt-1">
                                          Janela: {ct.schedule}
                                        </div>
                                      )}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-micro-line/60 dark:border-white/10 flex items-center justify-between">
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
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* 1.3. MATRIZ DE ESCALONAMENTO & PROCEDIMENTOS DIRETAMENTE DENTRO DO LINK DA OPERADORA */}
                        {(() => {
                          const isAlgar = c.operator?.toLowerCase().includes('algar');
                          const isVivo = c.operator?.toLowerCase().includes('vivo');
                          
                          // Procura se tem procedimento específico no cadastro da unidade
                          const matchingProc = (unit.procedures || []).find((p: any) => {
                            const id = (p.id || '').toLowerCase();
                            const content = (p.content || '').toLowerCase();
                            if (isAlgar && (id.includes('algar') || p.category === 'escalonamento' || content.includes('sdm') || content.includes('algar'))) return true;
                            if (isVivo && (id.includes('vivo') || content.includes('10315') || content.includes('chamado vivo'))) return true;
                            return false;
                          });

                          const defaultAlgarContent = `### Escalonamento Algar Telecom - Atendimento Premium (Grupo Balbo)

> [!NOTE]
> Sempre acione o SDM (Service Delivery Manager) ao abrir chamados para escalar a Algar Telecom. Em casos críticos ou sem avanço, siga a hierarquia abaixo.

| Nível / Função | Responsável | Telefone | E-mail |
| :--- | :--- | :--- | :--- |
| **SDM Oficial** | **Leydiane Reis** | (34) 99781-2888 | leydiane@algartelecom.com.br |
| **SDM Substituto (Férias)** | **Lucas Medeiros** | (34) 99869-0316 | lucasom@algartelecom.com.br |
| **SDM Dedicado Balbo** | **Diego Ribeiro** | (34) 99880-0382 | diego.ribeiro@algartelecom.com.br |
| **Gestora Premium** | **Raissa Gomide** | (19) 99985-9680 | raissa@algartelecom.com.br |
| **Consultor Comercial** | **Tulio Japaulo** | (16) 99143-0035 | tulioj@algartelecom.com.br |
| **Gerente Regional** | **Francisco Aguila** | (16) 99965-0501 | francisco@algartelecom.com.br |
| **Central Algar NOC** | **Plantão 24x7** | 10312 / 0800 942 1212 | — |`;

                          const displayContent = matchingProc?.content || (isAlgar ? defaultAlgarContent : null);
                          if (!displayContent) return null;

                          return (
                            <div className="pt-3 border-t border-micro-line dark:border-white/10 space-y-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-micro-cyan" />
                                  <span className="text-xs font-black uppercase tracking-wider text-micro-navy dark:text-white">
                                    {isAlgar ? 'Escalonamento & Matriz SDM — Algar Telecom' : `Procedimento Operacional — ${c.operator}`}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => copyCardText(`proc-circ-${c.id}`, displayContent)}
                                  className="p-1.5 rounded-lg text-micro-muted hover:text-micro-cyan hover:bg-micro-cyan/10 transition-colors cursor-pointer"
                                  title="Copiar escalonamento"
                                >
                                  {copiedCardId === `proc-circ-${c.id}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>

                              <div className="p-4 sm:p-5 bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10 shadow-xs">
                                <ProcedureContent 
                                  content={displayContent} 
                                  onImageClick={(src, alt) => setPreviewImage({ src, label: alt || 'Procedimento Operacional' })}
                                />
                              </div>
                            </div>
                          );
                        })()}
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
                PROCEDIMENTOS OPERACIONAIS & DIRETRIZES POP ({generalProcedures.length})
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
            {(!generalProcedures || generalProcedures.length === 0) ? (
              <div className="p-8 text-center text-xs text-micro-muted bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10">
                Nenhum procedimento geral cadastrado. Siga os procedimentos padrão do catálogo.
              </div>
            ) : (
              generalProcedures.map((p: any, idx: number) => {
                const procKey = p.id || `proc-${idx}`;
                const isOpen = openProcedures[procKey];
                const isCopied = copiedCardId === `pop-${procKey}`;

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

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Botão de Cópia Intrínseco do POP */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyCardText(`pop-${procKey}`, `[PROCEDIMENTO CCO - ${catLabel}]\n${p.content}`);
                          }}
                          className="p-2 rounded-xl text-micro-muted hover:text-micro-cyan hover:bg-micro-cyan/10 bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 transition-all flex items-center justify-center cursor-pointer shadow-xs"
                          title="Copiar procedimento na íntegra"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-500 animate-scaleIn" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <div className="w-7 h-7 rounded-full bg-micro-bg dark:bg-white/5 flex items-center justify-center text-micro-muted shrink-0">
                          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo Renderizado com Markdown */}
                    {isOpen && (
                      <div className="p-6 border-t border-micro-line dark:border-white/10 bg-micro-bg/30 dark:bg-black/20 animate-fadeIn">
                        <ProcedureContent 
                          content={p.content} 
                          onImageClick={(src, alt) => setPreviewImage({ src, label: alt || 'Procedimento Operacional' })}
                        />
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
          SEÇÃO 3: ESCALONAMENTOS & CONTATOS LOCAIS DA UNIDADE
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
                Matriz de Comunicação Local & Governança
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                ESCALONAMENTOS & CONTATOS LOCAIS DA UNIDADE ({totalContatosLocais})
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

        {/* Conteúdo com Sub-Gavetas (Horário Comercial Local, Plantão Local, Microset) */}
        {openSections.escalonamentos && (
          <div className="p-4 sm:p-6 space-y-4 bg-micro-bg/40 dark:bg-white/[0.02]">
            {/* Aviso Operacional orientando que operadoras estão no circuito */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-micro-navy dark:text-white flex items-center gap-2.5">
              <Info className="w-4 h-4 text-micro-cyan shrink-0" />
              <span>
                <strong>Organização por Circuito:</strong> Os contatos e escalonamentos de operadoras (ex: <strong>Algar Telecom, SDM e Centrais 0800</strong>) estão agrupados diretamente dentro de cada circuito na seção <strong>Circuitos & Conexões de Rede</strong> acima.
              </span>
            </div>

            {/* 3.1. Sub-seção: Horário Comercial Local */}
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
                      <span>CONTATOS LOCAIS — HORÁRIO COMERCIAL (08:00 às 18:00)</span>
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
                  {contatosComerciais.length === 0 ? (
                    <div className="p-4 text-xs text-micro-muted col-span-full">Nenhum contato local específico para horário comercial registrado.</div>
                  ) : (
                    contatosComerciais.map((ct: any) => {
                      const isCopied = copiedCardId === `ct-${ct.id}`;
                      return (
                        <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                              <button
                                type="button"
                                onClick={() => {
                                  const info = `${ct.name} (${ct.roleDescription}) - Tel: ${ct.phone || ct.mobile || ct.whatsapp || 'N/A'}`;
                                  copyCardText(`ct-${ct.id}`, info);
                                }}
                                className="text-micro-muted hover:text-micro-cyan p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Copiar contato"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
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
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 3.2. Sub-seção: Fora do Horário Comercial / Plantão Local */}
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
                      <span>CONTATOS LOCAIS — FORA DO HORÁRIO COMERCIAL / PLANTÃO LOCAL</span>
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
                  {contatosPlantao.length === 0 ? (
                    <div className="p-4 text-xs text-micro-muted col-span-full">Nenhum plantão local específico registrado para esta unidade.</div>
                  ) : (
                    contatosPlantao.map((ct: any) => {
                      const isCopied = copiedCardId === `ct-${ct.id}`;
                      return (
                        <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-amber-500/20 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                              <button
                                type="button"
                                onClick={() => {
                                  const info = `[PLANTÃO LOCAL] ${ct.name} (${ct.roleDescription}) - Tel: ${ct.whatsapp || ct.mobile || ct.phone || 'N/A'}`;
                                  copyCardText(`ct-${ct.id}`, info);
                                }}
                                className="text-micro-muted hover:text-micro-cyan p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Copiar contato de plantão"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                            <div className="text-[11px] text-micro-muted mt-0.5">{ct.roleDescription}</div>
                            {(ct.mobile || ct.whatsapp || ct.phone) && (
                              <div className="mt-2 text-sm font-mono font-black text-micro-orange">
                                {ct.whatsapp || ct.mobile || ct.phone}
                              </div>
                            )}
                            <span className="text-[10px] text-micro-muted mt-1 block">Plantão Local da Unidade</span>
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
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 3.3. Sub-seção: Governança Interna Microset CCO */}
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
                    {contatosMicroset.map((ct: any) => {
                      const isCopied = copiedCardId === `ct-${ct.id}`;
                      return (
                        <div key={ct.id} className="p-3.5 bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 shadow-xs flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div className="font-bold text-xs text-micro-navy dark:text-white">{ct.name}</div>
                              <button
                                type="button"
                                onClick={() => {
                                  const info = `[MICROSET CCO] ${ct.name} (${ct.roleDescription}) - Tel: ${ct.mobile || ct.phone || 'N/A'}`;
                                  copyCardText(`ct-${ct.id}`, info);
                                }}
                                className="text-micro-muted hover:text-micro-cyan p-1.5 rounded-lg transition-colors cursor-pointer"
                                title="Copiar contato Microset"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
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
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Dica Operacional M7 no Rodapé (Mascote também clicável para preview) */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-white/5 dark:to-white/10 rounded-3xl p-5 border border-micro-cyan/20 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <img 
            src={m7Lightbulb} 
            alt="Dica M7" 
            onClick={() => setPreviewImage({ src: m7Lightbulb, label: 'Mascote Operacional M7 — Central CCO Microset' })}
            className="w-12 h-12 object-contain shrink-0 drop-shadow-sm cursor-zoom-in hover:scale-110 transition-transform" 
            title="Clique para visualizar"
          />
          <div>
            <div className="text-xs font-bold text-micro-navy dark:text-white flex items-center gap-2">
              <span>Orientação Operacional do M7</span>
              <span className="bg-micro-cyan/15 text-micro-cyan text-[10px] font-black px-2 py-0.5 rounded-full">CCO N1</span>
            </div>
            <p className="text-xs text-micro-muted mt-1 leading-relaxed">
              Consulte sempre o <strong>endereço, horário de atendimento e dependências técnicas no cabeçalho</strong> antes de acionar técnicos em campo. Ao investigar falha em circuito (ex: <strong>Algar</strong>), expanda o circuito para acessar diretamente o <strong>ID, Contrato, IP e o Escalonamento da Operadora no mesmo local</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          MODAL LIGHTBOX DE PREVIEW DE IMAGEM
          (Fecha ao clicar fora ou ao pressionar ESC)
          ========================================================================= */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          {/* Botão de Fechar no topo direito */}
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/50 hover:bg-black/80 p-2.5 rounded-full backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-xl z-10"
            title="Fechar preview (ESC)"
          >
            <X className="w-6 h-6" />
          </button>

          <div 
            className="relative max-w-5xl max-h-[90vh] flex flex-col items-center cursor-default select-none"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.src}
              alt={previewImage.label || 'Preview da Imagem'}
              className="max-h-[82vh] max-w-[92vw] object-contain rounded-2xl shadow-2xl border border-white/20"
            />
            {previewImage.label && (
              <div className="mt-3.5 px-4 py-1.5 bg-black/75 backdrop-blur-md rounded-xl text-white text-xs font-semibold tracking-wide border border-white/10 text-center max-w-lg shadow-lg">
                {previewImage.label}
              </div>
            )}
            <span className="text-[11px] text-white/60 mt-2 font-medium">
              Pressione <kbd className="px-1.5 py-0.5 bg-white/15 rounded text-[10px] font-mono border border-white/20">ESC</kbd> ou clique fora da imagem para fechar
            </span>
          </div>
        </div>
      )}

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
