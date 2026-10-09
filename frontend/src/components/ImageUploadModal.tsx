import React, { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../services/api';
import { Upload, Link as LinkIcon, X, Check, Camera, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  currentImageUrl?: string | null;
  targetType: 'unit' | 'client';
  targetId: string;
  onSuccess: (newImageUrl: string) => void;
}

export function ImageUploadModal({
  isOpen,
  onClose,
  title,
  subtitle,
  currentImageUrl,
  targetType,
  targetId,
  onSuccess
}: ImageUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [base64Data, setBase64Data] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentImageUrl || null);
      setBase64Data(null);
      setCustomUrl(currentImageUrl && !currentImageUrl.startsWith('data:') ? currentImageUrl : '');
      setError(null);
      setLoading(false);
    }
  }, [isOpen, currentImageUrl]);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('O tamanho da imagem não pode ultrapassar 20MB.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64Data(result);
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      const endpoint = targetType === 'unit' 
        ? `/api/unidades/${targetId}/image` 
        : `/api/clientes/${targetId}/image`;

      const payload = activeTab === 'upload' && base64Data
        ? { imageBase64: base64Data }
        : { imageUrl: customUrl.trim() };

      if (!payload.imageBase64 && !payload.imageUrl) {
        setError('Nenhuma imagem foi selecionada ou preenchida.');
        setLoading(false);
        return;
      }

      const res = await apiFetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Falha ao salvar a imagem');
      }

      onSuccess(data.imageUrl);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao processar envio da imagem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-micro-navy border border-micro-line dark:border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-micro-line dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-micro-cyan/10 text-micro-cyan flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-micro-navy dark:text-white">{title}</h3>
              {subtitle && <p className="text-xs text-micro-muted">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-micro-muted hover:text-micro-navy dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Abas: Upload vs URL */}
          <div className="flex bg-micro-bg dark:bg-white/5 p-1 rounded-2xl border border-micro-line dark:border-white/10">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-micro-navy text-micro-navy dark:text-white shadow-sm'
                  : 'text-micro-muted hover:text-micro-navy dark:hover:text-white'
              }`}
            >
              <Upload className="w-4 h-4" /> Enviar Arquivo
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'url'
                  ? 'bg-white dark:bg-micro-navy text-micro-navy dark:text-white shadow-sm'
                  : 'text-micro-muted hover:text-micro-navy dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-4 h-4" /> Link / URL
            </button>
          </div>

          {/* Conteúdo Aba Upload */}
          {activeTab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileProcess(e.target.files[0]);
                  }
                }}
              />
              <div
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                  isDragging 
                    ? 'border-micro-cyan bg-micro-cyan/5' 
                    : 'border-micro-line dark:border-white/10 hover:border-micro-cyan/50 bg-micro-bg/50 dark:bg-white/[0.02]'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-micro-cyan/10 text-micro-cyan flex items-center justify-center mb-1">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-micro-navy dark:text-white">
                  Clique para selecionar ou arraste a imagem aqui
                </div>
                <div className="text-[11px] text-micro-muted">
                  Formatos suportados: PNG, JPG, WebP (até 20MB)
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold text-micro-navy dark:text-white block">
                URL da Imagem:
              </label>
              <input
                type="text"
                value={customUrl}
                onChange={e => {
                  setCustomUrl(e.target.value);
                  setPreviewUrl(e.target.value || null);
                }}
                placeholder="https://exemplo.com/foto.jpg ou /assets/foto.png"
                className="w-full px-4 py-2.5 rounded-2xl border border-micro-line dark:border-white/10 bg-white dark:bg-white/5 text-xs text-micro-navy dark:text-white focus:outline-none focus:border-micro-cyan"
              />
            </div>
          )}

          {/* Pré-visualização */}
          {previewUrl && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-micro-muted uppercase tracking-wider block">
                Pré-visualização:
              </span>
              <div className="relative h-44 w-full rounded-2xl overflow-hidden border border-micro-line dark:border-white/10 bg-slate-900 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Pré-visualização"
                  className="w-full h-full object-cover"
                  onError={() => setError('Não foi possível carregar a prévia da imagem indicada.')}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-micro-line dark:border-white/10 bg-micro-bg/50 dark:bg-white/[0.02] flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-micro-muted hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || (!base64Data && !customUrl.trim())}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-micro-cyan text-white hover:bg-micro-cyan/90 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Salvar Imagem
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
