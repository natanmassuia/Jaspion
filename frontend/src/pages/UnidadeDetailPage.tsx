import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Radio, Phone, ShieldCheck, MapPin, Cpu, Camera, Clock, Building2, BookOpen, AlertCircle } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';
import m7Confident from '../assets/mascote/m7-confident.png';
import m7Lightbulb from '../assets/mascote/m7-lightbulb.png';

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

  useEffect(() => {
    apiFetch(`/api/unidades/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setUnit(d.data);
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

  const unitMedia = id ? UNIT_IMAGES[id] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link 
          to={`/clientes/${unit.clientId}`} 
          className="inline-flex items-center text-xs font-bold text-micro-cyan hover:underline bg-white dark:bg-micro-navy px-3 py-1.5 rounded-xl border border-micro-line dark:border-white/10 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar para {unit.clientName}
        </Link>
        <span className="text-[11px] font-mono text-micro-muted">ID: {unit.id}</span>
      </div>

      {/* Top Banner da Unidade com Mascote M7 Operacional */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="text-xs uppercase font-extrabold text-micro-cyan tracking-wider">{unit.clientName}</span>
            {unit.clientIsVip && <img src={vipBadge} alt="VIP" className="h-5 w-auto" />}
            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white shadow-sm">
              🌾 Carteira N1 - AGRO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-micro-navy dark:text-white mt-1">{unit.name}</h1>
          <div className="flex flex-wrap items-center text-xs text-micro-muted mt-2 gap-4">
            <span className="flex items-center font-medium">
              <MapPin className="w-3.5 h-3.5 mr-1 text-micro-orange" /> {unit.address || `${unit.city}/${unit.state}`}
            </span>
            <span>Identificação Intra: <strong className="text-micro-navy dark:text-white">{unit.intraCode || '—'}</strong></span>
            {unit.sankhyaCode && <span>Cód. Sankhya: <strong className="text-micro-navy dark:text-white">{unit.sankhyaCode}</strong></span>}
          </div>
        </div>

        {/* Mascote M7 Operador Badge */}
        <div className="flex items-center space-x-3 bg-micro-bg dark:bg-white/5 p-3 rounded-2xl border border-micro-line dark:border-white/10 shrink-0">
          <img 
            src={m7Confident} 
            alt="M7 Operacional" 
            className="w-16 h-16 object-contain drop-shadow-md transform hover:scale-105 transition-transform" 
          />
          <div className="text-left pr-2">
            <div className="text-xs font-bold text-micro-navy dark:text-white">Plantão N1</div>
            <div className="text-[11px] text-micro-muted">M7 CCO Telecom</div>
            <div className="text-[10px] text-micro-success font-bold mt-0.5">● Monitoramento Ativo</div>
          </div>
        </div>
      </div>

      {/* Lâmina Fotográfica / Imagem Oficial da Unidade */}
      {unitMedia && (
        <div className="bg-white dark:bg-micro-navy rounded-3xl overflow-hidden border border-micro-line dark:border-white/10 shadow-lg">
          <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-900">
            <img
              src={unitMedia.image}
              alt={unit.name}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex items-end p-6">
              <div className="flex items-center justify-between w-full text-white">
                <div className="flex items-center space-x-2">
                  <Camera className="w-4 h-4 text-micro-cyan" />
                  <span className="text-xs sm:text-sm font-semibold tracking-wide drop-shadow">
                    {unitMedia.label}
                  </span>
                </div>
                <div className="text-xs text-white/80 hidden sm:block font-mono">
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
          <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-micro-cyan" />
                <h2 className="text-lg font-bold text-micro-navy dark:text-white">Circuitos de Telecom & LPs</h2>
              </div>
              <span className="text-xs font-bold text-micro-muted bg-micro-bg dark:bg-white/10 px-2.5 py-1 rounded-lg">
                {unit.circuits?.length || 0} links cadastrados
              </span>
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
                    <tr key={c.id} className="hover:bg-micro-bg/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-micro-navy dark:text-white">{c.operator}</td>
                      <td>{c.technology || '—'}</td>
                      <td className="font-semibold text-micro-cyan">{c.speedMbps ? `${c.speedMbps} Mbps` : '—'}</td>
                      <td>
                        <div>{c.circuitId && <span className="font-semibold block text-micro-navy dark:text-white">{c.circuitId}</span>}</div>
                        {c.lpIp && <div className="text-[11px] text-micro-muted">LP IP: {c.lpIp}</div>}
                        {c.lpVpn && <div className="text-[11px] text-micro-muted">LP VPN: {c.lpVpn}</div>}
                        {c.notes && <div className="text-[11px] text-micro-orange font-medium mt-0.5">{c.notes}</div>}
                      </td>
                      <td>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
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

          {/* Procedimento Operacional Padrão da Unidade */}
          {unit.procedures && (
            <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 border border-micro-line dark:border-white/10 shadow-sm space-y-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-micro-cyan" />
                <h2 className="text-lg font-bold text-micro-navy dark:text-white">Procedimento Operacional N1</h2>
              </div>
              <div className="space-y-3">
                {Array.isArray(unit.procedures) ? (
                  unit.procedures.map((p: any) => (
                    <div key={p.id || p.content} className="bg-micro-bg dark:bg-white/5 p-4 rounded-2xl border border-micro-line dark:border-white/10 text-xs text-micro-ink dark:text-white/90 leading-relaxed font-sans whitespace-pre-line">
                      {p.content}
                    </div>
                  ))
                ) : (
                  <div className="bg-micro-bg dark:bg-white/5 p-4 rounded-2xl border border-micro-line dark:border-white/10 text-xs text-micro-ink dark:text-white/90 leading-relaxed font-sans whitespace-pre-line">
                    {String(unit.procedures)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card de Dependências e Infraestrutura */}
          <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Cpu className="w-5 h-5 text-micro-orange" />
              <h2 className="text-lg font-bold text-micro-navy dark:text-white">Infraestrutura & Dependências</h2>
            </div>
            <p className="text-xs text-micro-ink dark:text-white/80 leading-relaxed bg-micro-bg dark:bg-white/5 p-4 rounded-2xl border border-micro-line dark:border-white/10">
              {unit.dependencies ? String(unit.dependencies) : 'Nenhuma dependência crítica adicional registrada para esta unidade.'}
            </p>
          </div>
        </div>

        {/* Coluna 3: Contatos, Escalonamento & M7 Dica */}
        <div className="space-y-6">
          {/* Card de Contatos */}
          <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <Phone className="w-5 h-5 text-micro-cyan" />
              <h2 className="text-lg font-bold text-micro-navy dark:text-white">Escalonamento CCO</h2>
            </div>

            <div className="space-y-3">
              {unit.contacts?.map((ct: any) => (
                <div key={ct.id} className="p-3.5 bg-micro-bg dark:bg-white/5 rounded-2xl border border-micro-line dark:border-white/10 text-xs">
                  <div className="font-bold text-micro-navy dark:text-white">{ct.name}</div>
                  <div className="text-micro-muted text-[11px]">{ct.roleDescription}</div>
                  <div className="mt-2 font-mono font-bold text-micro-orange text-sm">
                    {ct.phone || ct.mobile || ct.whatsapp || 'Sem telefone'}
                  </div>
                  {ct.schedule && <div className="text-[10px] text-micro-muted mt-1">Turno: {ct.schedule}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Dica Operacional com M7 Ideia */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-white/5 dark:to-white/10 rounded-3xl p-5 border border-micro-cyan/20 shadow-sm">
            <div className="flex items-start space-x-3">
              <img src={m7Lightbulb} alt="Dica M7" className="w-12 h-12 object-contain shrink-0" />
              <div>
                <div className="text-xs font-bold text-micro-navy dark:text-white">Dica Operacional M7</div>
                <p className="text-[11px] text-micro-muted mt-1 leading-relaxed">
                  Em caso de falha no circuito principal, verifique a ativação automática do enlace de contingência antes de acionar a operadora externa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
