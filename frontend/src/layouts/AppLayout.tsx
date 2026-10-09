import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, CheckSquare, Users, Building, Home } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import logoNegative from '../assets/microset-logo-negative.png';
import mascotM7 from '../assets/mascote-m7.svg';

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
    <div className="min-h-screen flex flex-col bg-micro-bg text-micro-ink">
      {/* Topbar Institucional Microset */}
      <header className="bg-micro-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Marca */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3">
              <img src={logoNegative} alt="Microset Telecom" className="h-10 w-auto" />
              <div className="border-l border-white/20 pl-3">
                <span className="text-xs uppercase tracking-widest text-micro-cyan font-bold block">Intranet CCO</span>
                <span className="text-lg font-bold tracking-tight text-white">JASPION V1</span>
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active ? 'bg-white/15 text-white font-bold' : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-micro-cyan" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Ações Topbar */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-micro-yellow" /> : <Moon className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-3 pl-2 border-l border-white/15">
              <img src={mascotM7} alt="Mascote M7" className="w-9 h-9" />
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-white">Operador CCO</div>
                <div className="text-xs text-micro-cyan">N1 Telecom</div>
              </div>
            </div>
          </div>
        </div>
        {/* Linha Institucional Tricolor */}
        <div className="microset-tricolor-line" />
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-micro-navy text-white/60 text-xs py-6 border-t border-micro-line dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Microset Telecomunicações — Central de Comando Operacional</div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-micro-success"><span className="w-2 h-2 rounded-full bg-micro-success mr-1.5 animate-pulse"></span> Sistema Operacional</span>
            <span>Porta Frontend: 6172 | API: 6171</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
