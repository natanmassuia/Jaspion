import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { ClientesListPage } from '../pages/ClientesListPage';
import { ClienteDetailPage } from '../pages/ClienteDetailPage';
import { UnidadeDetailPage } from '../pages/UnidadeDetailPage';
import { ChecklistCemPage } from '../pages/ChecklistCemPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="clientes" element={<ClientesListPage />} />
          <Route path="clientes/:id" element={<ClienteDetailPage />} />
          <Route path="unidades/:id" element={<UnidadeDetailPage />} />
          <Route path="checklist-cem" element={<ChecklistCemPage />} />
          <Route path="usuarios" element={<div className="p-8 text-center bg-white rounded-xl shadow-sm border border-micro-line font-bold">Módulo de Usuários e Permissões (ADMIN)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
