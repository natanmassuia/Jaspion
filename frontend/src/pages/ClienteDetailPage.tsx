import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building, MapPin, ChevronRight, ArrowLeft } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';

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
    fetch(`/api/clientes/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setClient(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-12 text-center text-sm text-micro-muted">Carregando cliente...</div>;
  if (!client) return <div className="p-12 text-center text-sm text-red-500">Cliente não encontrado.</div>;

  return (
    <div className="space-y-6">
      <Link to="/clientes" className="inline-flex items-center text-xs font-bold text-micro-cyan hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Clientes
      </Link>

      {/* Header do Cliente */}
      <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-micro-navy/10 dark:bg-white/10 flex items-center justify-center text-micro-cyan">
            <Building className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-micro-navy dark:text-white">{client.name}</h1>
              {client.isVip && <img src={vipBadge} alt="VIP" className="h-7 w-auto" />}
            </div>
            <p className="text-sm text-micro-muted mt-1">{client.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          <div className="bg-micro-bg dark:bg-white/5 p-3 rounded-xl border border-micro-line dark:border-white/10">
            <span className="text-micro-muted block">Gerente de Negócios (GN)</span>
            <span className="font-bold text-micro-navy dark:text-white">{client.gnName}</span>
          </div>
          <div className="bg-micro-bg dark:bg-white/5 p-3 rounded-xl border border-micro-line dark:border-white/10">
            <span className="text-micro-muted block">Responsável Interno CCO</span>
            <span className="font-bold text-micro-navy dark:text-white">{client.managerName}</span>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex space-x-2 border-b border-micro-line dark:border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('unidades')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'unidades' ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy' : 'text-micro-muted hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Unidades Operacionais ({client.units?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('procedimentos')}
          className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
            activeTab === 'procedimentos' ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy' : 'text-micro-muted hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Procedimentos & Escalonamentos
        </button>
      </div>

      {/* Conteúdo das Abas */}
      {activeTab === 'unidades' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {client.units?.map((u: any) => {
            const media = UNIT_IMAGES[u.id];
            return (
              <Link
                key={u.id}
                to={`/unidades/${u.id}`}
                className="bg-white dark:bg-micro-navy rounded-2xl overflow-hidden border border-micro-line dark:border-white/10 shadow-sm hover:border-micro-cyan hover:shadow-md transition-all group flex flex-col justify-between"
              >
                {media && (
                  <div className="relative h-40 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={media.image}
                      alt={u.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow ${
                        u.isActive ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300'
                      }`}>
                        {u.isActive ? 'Ativa' : 'Desativada'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                      {u.name}
                    </h3>
                    <div className="flex items-center text-xs text-micro-muted mt-1">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-micro-orange" />
                      {u.city}/{u.state}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-micro-line/50 dark:border-white/5 flex items-center justify-between text-xs text-micro-cyan font-bold">
                    <span>Ver Circuitos & Escalonamento</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 border border-micro-line dark:border-white/10 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-micro-navy dark:text-white">Procedimento Operacional Padronizado</h3>
          {client.procedures?.map((p: any) => (
            <div key={p.id} className="prose dark:prose-invert max-w-none text-sm whitespace-pre-line bg-micro-bg dark:bg-white/5 p-5 rounded-xl border border-micro-line dark:border-white/10">
              {p.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
