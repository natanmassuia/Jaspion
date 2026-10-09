import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Radio, Phone, ShieldCheck, MapPin, Cpu, Camera, Clock, Building2 } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';

const UNIT_IMAGES: Record<string, { image: string; label: string }> = {
  'balbo-usa-concentrador': { image: '/assets/balbo-usa.jpg', label: 'Foto oficial — Native / Grupo Balbo' },
  'balbo-usina-uberaba': { image: '/assets/balbo-ube.jpg', label: 'Foto oficial — Native / Grupo Balbo' },
  'balbo-ufra-usina-sao-francisco': { image: '/assets/balbo-ufra.jpg', label: 'Foto oficial — Native / Grupo Balbo' },
  'balbo-native-guarulhos': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-native-fiusa': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-barrinha-deposito': { image: '/assets/balbo-barrinha-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-santa-ernestina': { image: '/assets/balbo-santa-ernestina-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-torre-sertaozinho': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-barueri-gupe': { image: '/assets/balbo-guarulhos-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-cantagalo': { image: '/assets/balbo-fiusa-illustrative.png', label: 'Imagem ilustrativa' },
  'balbo-torre-altinopolis': { image: '/assets/balbo-torre-sertaozinho-illustrative.png', label: 'Imagem ilustrativa' }
};

export function UnidadeDetailPage() {
  const { id } = useParams();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/unidades/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setUnit(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-12 text-center text-sm text-micro-muted">Carregando unidade...</div>;
  if (!unit) return <div className="p-12 text-center text-sm text-red-500">Unidade não encontrada.</div>;

  const unitMedia = id ? UNIT_IMAGES[id] : null;

  return (
    <div className="space-y-6">
      <Link to={`/clientes/${unit.clientId}`} className="inline-flex items-center text-xs font-bold text-micro-cyan hover:underline">
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para {unit.clientName}
      </Link>

      {/* Top Banner da Unidade */}
      <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs uppercase font-bold text-micro-cyan tracking-wider">{unit.clientName}</span>
              {unit.clientIsVip && <img src={vipBadge} alt="VIP" className="h-5 w-auto" />}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-micro-navy dark:text-white mt-1">{unit.name}</h1>
            <div className="flex flex-wrap items-center text-xs text-micro-muted mt-2 gap-4">
              <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-micro-orange" /> {unit.address || `${unit.city}/${unit.state}`}</span>
              <span>Identificação Intra: <strong>{unit.intraCode || '—'}</strong></span>
              {unit.sankhyaCode && <span>Cód. Sankhya: <strong>{unit.sankhyaCode}</strong></span>}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
              unit.isActive ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' : 'bg-gray-100 text-gray-500'
            }`}>
              {unit.isActive ? 'Operacional / Monitorada' : 'Desativada'}
            </span>
          </div>
        </div>
      </div>

      {/* Lâmina Fotográfica / Imagem Oficial da Unidade */}
      {unitMedia && (
        <div className="bg-white dark:bg-micro-navy rounded-2xl overflow-hidden border border-micro-line dark:border-white/10 shadow-sm">
          <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900">
            <img
              src={unitMedia.image}
              alt={unit.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6">
              <div className="flex items-center justify-between w-full text-white">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-micro-cyan" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow">
                    {unitMedia.label}
                  </span>
                </div>
                <div className="text-xs text-white/80 hidden sm:block">
                  {unit.city} — {unit.state}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal CCO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 e 2: Telecom e Circuitos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Circuitos */}
          <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-micro-cyan" />
                <h2 className="text-lg font-bold text-micro-navy dark:text-white">Circuitos de Telecom & LPs</h2>
              </div>
              <span className="text-xs font-bold text-micro-muted">{unit.circuits?.length || 0} links cadastrados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-micro-line dark:border-white/10 text-micro-muted uppercase">
                    <th className="py-2.5">Operadora</th>
                    <th>Tecnologia</th>
                    <th>Velocidade</th>
                    <th>Identificador / LP</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-micro-line/50 dark:divide-white/5">
                  {unit.circuits?.map((c: any) => (
                    <tr key={c.id} className="hover:bg-micro-bg/50 dark:hover:bg-white/5">
                      <td className="py-3 font-bold text-micro-navy dark:text-white">{c.operator}</td>
                      <td>{c.technology || '—'}</td>
                      <td>{c.speedMbps ? `${c.speedMbps} Mbps` : '—'}</td>
                      <td>
                        <div>{c.circuitId && <span className="font-semibold block">{c.circuitId}</span>}</div>
                        {c.lpIp && <div className="text-[11px] text-micro-muted">LP IP: {c.lpIp}</div>}
                        {c.lpVpn && <div className="text-[11px] text-micro-muted">LP VPN: {c.lpVpn}</div>}
                        {c.notes && <div className="text-[11px] text-micro-orange font-medium">{c.notes}</div>}
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.isPrimary ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white'
                        }`}>
                          {c.isPrimary ? 'Principal' : 'Contingência'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card de Dependências e Infraestrutura */}
          <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="w-5 h-5 text-micro-orange" />
              <h2 className="text-lg font-bold text-micro-navy dark:text-white">Infraestrutura & Dependências</h2>
            </div>
            <p className="text-sm text-micro-ink dark:text-white/80">
              {unit.dependencies || 'Nenhuma dependência registrada para esta unidade.'}
            </p>
          </div>
        </div>

        {/* Coluna 3: Contatos e Escalonamentos */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="w-5 h-5 text-micro-cyan" />
              <h2 className="text-lg font-bold text-micro-navy dark:text-white">Escalonamento CCO</h2>
            </div>

            <div className="space-y-3">
              {unit.contacts?.map((ct: any) => (
                <div key={ct.id} className="p-3 bg-micro-bg dark:bg-white/5 rounded-xl border border-micro-line dark:border-white/10 text-xs">
                  <div className="font-bold text-micro-navy dark:text-white">{ct.name}</div>
                  <div className="text-micro-muted">{ct.roleDescription}</div>
                  <div className="mt-2 font-mono font-bold text-micro-orange">
                    {ct.phone || ct.mobile || ct.whatsapp || 'Sem telefone'}
                  </div>
                  {ct.schedule && <div className="text-[10px] text-micro-muted mt-0.5">Turno: {ct.schedule}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
