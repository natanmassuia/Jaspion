import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building, Shield, ChevronRight, Search, MapPin, Layers } from 'lucide-react';
import vipBadge from '../assets/vip-badge.png';

export function ClientesListPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/clientes')
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
      {/* Header da Tela */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-micro-navy dark:text-white">
            Clientes Operacionais
          </h1>
          <p className="text-sm text-micro-muted mt-1">
            Gestão e consulta de clientes corporativos, grupos econômicos e unidades monitoradas pelo CCO.
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="flex items-center bg-white dark:bg-micro-navy rounded-xl border border-micro-line dark:border-white/10 px-4 py-2.5 shadow-sm">
        <Search className="w-5 h-5 text-micro-muted mr-3" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por cliente, GN ou código Sankhya..."
          className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-micro-muted/60 text-micro-ink"
        />
      </div>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="p-12 text-center text-sm text-micro-muted">Carregando clientes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => (
            <Link
              key={c.id}
              to={`/clientes/${c.id}`}
              className="bg-white dark:bg-micro-navy rounded-2xl border border-micro-line dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-micro-blue/10 flex items-center justify-center text-micro-cyan">
                      <Building className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                        {c.name}
                      </h2>
                      <div className="text-xs text-micro-muted">{c.economicGroup || 'Sem grupo'}</div>
                    </div>
                  </div>
                  {c.isVip && (
                    <img src={vipBadge} alt="VIP" className="h-6 w-auto" title="Cliente VIP" />
                  )}
                </div>

                <p className="text-xs text-micro-muted line-clamp-2 mt-2">
                  {c.description || 'Nenhuma descrição informada.'}
                </p>

                <div className="mt-4 pt-4 border-t border-micro-line/60 dark:border-white/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-micro-muted block">Gerente (GN):</span>
                    <span className="font-semibold text-micro-navy dark:text-white">{c.gnName || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="text-micro-muted block">Cód. Sankhya:</span>
                    <span className="font-semibold text-micro-navy dark:text-white">{c.sankhyaCode || '—'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-micro-line/40 dark:border-white/5 flex items-center justify-between text-xs text-micro-cyan font-bold">
                <span className="flex items-center">
                  <Layers className="w-4 h-4 mr-1.5" />
                  {c.unitsCount} unidades ativas
                </span>
                <span className="flex items-center group-hover:translate-x-1 transition-transform">
                  Ver Unidades <ChevronRight className="w-4 h-4 ml-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
