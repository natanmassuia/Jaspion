import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface ProcedureContentProps {
  content: string;
}

export function ProcedureContent({ content }: ProcedureContentProps) {
  if (!content) return null;

  // Split lines
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inTable = false;
  let tableRows: string[][] = [];
  let currentAlert: { type: string; lines: string[] } | null = null;

  const flushAlert = (idx: number) => {
    if (!currentAlert) return;
    const alertType = currentAlert.type.toUpperCase();
    const text = currentAlert.lines.join('\n');

    let bgClass = 'bg-blue-500/10 border-blue-500/30 text-blue-900 dark:text-blue-200';
    let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

    if (alertType.includes('IMPORTANT') || alertType.includes('WARNING')) {
      bgClass = 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200';
      icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
    } else if (alertType.includes('CAUTION') || alertType.includes('CRITICAL')) {
      bgClass = 'bg-red-500/10 border-red-500/30 text-red-900 dark:text-red-200';
      icon = <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />;
    }

    elements.push(
      <div key={`alert-${idx}`} className={`p-4 my-3 rounded-2xl border ${bgClass} flex items-start gap-3 text-xs leading-relaxed font-medium`}>
        {icon}
        <div className="whitespace-pre-line">{text}</div>
      </div>
    );
    currentAlert = null;
  };

  const flushTable = (idx: number) => {
    if (!inTable || tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(1);

    elements.push(
      <div key={`table-${idx}`} className="my-3 overflow-x-auto rounded-2xl border border-micro-line dark:border-white/10 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-micro-navy text-white font-extrabold uppercase tracking-wider text-[11px]">
              {headerRow.map((col, cIdx) => (
                <th key={cIdx} className="p-3 border-b border-white/10">
                  {col.trim()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-micro-line dark:divide-white/10 bg-white dark:bg-micro-navy/60">
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-micro-bg/50 dark:hover:bg-white/5 transition-colors">
                {row.map((col, cIdx) => (
                  <td key={cIdx} className="p-3 font-medium text-micro-ink dark:text-white/90">
                    {col.trim()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    tableRows = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Check alert
    if (line.startsWith('> [!')) {
      flushTable(i);
      flushAlert(i);
      const match = line.match(/> \[!([A-Z]+)\]/i);
      currentAlert = { type: match ? match[1] : 'NOTE', lines: [] };
      continue;
    } else if (currentAlert && line.startsWith('>')) {
      currentAlert.lines.push(line.replace(/^>\s?/, ''));
      continue;
    } else if (currentAlert && !line.startsWith('>')) {
      flushAlert(i);
    }

    // Check table
    if (line.startsWith('|') && line.endsWith('|')) {
      // Check divider row
      if (line.includes('---')) {
        continue;
      }
      inTable = true;
      const cols = line.split('|').slice(1, -1);
      tableRows.push(cols);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    if (!line) {
      elements.push(<div key={`blank-${i}`} className="h-2" />);
      continue;
    }

    // Headers
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${i}`} className="text-sm font-extrabold text-micro-navy dark:text-white mt-4 mb-2 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-micro-cyan rounded-full inline-block" />
          {line.replace('### ', '')}
        </h4>
      );
    } else if (line.startsWith('#### ')) {
      elements.push(
        <h5 key={`h4-${i}`} className="text-xs font-bold text-micro-cyan dark:text-micro-cyan uppercase tracking-wider mt-3 mb-1">
          {line.replace('#### ', '')}
        </h5>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={`li-${i}`} className="flex items-start gap-2 text-xs text-micro-ink dark:text-white/90 my-1 pl-2">
          <span className="text-micro-cyan font-black">•</span>
          <span>{line.replace('- ', '')}</span>
        </div>
      );
    } else if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-2 text-xs text-micro-ink dark:text-white/90 my-1.5 pl-2 font-medium">
          <span className="font-extrabold text-micro-orange">{line.match(/^\d+\./)![0]}</span>
          <span>{line.replace(/^\d+\.\s/, '')}</span>
        </div>
      );
    } else if (line.startsWith('---')) {
      elements.push(<hr key={`hr-${i}`} className="border-micro-line dark:border-white/10 my-4" />);
    } else {
      elements.push(
        <p key={`p-${i}`} className="text-xs text-micro-ink/90 dark:text-white/80 leading-relaxed my-1.5">
          {line}
        </p>
      );
    }
  }

  flushTable(lines.length);
  flushAlert(lines.length);

  return <div className="space-y-1 font-sans">{elements}</div>;
}
