import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { Search, Radio, Shield, Clock, ExternalLink, ArrowRight, Zap, CheckCircle2, FileText, ChevronRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import m7Analytics from '../assets/mascote/m7-analytics.png';
import m7Pointing from '../assets/mascote/m7-pointing.png';
import m7Coding from '../assets/mascote/m7-typing.png';
import comunicadoFilas from '../assets/brand/comunicado-padronizacao-filas.jpg';
import comunicadoTriagem from '../assets/brand/comunicado-triagem-automatica.jpg';

export function DashboardPage() {
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [selectedComunicado, setSelectedComunicado] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const carteiras = [
    {
      id: 'agro',
      sigla: 'N1 - AGRO',
      nome: 'Carteira Agroindustrial',
      clientes: 'Grupo Balbo (VIP), LDC, COMIGO, CMAA',
      cor: 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400',
      badgeCor: 'bg-emerald-600 text-white',
      link: '/clientes/balbo',
      destaque: '8 Unidades Operacionais Ativas',
      icon: '🌾'
    },
    {
      id: 'ccs',
      sigla: 'N1 - CCS',
      nome: 'Cooperativas Financeiras',
      clientes: 'Todas e quaisquer cooperativas SICOOB',
      cor: 'border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400',
      badgeCor: 'bg-cyan-600 text-white',
      link: '/clientes',
      destaque: 'Fila Dedicada SICOOB',
      icon: '🏦'
    },
    {
      id: 'zema',
      sigla: 'N1 - ZEMA',
      nome: 'Varejo e Logística',
      clientes: 'Lojas e Centros de Distribuição Eletrozema',
      cor: 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400',
      badgeCor: 'bg-blue-600 text-white',
      link: '/clientes',
      destaque: 'Fila Especial Eletrozema',
      icon: '⚡'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Faixa Hero com Mascote M7 Holográfico */}
      <div className="bg-gradient-to-r from-micro-navy via-micro-blue to-[#2E2D4D] rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-white/10">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-micro-cyan/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 -top-10 w-72 h-72 bg-micro-orange/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl flex-1">
            <div className="inline-flex items-center space-x-2 bg-micro-cyan/20 border border-micro-cyan/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-micro-yellow mb-4 shadow-sm backdrop-blur-sm">
              <Radio className="w-3.5 h-3.5 animate-pulse text-micro-orange" />
              <span>CENTRAL DE COMANDO OPERACIONAL — CCO</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Olá, Operador CCO!
            </h1>
            <p className="mt-2 text-base text-white/80 font-normal leading-relaxed">
              Consulte circuitos, contatos de emergência, procedimentos e lâminas do Checklist CEM em tempo real.
            </p>

            {/* Barra de Busca Global */}
            <div className="mt-6 flex items-center bg-white dark:bg-micro-navy/90 rounded-2xl shadow-xl p-2 text-micro-ink border border-micro-line dark:border-white/20 transition-all focus-within:ring-2 focus-within:ring-micro-cyan">
              <Search className="w-5 h-5 text-micro-muted ml-3 mr-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Busca rápida: cliente, unidade (ex: Balbo, USA), circuito ou chamado..."
                className="w-full bg-transparent border-0 outline-none text-sm font-medium placeholder:text-micro-muted/60 dark:text-white"
              />
              <Link 
                to={searchQuery.toLowerCase().includes('balbo') || searchQuery.toLowerCase().includes('usa') ? '/clientes/balbo' : '/clientes'}
                className="bg-micro-orange hover:bg-micro-orange/90 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5"
              >
                Buscar
              </Link>
            </div>

            {/* Micro Tags de Acesso Rápido */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/70">
              <span className="font-semibold text-white/90">Acesso frequente:</span>
              <Link to="/unidades/balbo-usa-concentrador" className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors text-white">
                🏭 USA Concentrador
              </Link>
              <Link to="/unidades/balbo-native-guarulhos" className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors text-white">
                📦 Native Guarulhos
              </Link>
              <Link to="/checklist-cem" className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-colors text-micro-yellow font-semibold">
                📋 Checklist CEM
              </Link>
            </div>
          </div>

          {/* Mascote M7 3D com Telas Holográficas */}
          <div className="relative flex-shrink-0 flex items-center justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-micro-cyan/30 to-micro-orange/20 rounded-full blur-2xl transform group-hover:scale-110 transition-transform duration-500"></div>
              <img 
                src={m7Analytics} 
                alt="Mascote M7 com Hologramas Operacionais" 
                className="w-64 sm:w-72 h-auto object-contain relative z-10 drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] transform hover:-translate-y-1 transition-all duration-300"
              />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-micro-navy/90 border border-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-lg backdrop-blur-md z-20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-micro-cyan animate-pulse"></span>
                M7 • Assistente CCO
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção das Carteiras Operacionais Oficiais */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-micro-navy dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-micro-orange" />
              Carteiras de Contas Especiais (Triagem CCO)
            </h2>
            <p className="text-xs text-micro-muted mt-0.5">
              Roteamento automático de chamados durante horário comercial (08:30 às 17:00 em até 1 minuto).
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-micro-muted bg-white dark:bg-micro-navy px-3 py-1.5 rounded-xl border border-micro-line dark:border-white/10 shadow-sm">
            <Clock className="w-4 h-4 text-micro-cyan" />
            <span>Fora de Horário: <strong className="text-micro-navy dark:text-white">N1 - HelpDesk</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {carteiras.map(c => (
            <Link
              key={c.id}
              to={c.link}
              className={`rounded-2xl p-5 border-2 ${c.cor} shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-lg ${c.badgeCor} shadow-sm flex items-center gap-1.5`}>
                    <span>{c.icon}</span>
                    <span>{c.sigla}</span>
                  </span>
                  <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="text-sm font-bold text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                  {c.nome}
                </div>
                <p className="text-xs text-micro-ink/80 dark:text-white/70 mt-1 font-medium">
                  {c.clientes}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between text-xs font-semibold">
                <span>{c.destaque}</span>
                <span className="text-[11px] underline">Abrir carteira</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Cards de Métricas Operacionais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-micro-navy rounded-2xl p-5 border border-micro-line dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1 flex items-center justify-between">
            <span>Status da API Fastify</span>
            <div className={`w-2.5 h-2.5 rounded-full ${health?.status === 'UP' ? 'bg-micro-success animate-pulse' : 'bg-red-500'}`} />
          </div>
          <div className="text-xl font-extrabold text-micro-navy dark:text-white mt-1">
            {loadingHealth ? 'Verificando...' : health?.status === 'UP' ? 'Conectado' : 'Offline'}
          </div>
          <div className="text-xs text-micro-muted mt-2 font-mono">Porta 6171 • SQLite 3 Local</div>
        </div>

        <div className="bg-white dark:bg-micro-navy rounded-2xl p-5 border border-micro-line dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Clientes Cadastrados</div>
          <div className="text-xl font-extrabold text-micro-navy dark:text-white mt-1">Grupo Balbo (VIP)</div>
          <div className="text-xs text-micro-muted mt-2">11 Unidades • GN Luis Henrique</div>
        </div>

        <div className="bg-white dark:bg-micro-navy rounded-2xl p-5 border border-micro-line dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Checklist Qualidade CEM</div>
          <div className="text-xl font-extrabold text-micro-navy dark:text-white mt-1">7 Lâminas • 90 Itens</div>
          <div className="text-xs text-micro-muted mt-2">Versão 2.2.1 • Auditoria CCO</div>
        </div>

        <div className="bg-white dark:bg-micro-navy rounded-2xl p-5 border border-micro-line dark:border-white/10 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold uppercase text-micro-muted mb-1">Sincronização Znuny</div>
          <div className="text-xl font-extrabold text-micro-navy dark:text-white mt-1">Periódica (5m)</div>
          <div className="text-xs text-micro-muted mt-2">Modo Read-Only Seguro</div>
        </div>
      </div>

      {/* Mural de Comunicados CCO & Padrões Operacionais */}
      <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <img src={m7Pointing} alt="M7 Comunicados" className="w-12 h-12 object-contain" />
            <div>
              <h2 className="text-xl font-bold text-micro-navy dark:text-white">
                Comunicados Internos & Padrões Operacionais
              </h2>
              <p className="text-xs text-micro-muted mt-0.5">
                Diretrizes de triagem, filas no Znuny e procedimentos normatizados para o N1/CCO.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-micro-cyan uppercase tracking-wider bg-micro-cyan/10 px-3 py-1 rounded-full w-fit">
            Atualizado 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Comunicado 1: Triagem Automática */}
          <div 
            onClick={() => setSelectedComunicado(comunicadoTriagem)}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-micro-line dark:border-white/10 bg-micro-bg dark:bg-white/5 hover:shadow-lg transition-all hover:scale-[1.01]"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-black/10">
              <img 
                src={comunicadoTriagem} 
                alt="Aviso Nova Triagem Automática" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-micro-navy/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-white bg-micro-orange px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> Clique para ampliar infográfico
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                Aviso — Nova Triagem Automática de Chamados (Contas Especiais)
              </h3>
              <p className="text-xs text-micro-muted mt-1">
                Roteamento por carteiras N1 - CCS, N1 - ZEMA e N1 - AGRO e varredura de chamados (WS Alerta, Incidente).
              </p>
            </div>
          </div>

          {/* Card Comunicado 2: Padronização das Filas */}
          <div 
            onClick={() => setSelectedComunicado(comunicadoFilas)}
            className="group cursor-pointer rounded-2xl overflow-hidden border border-micro-line dark:border-white/10 bg-micro-bg dark:bg-white/5 hover:shadow-lg transition-all hover:scale-[1.01]"
          >
            <div className="relative aspect-[16/9] overflow-hidden bg-black/10">
              <img 
                src={comunicadoFilas} 
                alt="Padronização de Nomenclaturas de Filas" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-micro-navy/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-white bg-micro-cyan px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> Clique para ampliar infográfico
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-sm text-micro-navy dark:text-white group-hover:text-micro-cyan transition-colors">
                Padronização das Nomenclaturas de Filas no ZNUNY
              </h3>
              <p className="text-xs text-micro-muted mt-1">
                Padrão único de organização, criação da subfila Sistemas - CCO e higienização visual do ambiente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Lightbox do Comunicado Ampliado */}
      {selectedComunicado && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedComunicado(null)}
        >
          <div 
            className="relative max-w-5xl w-full bg-micro-navy rounded-2xl overflow-hidden shadow-2xl border border-white/20"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 bg-micro-navy flex items-center justify-between border-b border-white/10">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-micro-cyan" /> Visualização do Comunicado Operacional Microset
              </span>
              <button 
                onClick={() => setSelectedComunicado(null)}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 max-h-[85vh] overflow-auto flex items-center justify-center bg-black/40">
              <img 
                src={selectedComunicado} 
                alt="Comunicado em Alta Definição" 
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
