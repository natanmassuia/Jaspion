import { apiFetch } from '../services/api';
import { useState, useEffect } from 'react';
import { CheckSquare, CheckCircle, XCircle, AlertTriangle, MinusCircle, Send, History, Award, AlertCircle, Pencil, X, ChevronRight } from 'lucide-react';
import { calculateCemScore } from '@jaspion/shared';
import cemLogoOfficial from '../assets/brand/cem-logo-official.png';
import microsetLogoPositive from '../assets/microset-logo-positive.png';
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
  const [answerObservations, setAnswerObservations] = useState<Record<string, string>>({});
  const [openObservations, setOpenObservations] = useState<Record<string, boolean>>({});
  const [ticketProtocol, setTicketProtocol] = useState('');
  const [evaluationDate, setEvaluationDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [evaluationNotes, setEvaluationNotes] = useState('');
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [viewTab, setViewTab] = useState<'formulario' | 'historico'>('historico');
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [editingEvaluationId, setEditingEvaluationId] = useState<string | null>(null);
  const [loadingEvaluationId, setLoadingEvaluationId] = useState<string | null>(null);

  const loadEvaluations = () => apiFetch('/api/checklist-cem/evaluations')
    .then(r => r.json())
    .then(d => { if (d.success) setEvaluations(d.data); });

  useEffect(() => {
    apiFetch('/api/checklist-cem/blocks')
      .then(r => r.json())
      .then(d => {
        if (d.success) setBlocks(d.data);
      });

    loadEvaluations();

    apiFetch('/api/checklist-cem/draft')
      .then(response => response.json())
      .then(result => {
        if (!result.success || !result.data) return;
        const draftAnswers = result.data.answers || [];
        setTicketProtocol(result.data.ticketProtocol || '');
        setEvaluationDate(result.data.evaluationDate || new Date().toISOString().slice(0, 10));
        setActiveBlockIndex(Number(result.data.currentBlockIndex || 0));
        setEditingEvaluationId(result.data.editingEvaluationId || null);
        setAnswers(Object.fromEntries(draftAnswers.map((answer: any) => [answer.questionId, answer.answer])));
        setAnswerObservations(Object.fromEntries(draftAnswers.map((answer: any) => [answer.questionId, answer.observation || ''])));
        setOpenObservations(Object.fromEntries(draftAnswers.filter((answer: any) => answer.observation).map((answer: any) => [answer.questionId, true])));
      });
  }, []);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleObservation = (questionId: string, value: string) => {
    setAnswerObservations(previous => ({ ...previous, [questionId]: value }));
  };

  const currentBlock = blocks[activeBlockIndex];
  const allAnswerList = Object.entries(answers).map(([questionId, answer]) => ({
    questionId,
    answer,
    observation: answerObservations[questionId] || ''
  }));
  const scoreStats = calculateCemScore(allAnswerList);
  const totalQuestions = blocks.reduce((total, block) => total + (block.questions?.length || 0), 0);
  const pendingCount = Math.max(0, totalQuestions - allAnswerList.length);
  const metricPercent = (value: number) => totalQuestions ? Math.round((value / totalQuestions) * 100) : 0;
  const hasAnswers = allAnswerList.length > 0;
  const isHighQuality = scoreStats.score >= 80;
  const evaluatedTickets = evaluations.length;
  const averageScore = evaluatedTickets
    ? Math.round(evaluations.reduce((sum, evaluation) => sum + Number(evaluation.scorePercentage || 0), 0) / evaluatedTickets)
    : 0;
  const highQualityTickets = evaluations.filter(evaluation => Number(evaluation.scorePercentage || 0) >= 80).length;
  const historyTotals = evaluations.reduce((totals, evaluation) => ({
    good: totals.good + Number(evaluation.goodCount || 0),
    bad: totals.bad + Number(evaluation.badCount || 0),
    fourth: totals.fourth + Number(evaluation.fourthCount || 0),
    na: totals.na + Number(evaluation.naCount || 0)
  }), { good: 0, bad: 0, fourth: 0, na: 0 });
  const historyAnswers = historyTotals.good + historyTotals.bad + historyTotals.fourth + historyTotals.na;
  const historyPercent = (value: number) => historyAnswers ? Math.round((value / historyAnswers) * 100) : 0;

  const cancelEditing = () => {
    setEditingEvaluationId(null);
    setTicketProtocol('');
    setAnswers({});
    setAnswerObservations({});
    setOpenObservations({});
    setEvaluationDate(new Date().toISOString().slice(0, 10));
    setEvaluationNotes('');
    setActiveBlockIndex(0);
  };

  const handleEditEvaluation = async (evaluationId: string) => {
    setLoadingEvaluationId(evaluationId);
    try {
      const response = await apiFetch(`/api/checklist-cem/evaluations/${evaluationId}`);
      const data = await response.json();
      if (!data.success) return;

      setEditingEvaluationId(evaluationId);
      setTicketProtocol(data.data.ticketProtocol || '');
      setAnswers(Object.fromEntries((data.data.answers || []).map((answer: any) => [answer.questionId, answer.answer])));
      setAnswerObservations(Object.fromEntries((data.data.answers || []).map((answer: any) => [answer.questionId, answer.observation || ''])));
      setOpenObservations(Object.fromEntries((data.data.answers || []).filter((answer: any) => answer.observation).map((answer: any) => [answer.questionId, true])));
      setEvaluationDate(data.data.evaluationDate || new Date().toISOString().slice(0, 10));
      setEvaluationNotes(data.data.notes || '');
      setActiveBlockIndex(0);
      setViewTab('formulario');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoadingEvaluationId(null);
    }
  };

  const handleSubmit = async () => {
    if (!ticketProtocol.trim()) {
      alert('Por favor, informe o número do chamado/ticket (ex: 883088241).');
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(editingEvaluationId
        ? `/api/checklist-cem/evaluations/${editingEvaluationId}`
        : '/api/checklist-cem/evaluations', {
        method: editingEvaluationId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketProtocol,
          evaluationDate,
          shift: 'Comercial',
          notes: editingEvaluationId ? evaluationNotes : 'Avaliação realizada no Jaspion V1',
          answers: allAnswerList
        })
      });
      const data = await res.json();
      
      if (data.success) {
        alert(`${editingEvaluationId ? 'Ticket atualizado' : 'Checklist gravado'} com sucesso! Pontuação final: ${data.data.score}%`);
        await loadEvaluations();
        await apiFetch('/api/checklist-cem/draft', { method: 'DELETE' });
        cancelEditing();
        setViewTab('formulario');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleNextBlock = async () => {
    if (!ticketProtocol.trim()) {
      alert('Informe o número do chamado antes de avançar.');
      return;
    }

    const nextBlockIndex = Math.min(activeBlockIndex + 1, Math.max(0, blocks.length - 1));
    setSavingDraft(true);
    try {
      const response = await apiFetch('/api/checklist-cem/draft', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketProtocol,
          evaluationDate,
          currentBlockIndex: nextBlockIndex,
          editingEvaluationId,
          answers: allAnswerList
        })
      });
      const result = await response.json();
      if (result.success) setActiveBlockIndex(nextBlockIndex);
    } finally {
      setSavingDraft(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Oficial CEM com Mascote Auditor M7 */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-blue-50/60 dark:from-micro-navy dark:via-micro-navy dark:to-[#222344] rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
          <div className="flex flex-shrink-0 items-center gap-4" aria-label="Microset e Central de Excelência Microset">
            <img
              src={microsetLogoPositive}
              alt="Microset Telecom"
              className="microset-content-logo brand-logo-adaptive"
            />
            <span className="h-14 w-px bg-micro-line dark:bg-white/20" aria-hidden="true" />
            <div className="cem-logo-window" aria-hidden="true">
              <img
                src={cemLogoOfficial}
                alt=""
                className="cem-logo-adaptive brand-logo-adaptive"
              />
            </div>
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
        <div className="flex items-center space-x-4 p-2">
          <img 
            src={m7Writing} 
            alt="M7 Auditor" 
            className="w-20 h-20 object-contain drop-shadow-md transform hover:scale-105 transition-transform"
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
            onClick={() => setViewTab('historico')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'historico' ? 'bg-micro-navy text-white shadow-md dark:bg-white dark:text-micro-navy' : 'text-micro-muted hover:text-micro-ink'
            }`}
          >
            🕒 Tickets Avaliados ({evaluations.length})
          </button>
          <button
            onClick={() => setViewTab('formulario')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewTab === 'formulario' ? 'bg-micro-navy text-white shadow-md dark:bg-white dark:text-micro-navy' : 'text-micro-muted hover:text-micro-ink'
            }`}
          >
            📋 Avaliação em Lâminas
          </button>
        </div>
      </div>

      {viewTab === 'formulario' ? (
        <div className="space-y-6">
          {editingEvaluationId && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-micro-orange/35 bg-micro-orange/10 px-5 py-4 text-sm">
              <div>
                <strong className="block text-micro-navy dark:text-white">Editando ticket {ticketProtocol}</strong>
                <span className="text-xs text-micro-muted">As respostas carregadas substituirão a avaliação salva quando você confirmar.</span>
              </div>
              <button type="button" onClick={cancelEditing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-micro-line bg-white px-3 py-2 text-xs font-bold text-micro-navy hover:border-micro-orange dark:bg-white/10 dark:text-white">
                <X className="h-4 w-4" /> Cancelar edição
              </button>
            </div>
          )}
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

          {/* Navegador das áreas da avaliação */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {blocks.map((b, i) => {
              const answeredInBlock = (b.questions || []).filter((question: any) => answers[question.id]).length;
              return (
                <button
                  key={b.id}
                  onClick={() => setActiveBlockIndex(i)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    activeBlockIndex === i
                      ? 'bg-micro-cyan text-white shadow-md'
                      : 'bg-white dark:bg-micro-navy text-micro-muted border border-micro-line dark:border-white/10 hover:border-micro-cyan'
                  }`}
                >
                  {b.name} ({answeredInBlock}/{b.questions?.length || 0})
                </button>
              );
            })}
          </div>

          {/* Perguntas da Lâmina Atual */}
          {currentBlock && (
            <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm space-y-6">
              <div className="border-b border-micro-line dark:border-white/10 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-micro-navy dark:text-white">
                    {currentBlock.name}
                  </h2>
                  <p className="text-xs text-micro-muted">{currentBlock.questions?.length} itens nesta área de avaliação</p>
                </div>
                <span className="text-xs font-bold text-micro-cyan bg-micro-cyan/10 px-3 py-1 rounded-full">
                  Área {activeBlockIndex + 1} de {blocks.length}
                </span>
              </div>

              <div className="space-y-4">
                {currentBlock.questions?.map((q: any, qi: number) => {
                  const sel = answers[q.id];
                  return (
                    <div key={q.id} className={`cem-question-card ${sel ? `answer-${sel}` : ''}`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-xs font-medium text-micro-navy dark:text-white max-w-2xl leading-relaxed">
                          <span className="font-bold text-micro-cyan mr-2">Item {qi + 1}.</span>
                          {q.text}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button type="button" onClick={() => handleAnswer(q.id, 'conforme')} className={`cem-answer-button answer-conforme ${sel === 'conforme' ? 'is-selected' : ''}`}>Conforme</button>
                          <button type="button" onClick={() => handleAnswer(q.id, 'nao-conforme')} className={`cem-answer-button answer-nao-conforme ${sel === 'nao-conforme' ? 'is-selected' : ''}`}>Não conforme</button>
                          <button type="button" onClick={() => handleAnswer(q.id, 'parcialmente-conforme')} className={`cem-answer-button answer-parcialmente-conforme ${sel === 'parcialmente-conforme' ? 'is-selected' : ''}`}>Parcialmente conforme</button>
                          <button type="button" onClick={() => handleAnswer(q.id, 'na')} className={`cem-answer-button answer-na ${sel === 'na' ? 'is-selected' : ''}`}>Não se aplica</button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setOpenObservations(previous => ({ ...previous, [q.id]: !previous[q.id] }))}
                        className="mt-3 text-[11px] font-bold text-micro-cyan hover:underline"
                        aria-expanded={Boolean(openObservations[q.id])}
                      >
                        {openObservations[q.id] ? '− Ocultar observação' : '+ Observação'}
                      </button>
                      {openObservations[q.id] && (
                        <textarea
                          value={answerObservations[q.id] || ''}
                          onChange={event => handleObservation(q.id, event.target.value)}
                          placeholder="Observação opcional sobre este item"
                          rows={3}
                          className="mt-3 w-full resize-y rounded-xl border border-micro-line bg-white px-4 py-3 text-xs text-micro-ink outline-none focus:border-micro-cyan focus:ring-2 focus:ring-micro-cyan/20 dark:bg-white/5 dark:text-white dark:border-white/10"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Navegação e persistência da avaliação */}
              <div className="pt-6 border-t border-micro-line dark:border-white/10 flex items-center justify-between">
                <div className="text-xs text-micro-muted">
                  Respondidas nesta área: <strong className="text-micro-navy dark:text-white">{(currentBlock.questions || []).filter((question: any) => answers[question.id]).length}</strong> de {currentBlock.questions?.length || 0}
                </div>
                <button
                  onClick={activeBlockIndex === blocks.length - 1 ? handleSubmit : handleNextBlock}
                  disabled={saving || savingDraft}
                  className="bg-micro-orange hover:bg-micro-orange/90 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {activeBlockIndex === blocks.length - 1 ? <Send className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  <span>{saving || savingDraft ? 'Salvando...' : activeBlockIndex === blocks.length - 1 ? 'Finalizar avaliação do Ticket' : 'Próxima'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <section className="cem-summary" aria-label="Insights dos tickets avaliados">
            <article className="cem-score-card">
              <span>Conformidade média</span>
              <strong><AnimatedNumber value={averageScore} suffix="%" /></strong>
              <div className="cem-score-line"><AnimatedProgress percent={averageScore} /></div>
            </article>
            <article className="cem-metric-card cem-metric-fourth">
              <span>Tickets avaliados</span>
              <strong><AnimatedNumber value={evaluatedTickets} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={evaluatedTickets ? 100 : 0} /></div>
            </article>
            <article className="cem-metric-card cem-metric-good">
              <span>Acima de 80%</span>
              <strong><AnimatedNumber value={highQualityTickets} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={evaluatedTickets ? Math.round((highQualityTickets / evaluatedTickets) * 100) : 0} /></div>
            </article>
            <article className="cem-metric-card cem-metric-bad">
              <span>Não conformidades</span>
              <strong><AnimatedNumber value={historyTotals.bad} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={historyPercent(historyTotals.bad)} /></div>
            </article>
            <article className="cem-metric-card cem-metric-fourth">
              <span>Parcialmente conformes</span>
              <strong><AnimatedNumber value={historyTotals.fourth} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={historyPercent(historyTotals.fourth)} /></div>
            </article>
            <article className="cem-metric-card cem-metric-na">
              <span>Não se aplica</span>
              <strong><AnimatedNumber value={historyTotals.na} /></strong>
              <div className="cem-metric-line"><AnimatedProgress percent={historyPercent(historyTotals.na)} /></div>
            </article>
          </section>

          <div className="bg-white dark:bg-micro-navy rounded-3xl p-6 sm:p-8 border border-micro-line dark:border-white/10 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-micro-navy dark:text-white">Tickets Avaliados</h2>
                <p className="mt-1 text-xs text-micro-muted">Consulte os resultados ou carregue uma avaliação para corrigir e atualizar o ticket.</p>
              </div>
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
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-micro-line/50 dark:divide-white/5">
                  {evaluations.map(ev => (
                    <tr key={ev.id} className="hover:bg-micro-bg/50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-bold text-micro-navy dark:text-white">{ev.ticketProtocol}</td>
                      <td>{ev.evaluationDate}</td>
                      <td>{ev.evaluatorName}</td>
                      <td><span className="font-extrabold text-micro-cyan text-sm">{ev.scorePercentage}%</span></td>
                      <td className="font-mono text-micro-muted">{ev.goodCount} / {ev.badCount} / {ev.fourthCount} / {ev.naCount}</td>
                      <td className="text-micro-muted max-w-xs truncate">{ev.notes || '—'}</td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={() => handleEditEvaluation(ev.id)}
                          disabled={loadingEvaluationId === ev.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-micro-cyan/35 bg-micro-cyan/10 px-3 py-2 font-bold text-micro-cyan hover:bg-micro-cyan hover:text-white disabled:opacity-50"
                          aria-label={`Editar ticket ${ev.ticketProtocol}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          {loadingEvaluationId === ev.id ? 'Carregando' : 'Editar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
