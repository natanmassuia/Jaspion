import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Shield, ChevronRight, Search, MapPin, Layers, Sparkles } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';
import m7Presenting from '../assets/mascote/m7-presenting.png';
import m7Thinking from '../assets/mascote/m7-thinking.png';

export function ClientesListPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/clientes')
      .then(r => r.json())
      .then(d => {
        if (d.success) setClients(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.gnName && c.gnName.toLowerCase().includes(search.toLowerCase())) ||
    (c.sankhyaCode && c.sankhyaCode.includes(search))
  );

  return (
    <div className="space-y-6">
      {/* Header da Tela com M7 Apresentando */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold text-micro-cyan tracking-wider">
              Central de Comando Operacional
            </span>
            <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Carteiras CCO Ativas
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-micro-navy dark:text-white">
            Clientes & Contas Especiais
          </h1>
          <p className="text-xs sm:text-sm text-micro-muted mt-1 max-w-xl">
            Gestão e consulta de clientes corporativos, grupos econômicos e unidades monitoradas pelo N1/CCO.
          </p>
        </div>

        {/* Mascote M7 Apresentando */}
        <div className="flex items-center space-x-3 bg-micro-bg dark:bg-white/5 p-3 rounded-2xl border border-micro-line dark:border-white/10 shrink-0">
          <img 
            src={m7Presenting} 
            alt="M7 Apresentando" 
            className="w-16 h-16 object-contain drop-shadow-md transform hover:scale-105 transition-transform" 
          />
          <div className="text-left pr-2">
            <div className="text-xs font-bold text-micro-navy dark:text-white">Catálogo CCO</div>
            <div className="text-[11px] text-micro-muted">M7 Gestão de Unidades</div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Triagem Prioritária</div>
          </div>
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10 px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-micro-cyan">
        <Search className="w-5 h-5 text-micro-muted mr-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente (ex: Balbo), gerente GN ou código Sankhya..."
          className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-micro-muted/60 text-micro-ink dark:text-white"
        />
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="p-12 text-center text-sm text-micro-muted flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-micro-cyan border-t-transparent rounded-full animate-spin"></div>
          <span>Carregando clientes operacionais...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-micro-navy rounded-3xl p-12 text-center border border-micro-line dark:border-white/10 shadow-sm flex flex-col items-center justify-center space-y-4">
          <img src={m7Thinking} alt="M7 Pensativo" className="w-24 h-24 object-contain" />
          <div>
            <h3 className="text-base font-bold text-micro-navy dark:text-white">Nenhum cliente encontrado</h3>
            <p className="text-xs text-micro-muted mt-1">Verifique o termo de busca digitado ou limpe o filtro.</p>
          </div>
          <button 
            onClick={() => setSearch('')}
            className="text-xs font-bold text-micro-cyan bg-micro-cyan/10 hover:bg-micro-cyan/20 px-4 py-2 rounded-xl transition-colors"
          >
            Limpar Busca
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => {
            const isBalbo = c.id === 'balbo' || c.name.toLowerCase().includes('balbo');
            return (
              <Link
                key={c.id}
                to={`/clientes/${c.id}`}
                className="bg-white dark:bg-micro-navy rounded-3xl border border-micro-line dark:border-white/10 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-micro-blue/10 dark:bg-white/10 flex items-center justify-center text-micro-cyan group-hover:scale-110 transition-transform">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                          {c.name}
                        </h2>
                        <div className="text-xs text-micro-muted font-medium">{c.economicGroup || 'Sem grupo'}</div>
                      </div>
                    </div>
                    {c.isVip && (
                      <img src={vipBadge} alt="VIP" className="h-6 w-auto" title="Cliente VIP" />
                    )}
                  </div>

                  {/* Badge da Carteira CCO Oficial */}
                  <div className="my-3 flex items-center gap-2">
                    {isBalbo && (
                      <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                        🌾 Carteira N1 - AGRO
                      </span>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-micro-bg dark:bg-white/10 text-micro-muted">
                      Sankhya: {c.sankhyaCode || '—'}
                    </span>
                  </div>

                  <p className="text-xs text-micro-muted line-clamp-2 mt-2 leading-relaxed">
                    {c.description || 'Nenhuma descrição informada.'}
                  </p>

                  <div className="mt-4 pt-4 border-t border-micro-line/60 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-micro-muted block text-[11px]">Gerente de Negócios:</span>
                      <span className="font-semibold text-micro-navy dark:text-white">{c.gnName || 'Não informado'}</span>
                    </div>
                    <div>
                      <span className="text-micro-muted block text-[11px]">Unidades Ativas:</span>
                      <span className="font-bold text-micro-cyan">11 Unidades (8 Operacionais)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-micro-line/40 dark:border-white/5 flex items-center justify-between text-xs text-micro-cyan font-bold">
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Acessar perfil operacional</span>
                    <ChevronRight className="w-4 h-4" />
                  </span>
                  <span className="text-[11px] text-micro-muted font-normal">CCO Monitor</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
