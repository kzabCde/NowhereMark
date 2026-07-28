'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import {
  ArrowDownToLine,
  Check,
  Crop,
  Download,
  Eraser,
  FlipHorizontal2,
  FlipVertical2,
  FolderClock,
  ImagePlus,
  Layers3,
  Loader2,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  SlidersHorizontal,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import { UploadDropzone } from '@/components/UploadDropzone';
import { removeBgFromBlob } from '@/lib/bg-removal';
import {
  centerCropForAspect,
  getOutputFilename,
  normalizeCrop,
} from '@/lib/image-math';
import { renderImage } from '@/lib/image-worker-client';
import {
  deleteLocalProject,
  loadLocalProject,
  saveLocalProject,
} from '@/lib/project-store';
import { useProjectHistory } from '@/lib/use-project-history';
import { applyLayoutPreset } from '@/lib/watermark-presets';
import {
  DEFAULT_PROJECT_SETTINGS,
  type EditorTool,
  type ExportMime,
  type ProjectSettings,
  type WorkspaceImage,
} from '@/types/editor';
import type { LayoutPreset, WatermarkMode } from '@/types/watermark';

const MAX_IMAGES = 9;
const SOURCE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const WATERMARK_TYPES = [...SOURCE_TYPES, 'image/svg+xml'];

type PreviewState = {
  url: string;
  width: number;
  height: number;
};

type Notice = {
  tone: 'success' | 'error' | 'info';
  message: string;
};

const toolIcons: Record<EditorTool, typeof Crop> = {
  transform: Crop,
  adjust: SlidersHorizontal,
  background: Eraser,
  watermark: Layers3,
  export: ArrowDownToLine,
};

function createId(name: string) {
  return `${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}-${name}`;
}

function imageDimensions(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      reject(new Error('Invalid image'));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

function revokeImageUrls(image: WorkspaceImage) {
  URL.revokeObjectURL(image.sourceUrl);
  if (image.backgroundUrl) URL.revokeObjectURL(image.backgroundUrl);
}

function cloneDefaultSettings() {
  return structuredClone(DEFAULT_PROJECT_SETTINGS);
}

export function UnifiedEditor() {
  const { t } = useLanguage();
  const history = useProjectHistory<ProjectSettings>(cloneDefaultSettings());
  const { value: settings, commit, reset: resetSettings } = history;
  const [images, setImages] = useState<WorkspaceImage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>('transform');
  const [watermarkFile, setWatermarkFile] = useState<File>();
  const [watermarkName, setWatermarkName] = useState('');
  const [watermarkUrl, setWatermarkUrl] = useState('');
  const [preview, setPreview] = useState<PreviewState>();
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [notice, setNotice] = useState<Notice>();
  const [savedAt, setSavedAt] = useState<number>();
  const renderGeneration = useRef(0);
  const imagesRef = useRef(images);
  const watermarkUrlRef = useRef('');

  const selectedImage = useMemo(
    () => images.find((image) => image.id === selectedId) ?? images[0],
    [images, selectedId],
  );

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => {
    imagesRef.current.forEach(revokeImageUrls);
    if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(undefined), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!selectedImage) return;

    const generation = ++renderGeneration.current;
    const timeout = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError(false);
      try {
        const result = await renderImage({
          sourceBlob: selectedImage.backgroundBlob ?? selectedImage.file,
          watermarkBlob: watermarkFile,
          settings,
          previewMaxDimension: 1400,
        });
        if (generation !== renderGeneration.current) return;
        const url = URL.createObjectURL(result.blob);
        setPreview((current) => {
          if (current?.url) URL.revokeObjectURL(current.url);
          return { url, width: result.width, height: result.height };
        });
      } catch {
        if (generation === renderGeneration.current) setPreviewError(true);
      } finally {
        if (generation === renderGeneration.current) setPreviewLoading(false);
      }
    }, 140);

    return () => window.clearTimeout(timeout);
  }, [selectedImage, settings, watermarkFile]);

  const updateSettings = useCallback((updater: (current: ProjectSettings) => ProjectSettings) => {
    commit((current) => updater(current));
    setSavedAt(undefined);
  }, [commit]);

  const addFiles = useCallback(async (fileList: FileList | null) => {
    if (!fileList) return;
    const selectedFiles = Array.from(fileList);
    const supportedFiles = selectedFiles.filter((file) => SOURCE_TYPES.includes(file.type));
    if (supportedFiles.length !== selectedFiles.length) {
      setNotice({ tone: 'error', message: t('error.unsupported') });
    }
    const remaining = Math.max(0, MAX_IMAGES - imagesRef.current.length);
    const acceptedFiles = supportedFiles.slice(0, remaining);
    if (supportedFiles.length > remaining) {
      setNotice({ tone: 'error', message: t('error.limit') });
    }

    const nextImages: WorkspaceImage[] = [];
    for (const file of acceptedFiles) {
      try {
        const dimensions = await imageDimensions(file);
        nextImages.push({
          id: createId(file.name),
          file,
          sourceUrl: URL.createObjectURL(file),
          name: file.name,
          ...dimensions,
        });
      } catch {
        setNotice({ tone: 'error', message: t('error.unsupported') });
      }
    }

    if (!nextImages.length) return;
    setImages((current) => [...current, ...nextImages].slice(0, MAX_IMAGES));
    setSelectedId((current) => current ?? nextImages[0].id);
    setSavedAt(undefined);
  }, [t]);

  const removeImage = useCallback((id: string) => {
    setImages((current) => {
      const target = current.find((image) => image.id === id);
      if (target) revokeImageUrls(target);
      const next = current.filter((image) => image.id !== id);
      setSelectedId((selected) => selected === id ? (next[0]?.id ?? null) : selected);
      return next;
    });
    setSavedAt(undefined);
  }, []);

  const clearImages = useCallback(() => {
    setImages((current) => {
      current.forEach(revokeImageUrls);
      return [];
    });
    setSelectedId(null);
    setSavedAt(undefined);
  }, []);

  const resetProject = useCallback(() => {
    if (imagesRef.current.length && !window.confirm(t('project.resetConfirm'))) return;
    clearImages();
    resetSettings(cloneDefaultSettings());
    if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
    watermarkUrlRef.current = '';
    setWatermarkUrl('');
    setWatermarkFile(undefined);
    setWatermarkName('');
    setActiveTool('transform');
  }, [clearImages, resetSettings, t]);

  const handleWatermarkFile = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !WATERMARK_TYPES.includes(file.type)) {
      if (file) setNotice({ tone: 'error', message: t('error.unsupported') });
      return;
    }
    if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
    const url = URL.createObjectURL(file);
    watermarkUrlRef.current = url;
    setWatermarkUrl(url);
    setWatermarkFile(file);
    setWatermarkName(file.name);
    setSavedAt(undefined);
  }, [t]);

  const processBackground = useCallback(async (image: WorkspaceImage) => {
    setImages((current) => current.map((item) => (
      item.id === image.id
        ? { ...item, backgroundRemoving: true, backgroundError: undefined }
        : item
    )));
    try {
      const blob = await removeBgFromBlob(image.file);
      const url = URL.createObjectURL(blob);
      setImages((current) => current.map((item) => {
        if (item.id !== image.id) return item;
        if (item.backgroundUrl) URL.revokeObjectURL(item.backgroundUrl);
        return {
          ...item,
          backgroundBlob: blob,
          backgroundUrl: url,
          backgroundRemoving: false,
          backgroundError: undefined,
        };
      }));
      setSavedAt(undefined);
    } catch {
      setImages((current) => current.map((item) => (
        item.id === image.id
          ? { ...item, backgroundRemoving: false, backgroundError: t('error.background') }
          : item
      )));
    }
  }, [t]);

  const processAllBackgrounds = useCallback(async () => {
    for (const image of imagesRef.current) {
      if (!image.backgroundBlob && !image.backgroundRemoving) {
        await processBackground(image);
      }
    }
  }, [processBackground]);

  const restoreOriginalBackground = useCallback((id: string) => {
    setImages((current) => current.map((image) => {
      if (image.id !== id) return image;
      if (image.backgroundUrl) URL.revokeObjectURL(image.backgroundUrl);
      return {
        ...image,
        backgroundBlob: undefined,
        backgroundUrl: undefined,
        backgroundError: undefined,
      };
    }));
    setSavedAt(undefined);
  }, []);

  const saveProject = useCallback(async () => {
    try {
      const timestamp = await saveLocalProject({
        settings,
        images: imagesRef.current,
        watermarkFile,
        watermarkName,
      });
      setSavedAt(timestamp);
      setNotice({ tone: 'success', message: t('project.savedMessage') });
    } catch {
      setNotice({ tone: 'error', message: t('project.none') });
    }
  }, [settings, t, watermarkFile, watermarkName]);

  const restoreProject = useCallback(async () => {
    try {
      const project = await loadLocalProject();
      if (!project) {
        setNotice({ tone: 'info', message: t('project.none') });
        return;
      }
      clearImages();
      const restoredImages = project.images.map((stored) => {
        const file = new File([stored.sourceBlob], stored.name, {
          type: stored.type,
          lastModified: stored.lastModified,
        });
        return {
          id: stored.id,
          name: stored.name,
          file,
          width: stored.width,
          height: stored.height,
          sourceUrl: URL.createObjectURL(file),
          backgroundBlob: stored.backgroundBlob,
          backgroundUrl: stored.backgroundBlob
            ? URL.createObjectURL(stored.backgroundBlob)
            : undefined,
        } satisfies WorkspaceImage;
      });
      setImages(restoredImages);
      setSelectedId(restoredImages[0]?.id ?? null);
      resetSettings(project.settings);
      if (watermarkUrlRef.current) URL.revokeObjectURL(watermarkUrlRef.current);
      if (project.watermarkBlob) {
        const file = new File(
          [project.watermarkBlob],
          project.watermarkName ?? 'watermark.png',
          { type: project.watermarkBlob.type },
        );
        const url = URL.createObjectURL(file);
        watermarkUrlRef.current = url;
        setWatermarkUrl(url);
        setWatermarkFile(file);
        setWatermarkName(file.name);
      } else {
        watermarkUrlRef.current = '';
        setWatermarkUrl('');
        setWatermarkFile(undefined);
        setWatermarkName('');
      }
      setSavedAt(project.updatedAt);
      setNotice({ tone: 'success', message: t('project.restoredMessage') });
    } catch {
      setNotice({ tone: 'error', message: t('project.none') });
    }
  }, [clearImages, resetSettings, t]);

  const exportImage = useCallback(async (image: WorkspaceImage) => {
    const result = await renderImage({
      sourceBlob: image.backgroundBlob ?? image.file,
      watermarkBlob: watermarkFile,
      settings,
    });
    const url = URL.createObjectURL(result.blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = getOutputFilename(image.name, settings.output.mimeType);
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [settings, watermarkFile]);

  const exportSelected = useCallback(async () => {
    if (!selectedImage) return;
    setExporting(true);
    try {
      await exportImage(selectedImage);
    } catch {
      setNotice({ tone: 'error', message: t('error.export') });
    } finally {
      setExporting(false);
    }
  }, [exportImage, selectedImage, t]);

  const exportAll = useCallback(async () => {
    if (!imagesRef.current.length) return;
    setExporting(true);
    try {
      for (const image of imagesRef.current) await exportImage(image);
    } catch {
      setNotice({ tone: 'error', message: t('error.export') });
    } finally {
      setExporting(false);
    }
  }, [exportImage, t]);

  return (
    <main className="mx-auto min-h-[calc(100vh-64px)] max-w-[1600px] px-3 py-5 md:px-6">
      {notice && (
        <div
          role="status"
          className={`fixed right-4 top-20 z-[60] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${
            notice.tone === 'success'
              ? 'border-emerald-400/30 bg-emerald-950/90 text-emerald-200'
              : notice.tone === 'error'
                ? 'border-rose-400/30 bg-rose-950/90 text-rose-200'
                : 'border-indigo-400/30 bg-indigo-950/90 text-indigo-200'
          }`}
        >
          {notice.message}
        </div>
      )}

      <section className="mb-4 flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.025] p-4 lg:flex-row lg:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">{t('editor.title')}</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">{t('editor.description')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarButton
            icon={<Undo2 className="h-4 w-4" />}
            label={t('editor.undo')}
            onClick={history.undo}
            disabled={!history.canUndo}
          />
          <ToolbarButton
            icon={<Redo2 className="h-4 w-4" />}
            label={t('editor.redo')}
            onClick={history.redo}
            disabled={!history.canRedo}
          />
          <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
          <ToolbarButton
            icon={<FolderClock className="h-4 w-4" />}
            label={t('editor.restore')}
            onClick={restoreProject}
          />
          <ToolbarButton
            icon={<Save className="h-4 w-4" />}
            label={t('editor.save')}
            onClick={saveProject}
            prominent
          />
          <ToolbarButton
            icon={<Trash2 className="h-4 w-4" />}
            label={t('editor.reset')}
            onClick={resetProject}
          />
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300">
              <Check className="h-3 w-3" />
              {t('editor.saved')}
            </span>
          )}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="min-w-0 space-y-3">
          <section className="rounded-2xl border border-white/10 bg-[#0b1019]/90 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-white">{t('editor.upload')}</h2>
              <span className="text-[11px] text-slate-500">{images.length} / {MAX_IMAGES}</span>
            </div>
            <UploadDropzone
              label={t('editor.upload')}
              helper={images.length
                ? `${t('editor.uploadRemaining')} (${MAX_IMAGES - images.length})`
                : t('editor.uploadHint')}
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              multiple
              onFiles={addFiles}
              disabled={images.length >= MAX_IMAGES}
            />
            {images.length > 0 && (
              <>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {images.map((image) => (
                    <button
                      type="button"
                      key={image.id}
                      onClick={() => setSelectedId(image.id)}
                      aria-label={`${t('editor.selected')}: ${image.name}`}
                      className={`group relative aspect-square overflow-hidden rounded-lg border transition ${
                        selectedImage?.id === image.id
                          ? 'border-indigo-400 ring-1 ring-indigo-400/60'
                          : 'border-white/10 hover:border-white/25'
                      }`}
                    >
                      <img
                        src={image.backgroundUrl ?? image.sourceUrl}
                        alt=""
                        className={`h-full w-full object-cover ${image.backgroundUrl ? 'bg-checkered' : ''}`}
                      />
                      {image.backgroundRemoving && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={clearImages}
                  className="mt-3 w-full rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-500 transition hover:border-rose-400/30 hover:text-rose-300"
                >
                  {t('editor.clear')}
                </button>
              </>
            )}
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1019]/90">
            <div role="tablist" aria-label={t('tools.title')} className="grid grid-cols-5 border-b border-white/10">
              {(Object.keys(toolIcons) as EditorTool[]).map((tool) => {
                const Icon = toolIcons[tool];
                return (
                  <button
                    type="button"
                    key={tool}
                    role="tab"
                    aria-selected={activeTool === tool}
                    onClick={() => setActiveTool(tool)}
                    className={`flex min-w-0 flex-col items-center gap-1 border-b-2 px-1 py-3 text-[10px] font-medium transition ${
                      activeTool === tool
                        ? 'border-indigo-400 bg-indigo-500/10 text-indigo-200'
                        : 'border-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="max-w-full truncate">{t(`tab.${tool}`)}</span>
                  </button>
                );
              })}
            </div>
            <div className="max-h-[calc(100vh-330px)] min-h-64 overflow-y-auto p-4">
              {activeTool === 'transform' && (
                <TransformPanel
                  settings={settings}
                  selectedImage={selectedImage}
                  onChange={updateSettings}
                />
              )}
              {activeTool === 'adjust' && (
                <AdjustPanel settings={settings} onChange={updateSettings} />
              )}
              {activeTool === 'background' && (
                <BackgroundPanel
                  selectedImage={selectedImage}
                  images={images}
                  onProcessSelected={() => selectedImage && processBackground(selectedImage)}
                  onProcessAll={processAllBackgrounds}
                  onRestore={() => selectedImage && restoreOriginalBackground(selectedImage.id)}
                />
              )}
              {activeTool === 'watermark' && (
                <WatermarkPanel
                  settings={settings}
                  watermarkName={watermarkName}
                  watermarkUrl={watermarkUrl}
                  onFile={handleWatermarkFile}
                  onChange={updateSettings}
                />
              )}
              {activeTool === 'export' && (
                <ExportPanel
                  settings={settings}
                  disabled={!images.length || exporting}
                  exporting={exporting}
                  onChange={updateSettings}
                  onExportSelected={exportSelected}
                  onExportAll={exportAll}
                />
              )}
            </div>
          </section>
        </aside>

        <section className="relative min-h-[620px] overflow-hidden rounded-2xl border border-white/10 bg-[#080c13]">
          {!selectedImage ? (
            <div className="flex min-h-[620px] flex-col items-center justify-center px-6 text-center">
              <span className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-indigo-400/30 bg-indigo-500/10 text-indigo-300">
                <ImagePlus className="h-7 w-7" />
              </span>
              <h2 className="text-lg font-semibold text-white">{t('editor.empty')}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{t('editor.emptyDescription')}</p>
              <label className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-400">
                <Upload className="h-4 w-4" />
                {t('editor.upload')}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  multiple
                  className="sr-only"
                  onChange={(event) => addFiles(event.target.files)}
                />
              </label>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">{selectedImage.name}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {t('editor.original')}: {selectedImage.width} × {selectedImage.height}
                    {preview && ` · ${t('editor.output')}: ${preview.width} × ${preview.height}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedImage.backgroundBlob && (
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-300">
                      {t('background.done')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(selectedImage.id)}
                    aria-label={t('editor.removeImage')}
                    className="rounded-lg border border-white/10 p-2 text-slate-500 transition hover:border-rose-400/30 hover:text-rose-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="bg-checkered flex min-h-[565px] items-center justify-center p-4 sm:p-8">
                {previewError ? (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                    {t('editor.previewError')}
                  </div>
                ) : preview ? (
                  <img
                    src={preview.url}
                    alt={`${t('editor.output')} ${selectedImage.name}`}
                    className={`max-h-[72vh] max-w-full rounded-lg object-contain shadow-2xl transition ${
                      previewLoading ? 'opacity-50' : 'opacity-100'
                    }`}
                  />
                ) : null}
                {previewLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/15 pointer-events-none">
                    <span className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/80 px-4 py-2 text-xs text-slate-300 backdrop-blur">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-300" />
                      {t('editor.processing')}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
  disabled,
  prominent,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  prominent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-35 ${
        prominent
          ? 'border-indigo-400/30 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25'
          : 'border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function TransformPanel({
  settings,
  selectedImage,
  onChange,
}: {
  settings: ProjectSettings;
  selectedImage?: WorkspaceImage;
  onChange: (updater: (current: ProjectSettings) => ProjectSettings) => void;
}) {
  const { t } = useLanguage();
  const resize = settings.transform.resize;
  const setResize = (next: Partial<typeof resize>) => onChange((current) => ({
    ...current,
    transform: {
      ...current.transform,
      resize: { ...current.transform.resize, ...next },
    },
  }));

  const applySizePreset = (width: number | null, height: number | null) => {
    onChange((current) => {
      const crop = width && height && selectedImage
        ? {
          ...centerCropForAspect(selectedImage.width, selectedImage.height, width, height),
          aspectRatio: [width, height] as [number, number],
        }
        : current.transform.crop;
      return {
        ...current,
        transform: {
          ...current.transform,
          crop,
          resize: {
            width,
            height,
            keepAspectRatio: !(width && height),
          },
        },
      };
    });
  };

  const cropPresets: Array<[string, number, number] | [string]> = [
    [t('transform.free')],
    ['1:1', 1, 1],
    ['4:5', 4, 5],
    ['16:9', 16, 9],
    ['9:16', 9, 16],
  ];

  return (
    <div className="space-y-5">
      <ControlSection title={t('transform.resizeTitle')}>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={`${t('transform.width')} (px)`}
            value={resize.width}
            placeholder={String(selectedImage?.width ?? '—')}
            onChange={(value) => setResize({
              width: value,
              height: resize.keepAspectRatio ? null : resize.height,
            })}
          />
          <NumberInput
            label={`${t('transform.height')} (px)`}
            value={resize.height}
            placeholder={String(selectedImage?.height ?? '—')}
            onChange={(value) => setResize({
              height: value,
              width: resize.keepAspectRatio ? null : resize.width,
            })}
          />
        </div>
        <Checkbox
          label={t('transform.keepRatio')}
          checked={resize.keepAspectRatio}
          onChange={(checked) => setResize({ keepAspectRatio: checked })}
        />
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{t('transform.preset')}</p>
        <div className="grid grid-cols-2 gap-2">
          <SmallButton onClick={() => applySizePreset(null, null)}>{t('transform.original')}</SmallButton>
          <SmallButton onClick={() => applySizePreset(1080, 1080)}>1080 × 1080</SmallButton>
          <SmallButton onClick={() => applySizePreset(1080, 1350)}>1080 × 1350</SmallButton>
          <SmallButton onClick={() => applySizePreset(1920, 1080)}>1920 × 1080</SmallButton>
        </div>
      </ControlSection>

      <ControlSection title={t('transform.cropTitle')}>
        <div className="grid grid-cols-3 gap-2">
          {cropPresets.map((preset) => (
            <SmallButton
              key={preset[0]}
              onClick={() => {
                const crop = preset.length === 1 || !selectedImage
                  ? cloneDefaultSettings().transform.crop
                  : {
                    ...centerCropForAspect(
                      selectedImage.width,
                      selectedImage.height,
                      preset[1],
                      preset[2],
                    ),
                    aspectRatio: [preset[1], preset[2]] as [number, number],
                  };
                onChange((current) => ({
                  ...current,
                  transform: { ...current.transform, crop },
                }));
              }}
            >
              {preset[0]}
            </SmallButton>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {([
            ['X', 'xPercent'],
            ['Y', 'yPercent'],
            ['W', 'widthPercent'],
            ['H', 'heightPercent'],
          ] as const).map(([label, key]) => (
            <NumberInput
              key={key}
              label={`${label} (%)`}
              value={Math.round(settings.transform.crop[key] * 10) / 10}
              onChange={(value) => {
                if (value === null) return;
                onChange((current) => ({
                  ...current,
                  transform: {
                    ...current.transform,
                    crop: normalizeCrop({
                      ...current.transform.crop,
                      [key]: value,
                      aspectRatio: undefined,
                    }),
                  },
                }));
              }}
            />
          ))}
        </div>
      </ControlSection>

      <ControlSection title={t('transform.rotateTitle')}>
        <div className="grid grid-cols-2 gap-2">
          <IconButton
            icon={<RotateCcw className="h-4 w-4" />}
            label={t('transform.rotateLeft')}
            onClick={() => onChange((current) => ({
              ...current,
              transform: {
                ...current.transform,
                rotation: ((current.transform.rotation + 270) % 360) as 0 | 90 | 180 | 270,
              },
            }))}
          />
          <IconButton
            icon={<RotateCw className="h-4 w-4" />}
            label={t('transform.rotateRight')}
            onClick={() => onChange((current) => ({
              ...current,
              transform: {
                ...current.transform,
                rotation: ((current.transform.rotation + 90) % 360) as 0 | 90 | 180 | 270,
              },
            }))}
          />
          <IconButton
            icon={<FlipHorizontal2 className="h-4 w-4" />}
            label={t('transform.flipHorizontal')}
            active={settings.transform.flipX}
            onClick={() => onChange((current) => ({
              ...current,
              transform: { ...current.transform, flipX: !current.transform.flipX },
            }))}
          />
          <IconButton
            icon={<FlipVertical2 className="h-4 w-4" />}
            label={t('transform.flipVertical')}
            active={settings.transform.flipY}
            onClick={() => onChange((current) => ({
              ...current,
              transform: { ...current.transform, flipY: !current.transform.flipY },
            }))}
          />
        </div>
      </ControlSection>
    </div>
  );
}

function AdjustPanel({
  settings,
  onChange,
}: {
  settings: ProjectSettings;
  onChange: (updater: (current: ProjectSettings) => ProjectSettings) => void;
}) {
  const { t } = useLanguage();
  const adjustmentControls = [
    ['brightness', t('adjust.brightness'), 0, 200, '%'],
    ['contrast', t('adjust.contrast'), 0, 200, '%'],
    ['saturation', t('adjust.saturation'), 0, 200, '%'],
    ['grayscale', t('adjust.grayscale'), 0, 100, '%'],
    ['blur', t('adjust.blur'), 0, 20, 'px'],
  ] as const;

  return (
    <ControlSection title={t('adjust.title')}>
      {adjustmentControls.map(([key, label, min, max, unit]) => (
        <RangeInput
          key={key}
          label={label}
          value={settings.adjustments[key]}
          min={min}
          max={max}
          unit={unit}
          onChange={(value) => onChange((current) => ({
            ...current,
            adjustments: { ...current.adjustments, [key]: value },
          }))}
        />
      ))}
      <SmallButton
        onClick={() => onChange((current) => ({
          ...current,
          adjustments: cloneDefaultSettings().adjustments,
        }))}
      >
        {t('adjust.reset')}
      </SmallButton>
    </ControlSection>
  );
}

function BackgroundPanel({
  selectedImage,
  images,
  onProcessSelected,
  onProcessAll,
  onRestore,
}: {
  selectedImage?: WorkspaceImage;
  images: WorkspaceImage[];
  onProcessSelected: () => void;
  onProcessAll: () => void;
  onRestore: () => void;
}) {
  const { t } = useLanguage();
  const anyRemoving = images.some((image) => image.backgroundRemoving);
  return (
    <ControlSection title={t('background.title')}>
      <p className="rounded-xl border border-indigo-400/15 bg-indigo-400/[0.06] p-3 text-xs leading-5 text-slate-400">
        {t('background.description')}
      </p>
      {selectedImage?.backgroundError && (
        <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-xs text-rose-200">
          {selectedImage.backgroundError}
        </p>
      )}
      {selectedImage?.backgroundBlob ? (
        <button
          type="button"
          onClick={onRestore}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-200 transition hover:bg-amber-400/15"
        >
          <Undo2 className="h-4 w-4" />
          {t('background.undo')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onProcessSelected}
          disabled={!selectedImage || selectedImage.backgroundRemoving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
        >
          {selectedImage?.backgroundRemoving
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Eraser className="h-4 w-4" />}
          {selectedImage?.backgroundRemoving ? t('background.removing') : t('background.selected')}
        </button>
      )}
      <button
        type="button"
        onClick={onProcessAll}
        disabled={!images.length || anyRemoving}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-40"
      >
        {anyRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eraser className="h-4 w-4" />}
        {t('background.all')}
      </button>
    </ControlSection>
  );
}

function WatermarkPanel({
  settings,
  watermarkName,
  watermarkUrl,
  onFile,
  onChange,
}: {
  settings: ProjectSettings;
  watermarkName: string;
  watermarkUrl: string;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange: (updater: (current: ProjectSettings) => ProjectSettings) => void;
}) {
  const { t } = useLanguage();
  const watermark = settings.watermark;
  const updateWatermark = (next: Partial<typeof watermark>) => onChange((current) => ({
    ...current,
    watermark: { ...current.watermark, ...next },
  }));
  const positions: Array<[LayoutPreset, string]> = [
    ['top-left', '↖'],
    ['top-center', '↑'],
    ['top-right', '↗'],
    ['center-left', '←'],
    ['center', '•'],
    ['center-right', '→'],
    ['bottom-left', '↙'],
    ['bottom-center', '↓'],
    ['bottom-right', '↘'],
  ];

  return (
    <div className="space-y-5">
      <Checkbox
        label={t('watermark.enable')}
        checked={settings.watermarkEnabled}
        onChange={(checked) => onChange((current) => ({ ...current, watermarkEnabled: checked }))}
      />
      <div className={settings.watermarkEnabled ? 'space-y-5' : 'pointer-events-none space-y-5 opacity-40'}>
        <ControlSection title={t('watermark.mode')}>
          <div className="grid grid-cols-3 gap-2">
            {([
              ['text', t('watermark.text')],
              ['image', t('watermark.image')],
              ['hybrid', t('watermark.hybrid')],
            ] as Array<[WatermarkMode, string]>).map(([mode, label]) => (
              <SmallButton
                key={mode}
                active={watermark.mode === mode}
                onClick={() => updateWatermark({ mode })}
              >
                {label}
              </SmallButton>
            ))}
          </div>
        </ControlSection>

        {(watermark.mode === 'text' || watermark.mode === 'hybrid') && (
          <ControlSection title={t('watermark.textLabel')}>
            <input
              type="text"
              value={watermark.text}
              onChange={(event) => updateWatermark({ text: event.target.value })}
              className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-slate-600"
            />
            <div className="grid grid-cols-[1fr_70px] gap-3">
              <RangeInput
                label={t('watermark.size')}
                value={watermark.fontSize}
                min={12}
                max={160}
                onChange={(value) => updateWatermark({ fontSize: value })}
              />
              <label className="text-[11px] text-slate-500">
                {t('watermark.textColor')}
                <input
                  type="color"
                  value={watermark.textColor}
                  onChange={(event) => updateWatermark({ textColor: event.target.value })}
                  className="mt-2 h-9 w-full cursor-pointer rounded border border-white/10 bg-black/20 p-1"
                />
              </label>
            </div>
          </ControlSection>
        )}

        {(watermark.mode === 'image' || watermark.mode === 'hybrid') && (
          <ControlSection title={t('watermark.upload')}>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-white/15 bg-white/[0.025] p-3 transition hover:border-indigo-400/30">
              {watermarkUrl ? (
                <img src={watermarkUrl} alt="" className="h-10 w-10 rounded object-contain bg-checkered" />
              ) : (
                <Upload className="h-5 w-5 text-slate-500" />
              )}
              <span className="min-w-0 text-xs text-slate-400">
                <span className="block font-medium text-slate-200">{t('watermark.upload')}</span>
                <span className="block truncate">{watermarkName || 'PNG · JPG · WebP · SVG'}</span>
              </span>
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml"
                className="sr-only"
                onChange={onFile}
              />
            </label>
            {!watermarkName && (
              <p className="text-[10px] text-amber-300">{t('watermark.logoRequired')}</p>
            )}
          </ControlSection>
        )}

        <ControlSection title={t('watermark.position')}>
          <div className="grid grid-cols-3 gap-1.5">
            {positions.map(([preset, symbol]) => (
              <button
                type="button"
                key={preset}
                aria-label={preset}
                onClick={() => updateWatermark({
                  layoutPreset: preset,
                  ...applyLayoutPreset(preset),
                })}
                className={`rounded-lg border py-2 text-sm transition ${
                  watermark.layoutPreset === preset
                    ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
                    : 'border-white/10 text-slate-500 hover:border-white/20'
                }`}
              >
                {symbol}
              </button>
            ))}
          </div>
          <RangeInput
            label={t('watermark.size')}
            value={watermark.widthPercent}
            min={2}
            max={80}
            unit="%"
            onChange={(value) => updateWatermark({ widthPercent: value })}
          />
          <RangeInput
            label={t('watermark.opacity')}
            value={Math.round(watermark.opacity * 100)}
            min={5}
            max={100}
            unit="%"
            onChange={(value) => updateWatermark({ opacity: value / 100 })}
          />
          <RangeInput
            label={t('watermark.rotation')}
            value={watermark.rotation}
            min={-180}
            max={180}
            unit="°"
            onChange={(value) => updateWatermark({ rotation: value })}
          />
          <Checkbox
            label={t('watermark.repeat')}
            checked={watermark.repeat}
            onChange={(checked) => updateWatermark({ repeat: checked })}
          />
        </ControlSection>
      </div>
    </div>
  );
}

function ExportPanel({
  settings,
  disabled,
  exporting,
  onChange,
  onExportSelected,
  onExportAll,
}: {
  settings: ProjectSettings;
  disabled: boolean;
  exporting: boolean;
  onChange: (updater: (current: ProjectSettings) => ProjectSettings) => void;
  onExportSelected: () => void;
  onExportAll: () => void;
}) {
  const { t } = useLanguage();
  const updateOutput = (next: Partial<ProjectSettings['output']>) => onChange((current) => ({
    ...current,
    output: { ...current.output, ...next },
  }));

  return (
    <ControlSection title={t('export.title')}>
      <label className="block text-[11px] text-slate-500">
        {t('export.format')}
        <select
          value={settings.output.mimeType}
          onChange={(event) => updateOutput({ mimeType: event.target.value as ExportMime })}
          className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#080c13] px-3 py-2 text-sm text-white"
        >
          <option value="image/png">PNG</option>
          <option value="image/jpeg">JPEG</option>
          <option value="image/webp">WebP</option>
        </select>
      </label>
      {settings.output.mimeType !== 'image/png' && (
        <RangeInput
          label={t('export.quality')}
          value={Math.round(settings.output.quality * 100)}
          min={30}
          max={100}
          unit="%"
          onChange={(value) => updateOutput({ quality: value / 100 })}
        />
      )}
      {settings.output.mimeType === 'image/jpeg' && (
        <label className="flex items-center justify-between text-[11px] text-slate-500">
          {t('export.background')}
          <input
            type="color"
            value={settings.output.backgroundColor}
            onChange={(event) => updateOutput({ backgroundColor: event.target.value })}
            className="h-9 w-20 cursor-pointer rounded border border-white/10 bg-black/20 p-1"
          />
        </label>
      )}
      <p className="rounded-lg border border-white/10 bg-white/[0.025] p-3 text-[11px] leading-5 text-slate-500">
        {t('export.note')}
      </p>
      <button
        type="button"
        onClick={onExportSelected}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:opacity-40"
      >
        {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
        {exporting ? t('export.preparing') : t('export.selected')}
      </button>
      <button
        type="button"
        onClick={onExportAll}
        disabled={disabled}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/5 disabled:opacity-40"
      >
        <Download className="h-4 w-4" />
        {t('export.all')}
      </button>
    </ControlSection>
  );
}

function ControlSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-300">{title}</h3>
      {children}
    </section>
  );
}

function NumberInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: number | null;
  placeholder?: string;
  onChange: (value: number | null) => void;
}) {
  return (
    <label className="block text-[11px] text-slate-500">
      {label}
      <input
        type="number"
        min={1}
        max={16000}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm tabular-nums text-white placeholder:text-slate-700"
      />
    </label>
  );
}

function RangeInput({
  label,
  value,
  min,
  max,
  unit = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[11px] text-slate-500">
        <span>{label}</span>
        <span className="tabular-nums text-slate-300">{value}{unit}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-indigo-400"
      />
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-black/20 accent-indigo-500"
      />
      {label}
    </label>
  );
}

function SmallButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-2 py-2 text-[11px] font-medium transition ${
        active
          ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
          : 'border-white/10 bg-white/[0.025] text-slate-400 hover:border-white/20 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function IconButton({
  icon,
  label,
  onClick,
  active,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-lg border px-2 py-2.5 text-[11px] transition ${
        active
          ? 'border-indigo-400/40 bg-indigo-500/15 text-indigo-200'
          : 'border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export async function clearSavedProject() {
  await deleteLocalProject();
}
