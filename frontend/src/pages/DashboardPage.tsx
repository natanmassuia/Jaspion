import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { Search, Radio } from 'lucide-react';

export function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  useEffect(() => {
    apiFetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoadingHealth(false);
      })
      .catch(err => {
        console.error('Falha ao conectar na API:', err);
        setLoadingHealth(false);
      });
  }, []);

  return (
    <div className="space-y-8">
      {/* Faixa Hero de Busca Rápida CCO */}
      <div className="bg-gradient-to-r from-micro-navy to-micro-blue rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 bg-micro-cyan/25 px-3 py-1 rounded-full text-xs font-bold text-micro-yellow mb-3">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>CENTRAL DE COMANDO OPERACIONAL — CCO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Consulta Unificada e Acesso Rápido
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80">
            Pesquise por cliente, unidade, circuito, LP, código Sankhya ou protocolo Znuny em tempo real.
          </p>

          <div className="mt-6 flex items-center bg-white rounded-xl shadow-lg p-2 text-micro-ink">
            <Search className="w-5 h-5 text-micro-muted ml-2 mr-3" />
            <input
              type="text"
              placeholder="Digite o nome do cliente, unidade (ex: Balbo), circuito ou protocolo..."
              className="w-full bg-transparent border-0 outline-none text-sm placeholder:text-micro-muted/60"
            />
            <button className="bg-micro-orange hover:bg-micro-orange/90 text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-micro-navy rounded-xl p-5 border border-micro-line dark:border-white/10 shadow-sm">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Status da API Fastify</div>
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-micro-navy dark:text-white">
              {loadingHealth ? 'Verificando...' : health?.status === 'UP' ? 'Conectado' : 'Offline'}
            </div>
            <div className={`w-3 h-3 rounded-full ${health?.status === 'UP' ? 'bg-micro-success animate-pulse' : 'bg-red-500'}`} />
          </div>
          <div className="text-xs text-micro-muted mt-2">Porta 6171 • SQLite 3 Local</div>
        </div>

        <div className="bg-white dark:bg-micro-navy rounded-xl p-5 border border-micro-line dark:border-white/10 shadow-sm">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Clientes Cadastrados</div>
          <div className="text-xl font-bold text-micro-navy dark:text-white">Grupo Balbo (VIP)</div>
          <div className="text-xs text-micro-muted mt-2">11 Unidades • GN Luis Henrique</div>
        </div>

        <div className="bg-white dark:bg-micro-navy rounded-xl p-5 border border-micro-line dark:border-white/10 shadow-sm">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Checklist CEM</div>
          <div className="text-xl font-bold text-micro-navy dark:text-white">7 Setores • 90 Itens</div>
          <div className="text-xs text-micro-muted mt-2">Versão 2.2.1 • QA CCO</div>
        </div>

        <div className="bg-white dark:bg-micro-navy rounded-xl p-5 border border-micro-line dark:border-white/10 shadow-sm">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Sincronização Znuny</div>
          <div className="text-xl font-bold text-micro-navy dark:text-white">Periódica (5m)</div>
          <div className="text-xs text-micro-muted mt-2">Modo Read-Only Resiliente</div>
        </div>
      </div>
    </div>
  );
}
