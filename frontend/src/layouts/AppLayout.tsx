import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, CheckSquare, Users, Building, Home, ShieldCheck } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import logoNegative from '../assets/microset-logo-negative.png';
import m7Thumbs from '../assets/mascote/m7-thumbsup.png';
import m7Relaxing from '../assets/mascote/m7-relaxing.png';

export function AppLayout() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { label: 'Início / CCO', path: '/', icon: Home },
    { label: 'Clientes & Unidades', path: '/clientes', icon: Building },
    { label: 'Checklist CEM', path: '/checklist-cem', icon: CheckSquare },
    { label: 'Usuários & Acesso', path: '/usuarios', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-micro-bg text-micro-ink selection:bg-micro-cyan selection:text-white">
      {/* Topbar Institucional Microset */}
      <header className="bg-micro-navy text-white shadow-xl sticky top-0 z-50 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Marca Oficial */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 group" aria-label="Jaspion CCO — página inicial">
              <div className="w-[136px] h-14 overflow-hidden flex items-center transition-transform group-hover:scale-[1.02]">
                <img 
                  src={logoNegative}
                  alt="Microset Telecom" 
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="border-l border-white/20 pl-3.5 hidden sm:block">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] uppercase tracking-widest text-micro-cyan font-black block">Central de Comando Operacional</span>
                  <span className="bg-micro-orange text-white text-[9px] font-black px-1.5 py-0.5 rounded">V1</span>
                </div>
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  JASPION <span className="text-micro-yellow text-xs font-normal font-mono">CCO</span>
                </span>
              </div>
            </Link>

            {/* Menu Principal */}
            <nav className="hidden md:flex items-center space-x-1 pl-4">
              {navItems.map(item => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-r from-micro-blue to-micro-cyan text-white shadow-md font-bold' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-micro-cyan'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Ações Topbar & Perfil M7 */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 shadow-inner"
              title={theme === 'dark' ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-micro-yellow animate-spin-slow" /> : <Moon className="w-5 h-5 text-white/90" />}
            </button>

            {/* Mascote M7 Operador Badge */}
            <div className="flex items-center space-x-3 pl-3 border-l border-white/20 bg-white/5 py-1.5 px-3 rounded-2xl border border-white/10 shadow-sm">
              <div className="relative">
                <img 
                  src={m7Thumbs} 
                  alt="Mascote M7" 
                  className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(95,110,195,0.6)] transform hover:scale-110 transition-transform" 
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-micro-success border-2 border-micro-navy animate-pulse"></span>
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  Operador CCO <ShieldCheck className="w-3 h-3 text-micro-cyan" />
                </div>
                <div className="text-[11px] text-micro-yellow font-semibold">N1 Telecom • M7</div>
              </div>
            </div>
          </div>
        </div>

        {/* Linha Institucional Tricolor Microset */}
        <div className="microset-tricolor-line h-1" />
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Rodapé Institucional com Mascote e Slogan */}
      <footer className="bg-micro-navy text-white/70 text-xs py-8 border-t border-micro-line dark:border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <img 
              src={m7Relaxing} 
              alt="M7 Relaxando" 
              className="w-12 h-12 object-contain drop-shadow-[0_2px_6px_rgba(0,0,0,0.4)]" 
            />
            <div>
              <div className="text-sm font-bold text-white tracking-wide">
                Microset Telecomunicações — Central de Comando Operacional
              </div>
              <div className="text-xs text-micro-cyan mt-0.5">
                Soluções digitais, relacionamentos reais.
              </div>
              <div className="text-[11px] text-white/50 mt-1 font-mono">
                FOCO • AGILIDADE • QUALIDADE • EFICIÊNCIA • RESULTADOS
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 text-right">
            <div className="flex items-center space-x-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-micro-success animate-pulse"></span>
              <span className="text-micro-success font-bold text-xs">Sistema Operacional Online</span>
            </div>
            <div className="text-[11px] text-white/60">
              Porta Web: <span className="text-micro-yellow font-mono">6172</span> | API Fastify: <span className="text-micro-cyan font-mono">6171</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
