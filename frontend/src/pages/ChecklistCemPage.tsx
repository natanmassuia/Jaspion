import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, XCircle, AlertTriangle, MinusCircle, Send, History, Award, AlertCircle } from 'lucide-react';
import { calculateCemScore } from '@jaspion/shared';
import cemLogoOfficial from '../assets/brand/cem-logo-official.png';
import m7Writing from '../assets/mascote/m7-writing.png';
import m7Celebrating from '../assets/mascote/m7-celebrating.png';
import m7Thinking from '../assets/mascote/m7-thinking.png';

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayValue(value);
      return;
    }

    let animationFrame = 0;
    const startedAt = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 650);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
    };

    setDisplayValue(0);
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <>{displayValue}{suffix}</>;
}

function AnimatedProgress({ percent }: { percent: number }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setWidth(percent);
      return;
    }

    setWidth(0);
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setWidth(Math.max(0, Math.min(100, percent))));
    });
    return () => cancelAnimationFrame(frame);
  }, [percent]);

  return <i style={{ width: `${width}%` }} />;
}

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
  const totalQuestions = blocks.reduce((total, block) => total + (block.questions?.length || 0), 0);
  const pendingCount = Math.max(0, totalQuestions - allAnswerList.length);
  const metricPercent = (value: number) => totalQuestions ? Math.round((value / totalQuestions) * 100) : 0;
  const hasAnswers = allAnswerList.length > 0;
  const isHighQuality = scoreStats.score >= 80;

  const handleSubmit = async () => {
    if (!ticketProtocol.trim()) {
      alert('Por favor, informe o número do chamado/ticket (ex: 883088241).');
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
        alert(`Checklist gravado com sucesso! Pontuação final: ${data.data.score}%`);
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
      {/* Top Banner Oficial CEM com Mascote Auditor M7 */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-blue-50/60 dark:from-micro-navy dark:via-micro-navy dark:to-[#222344] rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="bg-white dark:bg-white/10 p-3 rounded-2xl shadow-sm border border-micro-line dark:border-white/10 flex-shrink-0">
            <img 
              src={cemLogoOfficial} 
              alt="Central de Excelência Microset" 
              className="h-12 w-auto object-contain dark:brightness-125" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold text-micro-cyan tracking-wider">
                Auditoria de Qualidade CCO
              </span>
              <span className="bg-micro-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Versão 2.2.1
              </span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-micro-navy dark:text-white mt-1">
              Checklist de Qualidade Operacional
            </h1>
            <p className="text-xs text-micro-muted mt-1 max-w-xl">
              Avaliação sistemática de chamados por lâminas setoriais para garantia de conformidade, agilidade e padrões de excelência.
            </p>
          </div>
        </div>

        {/* M7 Auditor Badge */}
        <div className="flex items-center space-x-4 bg-white/80 dark:bg-white/5 p-3 rounded-2xl border border-micro-line dark:border-white/10 shadow-sm">
          <img 
            src={m7Writing} 
            alt="M7 Auditor" 
            className="w-16 h-16 object-contain drop-shadow-md transform hover:scale-105 transition-transform" 
          />
          <div className="text-left pr-2">
            <div className="text-xs font-bold text-micro-navy dark:text-white flex items-center gap-1">
              M7 Auditor CEM <Award className="w-3.5 h-3.5 text-micro-yellow" />
            </div>
            <div className="text-[11px] text-micro-muted mt-0.5">7 Setores • 90 Critérios</div>
            <div className="text-[10px] text-micro-cyan font-bold mt-1">Conformidade N1/N2</div>
          </div>
        </div>
      </div>

      {/* Seletor de Abas */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2 bg-micro-bg dark:bg-white/5 p-1 rounded-xl border border-micro-line dark:border-white/10">
          <button
            onClick={() => setViewTab('formulario')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'formulario' ? 'bg-micro-navy text-white shadow-md dark:bg-white dark:text-micro-navy' : 'text-micro-muted hover:text-micro-ink'
            }`}
          >
            📋 Avaliação em Lâminas
          </button>
          <button
            onClick={() => setViewTab('historico')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'historico' ? 'bg-micro-navy text-white shadow-md dark:bg-white dark:text-micro-navy' : 'text-micro-muted hover:text-micro-ink'
            }`}
          >
            🕒 Histórico Salvo ({evaluations.length})
          </button>
        </div>
      </div>

      {viewTab === 'formulario' ? (
        <div className="space-y-6">
          {/* Card de Pontuação Dinâmica com Reação do Mascote */}
          <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 border border-micro-line dark:border-white/10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="w-full lg:max-w-md">
              <label className="text-xs font-bold text-micro-muted uppercase block mb-1.5">
                Número do Chamado / Protocolo (Znuny / Sankhya):
              </label>
              <input
                type="text"
                value={ticketProtocol}
                onChange={e => setTicketProtocol(e.target.value)}
                placeholder="Ex: 883088241"
                className="w-full bg-micro-bg dark:bg-white/5 border border-micro-line dark:border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-micro-navy dark:text-white outline-none focus:ring-2 focus:ring-micro-cyan"
              />
            </div>

            {/* Reação do Mascote M7 baseado no Score */}
            <div className="flex items-center space-x-3 bg-micro-bg dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-micro-line dark:border-white/10">
              <img 
                src={!hasAnswers ? m7Writing : isHighQuality ? m7Celebrating : m7Thinking} 
                alt="Reação M7" 
                className="w-12 h-12 object-contain drop-shadow-sm" 
              />
              <div className="text-left">
                <div className="text-xs font-bold text-micro-navy dark:text-white">
                  {!hasAnswers ? 'Aguardando Avaliação' : isHighQuality ? 'Excelente Conformidade!' : 'Atenção aos Itens!'}
                </div>
                <div className="text-[10px] text-micro-muted mt-0.5">
                  {!hasAnswers 
                    ? 'Responda as questões das lâminas' 
                    : isHighQuality 
                      ? 'Processo auditado com alto rigor operacional' 
                      : 'Verifique itens não conformes ou parciais'}
                </div>
              </div>
            </div>

          </div>

          {/* Cards de resultado da POC de Qualidade */}
          <section className="cem-summary" aria-label="Resumo da avaliação">
            <article className="cem-score-card">
              <span>Conformidade</span>
              <strong><AnimatedNumber value={scoreStats.score} suffix="%" /></strong>
              <div className="cem-score-line"><AnimatedProgress percent={scoreStats.score} /></div>
            </article>
            <article className="cem-metric-card cem-metric-good">
              <span>Conformes</span>
              <strong><AnimatedNumber value={scoreStats.good} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={metricPercent(scoreStats.good)} /></div>
            </article>
            <article className="cem-metric-card cem-metric-bad">
              <span>Não conformes</span>
              <strong><AnimatedNumber value={scoreStats.bad} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={metricPercent(scoreStats.bad)} /></div>
            </article>
            <article className="cem-metric-card cem-metric-na">
              <span>Não se aplica</span>
              <strong><AnimatedNumber value={scoreStats.na} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={metricPercent(scoreStats.na)} /></div>
            </article>
            <article className="cem-metric-card cem-metric-fourth">
              <span>Parcialmente conforme</span>
              <strong><AnimatedNumber value={scoreStats.fourth} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={metricPercent(scoreStats.fourth)} /></div>
            </article>
            <article className="cem-metric-card cem-metric-pending">
              <span>Pendentes</span>
              <strong><AnimatedNumber value={pendingCount} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={metricPercent(pendingCount)} /></div>
            </article>
          </section>

          {/* Navegador de Lâminas (7 Blocos) */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {blocks.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setActiveBlockIndex(i)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeBlockIndex === i
                    ? 'bg-micro-cyan text-white shadow-md'
                    : 'bg-white dark:bg-micro-navy text-micro-muted border border-micro-line dark:border-white/10 hover:border-micro-cyan'
                }`}
              >
                Lâmina {i + 1}: {b.name} ({b.questions?.length})
              </button>
            ))}
          </div>

          {/* Perguntas da Lâmina Atual */}
          {currentBlock && (
            <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm space-y-6">
              <div className="border-b border-micro-line dark:border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-micro-navy dark:text-white">
                    {currentBlock.name}
                  </h2>
                  <p className="text-xs text-micro-muted">{currentBlock.questions?.length} questões nesta lâmina setorial</p>
                </div>
                <span className="text-xs font-bold text-micro-cyan bg-micro-cyan/10 px-3 py-1 rounded-full">
                  Lâmina {activeBlockIndex + 1} de {blocks.length}
                </span>
              </div>

              <div className="space-y-4">
                {currentBlock.questions?.map((q: any, qi: number) => {
                  const sel = answers[q.id];
                  return (
                    <div key={q.id} className="p-4 rounded-2xl bg-micro-bg dark:bg-white/5 border border-micro-line/70 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-micro-cyan/40 transition-colors">
                      <div className="text-xs font-medium text-micro-navy dark:text-white max-w-2xl leading-relaxed">
                        <span className="font-bold text-micro-cyan mr-2">Q{qi + 1}.</span>
                        {q.text}
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'conforme')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            sel === 'conforme' ? 'bg-green-600 text-white shadow-sm scale-105' : 'bg-white dark:bg-white/10 text-green-700 hover:bg-green-50'
                          }`}
                        >
                          Conforme
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'nao-conforme')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            sel === 'nao-conforme' ? 'bg-red-600 text-white shadow-sm scale-105' : 'bg-white dark:bg-white/10 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          Não Conf.
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'parcialmente-conforme')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            sel === 'parcialmente-conforme' ? 'bg-yellow-500 text-white shadow-sm scale-105' : 'bg-white dark:bg-white/10 text-yellow-700 hover:bg-yellow-50'
                          }`}
                        >
                          Parcial
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAnswer(q.id, 'na')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            sel === 'na' ? 'bg-gray-500 text-white shadow-sm scale-105' : 'bg-white dark:bg-white/10 text-gray-600 hover:bg-gray-100'
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
              <div className="pt-6 border-t border-micro-line dark:border-white/10 flex items-center justify-between">
                <div className="text-xs text-micro-muted">
                  Respondidas: <strong className="text-micro-navy dark:text-white">{allAnswerList.length}</strong> de {totalQuestions}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-micro-orange hover:bg-micro-orange/90 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{saving ? 'Gravando Avaliação...' : 'Gravar Avaliação CEM'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Histórico de Avaliações Salvas */
        <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-micro-navy dark:text-white">
              Avaliações Históricas Registradas no CCO
            </h2>
            <span className="text-xs text-micro-muted">Total: {evaluations.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-micro-line dark:border-white/10 text-micro-muted uppercase">
                  <th className="py-3">Chamado / Ticket</th>
                  <th>Data</th>
                  <th>Avaliador</th>
                  <th>Conformidade</th>
                  <th>C / NC / P / NA</th>
                  <th>Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-micro-line/50 dark:divide-white/5">
                {evaluations.map(ev => (
                  <tr key={ev.id} className="hover:bg-micro-bg/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 font-bold text-micro-navy dark:text-white">{ev.ticketProtocol}</td>
                    <td>{ev.evaluationDate}</td>
                    <td>{ev.evaluatorName}</td>
                    <td>
                      <span className="font-extrabold text-micro-cyan text-sm">{ev.scorePercentage}%</span>
                    </td>
                    <td className="font-mono text-micro-muted">
                      {ev.countGood} / {ev.countBad} / {ev.countFourth} / {ev.countNa}
                    </td>
                    <td className="text-micro-muted max-w-xs truncate">{ev.notes || '—'}</td>
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
