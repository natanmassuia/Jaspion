import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Building, MapPin, ChevronRight, ArrowLeft, BookOpen, Camera, Image as ImageIcon, Plus, CheckCircle2, Sparkles, X, ZoomIn } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';
import { ImageUploadModal } from '../components/ImageUploadModal';
import { UnitFormModal } from '../components/UnitFormModal';

const UNIT_IMAGES: Record<string, { image: string; label: string }> = {
  'balbo-usa-concentrador': { image: '/assets/balbo-usa.jpg', label: 'Foto oficial' },
  'balbo-usina-uberaba': { image: '/assets/balbo-ube.jpg', label: 'Foto oficial' },
  'balbo-ufra-usina-sao-francisco': { image: '/assets/balbo-ufra.jpg', label: 'Foto oficial' },
  'balbo-native-guarulhos': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Ilustrativa' },
  'balbo-native-fiusa': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Ilustrativa' },
  'balbo-usina-sao-francisco-escritorio': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Ilustrativa' },
  'balbo-barrinha-deposito': { image: '/assets/balbo-barrinha-illustrative.png', label: 'Ilustrativa' },
  'balbo-usina-sao-francisco-barracao': { image: '/assets/balbo-barrinha-illustrative.png', label: 'Ilustrativa' },
  'balbo-santa-ernestina': { image: '/assets/balbo-santa-ernestina-illustrative.png', label: 'Ilustrativa' },
  'balbo-torre-sertaozinho': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Ilustrativa' },
  'balbo-barueri-gupe': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Ilustrativa' },
  'balbo-cantagalo': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Ilustrativa' },
  'balbo-sao-paulo-sede': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Ilustrativa' },
  'balbo-torre-altinopolis': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Ilustrativa' }
};

export function ClienteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unidades' | 'procedimentos'>('unidades');

  // Modal de Imagem
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    targetType: 'client' | 'unit';
    targetId: string;
    title: string;
    subtitle: string;
    currentImageUrl?: string | null;
  }>({
    isOpen: false,
    targetType: 'client',
    targetId: '',
    title: '',
    subtitle: '',
    currentImageUrl: null
  });

  // Modal de Cadastro de Unidade
  const [isCreateUnitModalOpen, setIsCreateUnitModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  const loadClient = () => {
    setLoading(true);
    apiFetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setClient(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-micro-muted flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-micro-cyan border-t-transparent rounded-full animate-spin"></div>
        <span>Carregando dados operacionais do cliente...</span>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="p-16 text-center space-y-4">
        <div className="text-red-500 font-bold text-lg">Cliente não encontrado.</div>
        <Link to="/clientes" className="text-xs text-micro-cyan font-bold hover:underline">
          Voltar para a lista de clientes
        </Link>
      </div>
    );
  }

  const isBalbo = client.id === 'grupo-balbo' || client.id === 'balbo' || client.name.toLowerCase().includes('balbo');

  const handleImageUpdated = (newImageUrl: string) => {
    if (modalConfig.targetType === 'client') {
      setClient((prev: any) => ({ ...prev, imageUrl: newImageUrl }));
    } else {
      setClient((prev: any) => ({
        ...prev,
        units: prev.units?.map((u: any) =>
          u.id === modalConfig.targetId ? { ...u, imageUrl: newImageUrl } : u
        )
      }));
    }
  };

  const handleUnitCreated = (newUnit: any) => {
    loadClient();
    setFeedback(`Unidade "${newUnit.name}" cadastrada com sucesso!`);
    setTimeout(() => setFeedback(null), 5000);
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {feedback && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-micro-muted hover:text-white">✕</button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link 
          to="/clientes" 
          className="inline-flex items-center text-xs font-bold text-micro-cyan hover:underline bg-white dark:bg-micro-navy px-3 py-1.5 rounded-xl border border-micro-line dark:border-white/10 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para Clientes
        </Link>

        <button
          onClick={() => setIsCreateUnitModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-micro-blue to-micro-cyan hover:from-micro-cyan hover:to-micro-blue text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Unidade</span>
        </button>
      </div>

      {/* Header do Cliente com Logo e Dados (Levemente elevado e mais compacto) */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-5 sm:p-6 border border-micro-line dark:border-white/10 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-start space-x-4 min-w-0">
          <div className="relative group shrink-0">
            <div 
              onClick={() => client.imageUrl && setPreviewImage({ src: client.imageUrl, label: `Logomarca Oficial — ${client.name}` })}
              className={`w-16 h-16 rounded-2xl bg-micro-blue/10 dark:bg-white/10 flex items-center justify-center text-micro-cyan overflow-hidden border border-micro-line dark:border-white/10 ${client.imageUrl ? 'cursor-zoom-in' : ''}`}
            >
              {client.imageUrl ? (
                <img src={client.imageUrl} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <Building className="w-8 h-8" />
              )}
            </div>
            <button
              onClick={() => setModalConfig({
                isOpen: true,
                targetType: 'client',
                targetId: client.id,
                title: 'Logomarca do Cliente',
                subtitle: client.name,
                currentImageUrl: client.imageUrl
              })}
              className="absolute -bottom-1 -right-1 bg-micro-navy text-white p-1.5 rounded-full border border-white/20 shadow-md hover:bg-micro-cyan transition-colors cursor-pointer"
              title="Alterar foto / logomarca"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-micro-navy dark:text-white truncate">
              {client.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-micro-muted">
              <span>{client.economicGroup || 'Sem grupo associado'}</span>
              <span>•</span>
              <span>Sankhya: <strong className="text-micro-navy dark:text-white">{client.sankhyaCode || '—'}</strong></span>
              <span>•</span>
              <span>Gerente GN: <strong className="text-micro-navy dark:text-white">{client.gnName || 'Não informado'}</strong></span>
            </div>
          </div>
        </div>

        {/* Centro / Destaque: Selo VIP em Evidência na mesma caixa amarela das unidades */}
        {client.isVip && (
          <div 
            onClick={() => setPreviewImage({ src: vipBadge, label: `Selo Oficial de Contrato VIP — ${client.name}` })}
            className="flex items-center space-x-3.5 bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-amber-500/5 dark:from-amber-400/20 dark:to-yellow-500/10 px-5 py-3 rounded-2xl border-2 border-amber-400/60 shadow-md shrink-0 cursor-zoom-in hover:brightness-105 transition-all group"
            title="Clique para visualizar o selo VIP ampliado"
          >
            <img 
              src={vipBadge} 
              alt="VIP" 
              className="w-12 h-12 object-contain drop-shadow-md group-hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  CONTRATO VIP CCO
                </span>
              </div>
              <div className="text-[11px] font-bold text-micro-navy dark:text-white leading-tight mt-0.5">
                Atendimento Prioritário
              </div>
              <div className="text-[10px] text-micro-muted font-medium">SLA N1 Especial CCO</div>
            </div>
          </div>
        )}

        {isBalbo && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold text-lg">
              🌿
            </div>
            <div>
              <div className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                Cliente Estratégico Agro
              </div>
              <div className="text-[11px] text-micro-muted">
                11 Unidades (8 operacionais) • Suporte CCO Prioritário
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-micro-line dark:border-white/10 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('unidades')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'unidades' 
                ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy shadow-md' 
                : 'text-micro-muted hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            🏢 Unidades Operacionais ({client.units?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('procedimentos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'procedimentos' 
                ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy shadow-md' 
                : 'text-micro-muted hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            📋 Procedimentos & Escalonamentos
          </button>
        </div>

        <button
          onClick={() => setIsCreateUnitModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-micro-cyan hover:text-micro-blue transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Unidade</span>
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'unidades' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {client.units?.map((u: any) => {
            const unitImage = u.imageUrl || UNIT_IMAGES[u.id]?.image || null;
            const unitLabel = u.imageUrl ? 'Personalizada' : (UNIT_IMAGES[u.id]?.label || 'Oficial');

            return (
              <div
                key={u.id}
                onClick={() => navigate(`/unidades/${u.id}`)}
                className="cursor-pointer bg-white dark:bg-micro-navy rounded-3xl overflow-hidden border border-micro-line dark:border-white/10 shadow-sm hover:border-micro-cyan/60 hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between"
              >
                {/* Imagem da Unidade (Foto oficial, personalizada ou placeholder com botão) */}
                {unitImage ? (
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={unitImage}
                      alt={u.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewImage({ src: unitImage, label: `${u.name} — ${unitLabel}` });
                      }}
                      className="absolute top-3 left-3 bg-black/60 hover:bg-black/85 text-white p-1.5 rounded-xl backdrop-blur-sm transition-all shadow-md hover:scale-105 z-10 cursor-pointer"
                      title="Visualizar imagem ampliada"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md ${
                        u.isActive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {u.isActive ? '✓ Ativa' : 'Desativada'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-3 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {unitLabel}
                    </div>

                    {/* Botão de Alterar Imagem */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalConfig({
                          isOpen: true,
                          targetType: 'unit',
                          targetId: u.id,
                          title: `Alterar Imagem da Unidade`,
                          subtitle: u.name,
                          currentImageUrl: unitImage
                        });
                      }}
                      className="absolute bottom-2 right-2 bg-black/70 hover:bg-black/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl backdrop-blur-sm flex items-center gap-1.5 transition-all shadow-md hover:scale-105 z-10 cursor-pointer"
                      title="Alterar imagem desta unidade"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Alterar Foto</span>
                    </button>
                  </div>
                ) : (
                  /* Placeholder elegante quando unidade ainda não tem foto (ex: Sede SP) */
                  <div className="relative h-44 w-full bg-slate-800/80 dark:bg-black/40 border-b border-micro-line/50 dark:border-white/5 flex flex-col items-center justify-center p-4 text-center">
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md ${
                        u.isActive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {u.isActive ? '✓ Ativa' : 'Desativada'}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-micro-cyan mb-2 group-hover:scale-110 transition-transform">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white/90">Sem imagem cadastrada</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalConfig({
                          isOpen: true,
                          targetType: 'unit',
                          targetId: u.id,
                          title: `Adicionar Imagem da Unidade`,
                          subtitle: u.name,
                          currentImageUrl: null
                        });
                      }}
                      className="mt-2.5 bg-micro-cyan hover:bg-micro-cyan/90 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md transition-all hover:scale-105 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Adicionar Foto</span>
                    </button>
                  </div>
                )}

                {/* Conteúdo do Card */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                      {u.name}
                    </h3>
                    <div className="flex items-center text-xs text-micro-muted mt-1.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-micro-orange shrink-0" />
                      {u.city}/{u.state}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-micro-line/50 dark:border-white/5 flex items-center justify-between text-xs text-micro-cyan font-bold">
                    <span>Ver Circuitos & Escalonamento</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-micro-cyan" />
            <div>
              <h3 className="text-lg font-bold text-micro-navy dark:text-white">Procedimentos Operacionais Padronizados</h3>
              <p className="text-xs text-micro-muted">Diretrizes de telecomunicação, contingência e infraestrutura para {client.name}.</p>
            </div>
          </div>
          {client.procedures?.map((p: any) => (
            <div key={p.id} className="text-xs leading-relaxed whitespace-pre-line bg-micro-bg dark:bg-white/5 p-6 rounded-2xl border border-micro-line dark:border-white/10 text-micro-navy dark:text-white font-sans">
              {p.content}
            </div>
          ))}
        </div>
      )}

      {/* Modal de Upload de Imagem */}
      <ImageUploadModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        targetType={modalConfig.targetType}
        targetId={modalConfig.targetId}
        currentImageUrl={modalConfig.currentImageUrl}
        onSuccess={handleImageUpdated}
      />

      {/* Modal de Cadastro de Unidade */}
      <UnitFormModal
        isOpen={isCreateUnitModalOpen}
        onClose={() => setIsCreateUnitModalOpen(false)}
        onSuccess={handleUnitCreated}
        defaultClientId={client.id}
        defaultClientName={client.name}
      />

      {/* Lightbox / Modal de Preview de Imagens Ampliadas */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn cursor-zoom-out"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-4xl max-h-[90vh] bg-micro-navy border border-white/20 rounded-3xl p-3 sm:p-5 shadow-2xl flex flex-col items-center cursor-default"
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Fechar (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={previewImage.src} 
              alt={previewImage.label || 'Visualização Ampliada'} 
              className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-md"
            />
            {previewImage.label && (
              <div className="mt-3 text-center text-xs font-bold text-white/90 bg-white/10 px-4 py-1.5 rounded-xl border border-white/15">
                {previewImage.label}
              </div>
            )}
            <span className="text-[10px] text-micro-muted mt-2">Pressione ESC ou clique fora da imagem para fechar</span>
          </div>
        </div>
      )}
    </div>
  );
}
