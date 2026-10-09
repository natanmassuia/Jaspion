import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, XCircle, AlertTriangle, MinusCircle, Send, History } from 'lucide-react';
import { calculateCemScore } from '@jaspion/shared';

export function ChecklistCemPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ticketProtocol, setTicketProtocol] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [viewTab, setViewTab] = useState<'formulario' | 'historico'>('formulario');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch('/api/checklist-cem/blocks')
      .then(r => r.json())
      .then(d => {
        if (d.success) setBlocks(d.data);
      });

    apiFetch('/api/checklist-cem/evaluations')
      .then(r => r.json())
      .then(d => {
        if (d.success) setEvaluations(d.data);
      });
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const currentBlock = blocks[activeBlockIndex];
  const allAnswerList = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
  const scoreStats = calculateCemScore(allAnswerList);

  const handleSubmit = async () => {
    if (!ticketProtocol.trim()) {
      alert('Por favor, informe o número do chamado/ticket.');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch('/api/checklist-cem/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketProtocol,
          evaluationDate: new Date().toISOString().slice(0, 10),
          shift: 'Comercial',
          notes: 'Avaliação realizada no Jaspion V1',
          answers: allAnswerList
        })
      });
      
      const data = await res.json();
      if (data.success) {
        alert(`Checklist salvo com sucesso! Pontuação final: ${data.data.score}%`);
        // Recarregar histórico
        apiFetch('/api/checklist-cem/evaluations')
          .then(r => r.json())
          .then(d => { if (d.success) setEvaluations(d.data); });
        setViewTab('historico');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-micro-navy dark:text-white">
            Checklist de Qualidade CEM v2.2.1
          </h1>
          <p className="text-sm text-micro-muted mt-1">
            Auditoria e conformidade operacional de chamados por lâminas setoriais.
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setViewTab('formulario')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              viewTab === 'formulario' ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy' : 'bg-white dark:bg-white/10 text-micro-muted'
            }`}
          >
            Avaliação em Lâminas
          </button>
          <button
            onClick={() => setViewTab('historico')}
            className={`px-4 py-2 rounded-lg text-xs font-bold ${
              viewTab === 'historico' ? 'bg-micro-navy text-white dark:bg-white dark:text-micro-navy' : 'bg-white dark:bg-white/10 text-micro-muted'
            }`}
          >
            Histórico ({evaluations.length})
          </button>
        </div>
      </div>

      {viewTab === 'formulario' ? (
        <div className="space-y-6">
          {/* Card de Pontuação Dinâmica */}
          <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 w-full">
              <label className="text-xs font-bold text-micro-muted uppercase block mb-1">
                Número do Chamado / Protocolo (Znuny / Sankhya):
              </label>
              <input
                type="text"
                value={ticketProtocol}
                onChange={e => setTicketProtocol(e.target.value)}
                placeholder="Ex: 883088241"
                className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-micro-navy dark:text-white outline-none"
              />
            </div>

            <div className="flex items-center space-x-6 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{scoreStats.good}</div>
                <div className="text-[10px] text-micro-muted uppercase">Conformes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{scoreStats.bad}</div>
                <div className="text-[10px] text-micro-muted uppercase">Não Conf.</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-500">{scoreStats.fourth}</div>
                <div className="text-[10px] text-micro-muted uppercase">Parciais</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-400">{scoreStats.na}</div>
                <div className="text-[10px] text-micro-muted uppercase">N/A</div>
              </div>
              <div className="border-l border-micro-line dark:border-white/10 pl-6">
                <div className="text-3xl font-extrabold text-micro-cyan">{scoreStats.score}%</div>
                <div className="text-[10px] font-bold text-micro-muted uppercase">Conformidade</div>
              </div>
            </div>
          </div>

          {/* Navegador de Lâminas (7 Blocos) */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {blocks.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActiveBlockIndex(i)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeBlockIndex === i
                    ? 'bg-micro-cyan text-white shadow-md'
                    : 'bg-white dark:bg-micro-navy text-micro-muted border border-micro-line dark:border-white/10'
                }`}
              >
                Lâmina {i + 1}: {b.name} ({b.questions?.length})
              </button>
            ))}
          </div>

          {/* Perguntas da Lâmina Atual */}
          {currentBlock && (
            <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm space-y-6">
              <div className="border-b border-micro-line dark:border-white/10 pb-4">
                <h2 className="text-lg font-bold text-micro-navy dark:text-white">
                  {currentBlock.name}
                </h2>
                <p className="text-xs text-micro-muted">{currentBlock.questions?.length} questões nesta lâmina</p>
              </div>

              <div className="space-y-4">
                {currentBlock.questions?.map((q: any, qi: number) => {
                  const sel = answers[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-xl bg-micro-bg dark:bg-white/5 border border-micro-line/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="text-xs font-medium text-micro-navy dark:text-white">
                        <span className="font-bold text-micro-cyan mr-2">Q{qi + 1}.</span>
                        {q.text}
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'conforme')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            sel === 'conforme' ? 'bg-green-600 text-white' : 'bg-white dark:bg-white/10 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          Conforme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'nao-conforme')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            sel === 'nao-conforme' ? 'bg-red-600 text-white' : 'bg-white dark:bg-white/10 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          Não Conf.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'parcialmente-conforme')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            sel === 'parcialmente-conforme' ? 'bg-yellow-500 text-white' : 'bg-white dark:bg-white/10 text-yellow-700 hover:bg-yellow-50'
                          }`}
                        >
                          Parcial
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'na')}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            sel === 'na' ? 'bg-gray-500 text-white' : 'bg-white dark:bg-white/10 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botão Finalizar */}
              <div className="pt-6 border-t border-micro-line dark:border-white/10 flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-micro-orange hover:bg-micro-orange/90 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{saving ? 'Gravando Avaliação...' : 'Gravar Avaliação CEM'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Histórico de Avaliações */
        <div className="bg-white dark:bg-micro-navy rounded-2xl p-6 border border-micro-line dark:border-white/10 shadow-sm">
          <h2 className="text-lg font-bold text-micro-navy dark:text-white mb-4">Avaliações Históricas Salvas</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-micro-line dark:border-white/10 text-micro-muted uppercase">
                  <th className="py-2.5">Chamado</th>
                  <th>Data</th>
                  <th>Analista</th>
                  <th>Conformidade</th>
                  <th>C / NC / P / NA</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-micro-line/50 dark:divide-white/5">
                {evaluations.map(ev => (
                  <tr key={ev.id} className="hover:bg-micro-bg/50 dark:hover:bg-white/5">
                    <td className="py-3 font-bold text-micro-navy dark:text-white">{ev.ticketProtocol}</td>
                    <td>{ev.evaluationDate}</td>
                    <td>{ev.evaluatorName}</td>
                    <td>
                      <span className="font-extrabold text-micro-cyan">{ev.scorePercentage}%</span>
                    </td>
                    <td>{ev.goodCount} / {ev.badCount} / {ev.fourthCount} / {ev.naCount}</td>
                    <td className="text-micro-muted">{ev.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
