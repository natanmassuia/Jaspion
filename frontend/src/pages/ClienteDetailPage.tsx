import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, ChevronRight, ArrowLeft, ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';
import m7Presenting from '../assets/mascote/m7-presenting.png';
import m7Lightbulb from '../assets/mascote/m7-lightbulb.png';

const UNIT_IMAGES: Record<string, { image: string; label: string }> = {
  'balbo-usa-concentrador': { image: '/assets/balbo-usa.jpg', label: 'Foto oficial' },
  'balbo-usina-uberaba': { image: '/assets/balbo-ube.jpg', label: 'Foto oficial' },
  'balbo-ufra-usina-sao-francisco': { image: '/assets/balbo-ufra.jpg', label: 'Foto oficial' },
  'balbo-native-guarulhos': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Ilustrativa' },
  'balbo-native-fiusa': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Ilustrativa' },
  'balbo-barrinha-deposito': { image: '/assets/balbo-barrinha-illustrative.png', label: 'Ilustrativa' },
  'balbo-santa-ernestina': { image: '/assets/balbo-santa-ernestina-illustrative.png', label: 'Ilustrativa' },
  'balbo-torre-sertaozinho': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Ilustrativa' },
  'balbo-barueri-gupe': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Ilustrativa' },
  'balbo-cantagalo': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Ilustrativa' },
  'balbo-torre-altinopolis': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Ilustrativa' }
};

export function ClienteDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'unidades' | 'procedimentos'>('unidades');

  useEffect(() => {
    apiFetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setClient(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-16 text-center text-sm text-micro-muted flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-micro-cyan border-t-transparent rounded-full animate-spin"></div>
        <span>Carregando perfil do cliente...</span>
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

  const isBalbo = client.id === 'balbo' || client.name.toLowerCase().includes('balbo');

  return (
    <div className="space-y-6">
      <Link 
        to="/clientes" 
        className="inline-flex items-center text-xs font-bold text-micro-cyan hover:underline bg-white dark:bg-micro-navy px-3 py-1.5 rounded-xl border border-micro-line dark:border-white/10 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para Clientes
      </Link>

      {/* Header do Cliente com Mascote M7 */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-micro-blue/10 dark:bg-white/10 flex items-center justify-center text-micro-cyan shrink-0">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-micro-navy dark:text-white">{client.name}</h1>
              {client.isVip && <img src={vipBadge} alt="VIP" className="h-6 w-auto" />}
              {isBalbo && (
                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                  🌾 Carteira N1 - AGRO
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-micro-muted mt-1 max-w-2xl leading-relaxed">{client.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center gap-3 text-xs">
          <div className="bg-micro-bg dark:bg-white/5 p-3 rounded-2xl border border-micro-line dark:border-white/10">
            <span className="text-micro-muted block text-[11px]">Gerente de Negócios:</span>
            <span className="font-bold text-micro-navy dark:text-white">{client.gnName || 'Não informado'}</span>
          </div>
          <div className="bg-micro-bg dark:bg-white/5 p-3 rounded-2xl border border-micro-line dark:border-white/10">
            <span className="text-micro-muted block text-[11px]">Responsável CCO:</span>
            <span className="font-bold text-micro-navy dark:text-white">{client.managerName || 'CCO N1'}</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex space-x-2 border-b border-micro-line dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('unidades')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'unidades' 
              ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy shadow-md' 
              : 'text-micro-muted hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          🏭 Unidades Operacionais ({client.units?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('procedimentos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'procedimentos' 
              ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy shadow-md' 
              : 'text-micro-muted hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          📖 Procedimentos & Escalonamentos
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'unidades' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {client.units?.map((u: any) => {
            const media = UNIT_IMAGES[u.id];
            return (
              <Link
                key={u.id}
                to={`/unidades/${u.id}`}
                className="bg-white dark:bg-micro-navy rounded-3xl overflow-hidden border border-micro-line dark:border-white/10 shadow-sm hover:border-micro-cyan hover:shadow-xl transition-all group flex flex-col justify-between hover:-translate-y-1"
              >
                {media && (
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={media.image}
                      alt={u.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shadow-md ${
                        u.isActive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {u.isActive ? '● Ativa' : 'Desativada'}
                      </span>
                    </div>
                    <div className="absolute bottom-2 left-3 text-[10px] text-white/90 bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-sm">
                      {media.label}
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                      {u.name}
                    </h3>
                    <div className="flex items-center text-xs text-micro-muted mt-1.5">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-micro-orange" />
                      {u.city}/{u.state}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-micro-line/50 dark:border-white/5 flex items-center justify-between text-xs text-micro-cyan font-bold">
                    <span>Ver Circuitos & Escalonamento</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm space-y-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-micro-cyan" />
            <div>
              <h3 className="text-lg font-bold text-micro-navy dark:text-white">Procedimento Operacional Padronizado</h3>
              <p className="text-xs text-micro-muted">Diretrizes de atendimento exclusivo para {client.name}.</p>
            </div>
          </div>
          {client.procedures?.map((p: any) => (
            <div key={p.id} className="text-xs leading-relaxed whitespace-pre-line bg-micro-bg dark:bg-white/5 p-6 rounded-2xl border border-micro-line dark:border-white/10 text-micro-navy dark:text-white font-sans">
              {p.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
