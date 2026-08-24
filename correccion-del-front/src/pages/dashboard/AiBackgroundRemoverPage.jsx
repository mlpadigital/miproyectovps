import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Image as ImageIcon, UploadCloud, RefreshCw, Download, Trash2, Scissors, AlertCircle } from 'lucide-react';

export default function AiBackgroundRemoverPage() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [resultImage, setResultImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [error, setError] = useState(null);
    const [enhanceImage, setEnhanceImage] = useState(true);
    const [threshold, setThreshold] = useState(130);
    const [hasResult, setHasResult] = useState(false);
    
    // Eraser states
    const [isEraserMode, setIsEraserMode] = useState(false);
    const [brushSize, setBrushSize] = useState(30);
    const [isDrawing, setIsDrawing] = useState(false);
    
    const fileInputRef = useRef(null);
    const rawPixelDataRef = useRef(null);
    const rawMaskPixelsRef = useRef(null);
    const resultCanvasRef = useRef(null);

    const applyThresholdAndSave = (currentThreshold, origPixels, maskPixels, canvas) => {
        if (!origPixels || !maskPixels || !canvas) return;
        const ctx = canvas.getContext('2d');
        const newPixels = new ImageData(
            new Uint8ClampedArray(origPixels.data),
            origPixels.width,
            origPixels.height
        );
        for (let i = 0; i < newPixels.data.length / 4; ++i) {
            const alpha = maskPixels.data[4 * i];
            newPixels.data[4 * i + 3] = alpha > currentThreshold ? alpha : 0; 
        }
        ctx.putImageData(newPixels, 0, 0);
        setHasResult(true);
    };

    React.useEffect(() => {
        if (resultImage && rawPixelDataRef.current && rawMaskPixelsRef.current && resultCanvasRef.current) {
            applyThresholdAndSave(threshold, rawPixelDataRef.current, rawMaskPixelsRef.current, resultCanvasRef.current);
        }
    }, [threshold]);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { setError('Solo se permiten archivos de imagen.'); return; }
        setError(null); setHasResult(false);
        setSelectedImage(URL.createObjectURL(file));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (!file || !file.type.startsWith('image/')) return;
        setError(null); setHasResult(false);
        setSelectedImage(URL.createObjectURL(file));
    };

    const handleRemoveBackground = async () => {
        if (!selectedImage) return;
        setLoading(true); setError(null);
        setProgress('Cargando modelo de IA (primera vez puede tardar ~1 minuto)...');
        try {
            // Importar AutoModel, AutoProcessor y RawImage directamente
            // Este es el metodo oficial para RMBG-1.4
            const { env, AutoModel, AutoProcessor, RawImage } = await import('@huggingface/transformers');
            env.allowLocalModels = false;

            setProgress('Iniciando descarga del modelo de IA...');
            const progressCallback = (data) => {
                if (data.status === 'downloading' && data.total) {
                    const percent = Math.round((data.loaded / data.total) * 100);
                    setProgress(`Descargando modelo (alta calidad)... ${percent}%`);
                } else if (data.status === 'init') {
                    setProgress('Inicializando motor de IA...');
                }
            };

            const model = await AutoModel.from_pretrained('Xenova/modnet', {
                quantized: false,
                progress_callback: progressCallback
            });

            const processor = await AutoProcessor.from_pretrained('Xenova/modnet', {
                progress_callback: progressCallback
            });

            setProgress('Cargando imagen...');
            const image = await RawImage.fromURL(selectedImage);

            setProgress('Analizando imagen con IA...');
            const { pixel_values } = await processor(image);
            const { output } = await model({ input: pixel_values });

            setProgress('Aplicando transparencia profunda...');
            // Extraer las dimensiones exactas de la máscara generada por el modelo
            const dims = output.dims; // [batch, channels, height, width]
            const maskH = dims[2];
            const maskW = dims[3];
            
            const maskData = output.mul(255).to('uint8').data;
            const maskImageData = new ImageData(new Uint8ClampedArray(maskW * maskH * 4), maskW, maskH);
            for(let i = 0; i < maskData.length; i++){
                maskImageData.data[i*4] = maskData[i];
                maskImageData.data[i*4+1] = maskData[i];
                maskImageData.data[i*4+2] = maskData[i];
                maskImageData.data[i*4+3] = 255;
            }
            
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = maskW; maskCanvas.height = maskH;
            maskCanvas.getContext('2d').putImageData(maskImageData, 0, 0);

            // Escalar segun preferencia
            const scaleMultiplier = enhanceImage ? 2 : 1;
            const targetW = image.width * scaleMultiplier;
            const targetH = image.height * scaleMultiplier;

            // Canvas principal
            const canvas = document.createElement('canvas');
            canvas.width = targetW; canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(image.toCanvas(), 0, 0, targetW, targetH);
            
            // Canvas mascara escalada con antialiasing del navegador (elimina bordes mordidos)
            const scaledMaskCanvas = document.createElement('canvas');
            scaledMaskCanvas.width = targetW; scaledMaskCanvas.height = targetH;
            const smCtx = scaledMaskCanvas.getContext('2d');
            smCtx.imageSmoothingEnabled = true;
            smCtx.imageSmoothingQuality = 'high';
            smCtx.drawImage(maskCanvas, 0, 0, targetW, targetH);

            const pixelData = ctx.getImageData(0, 0, targetW, targetH);
            const maskPixels = smCtx.getImageData(0, 0, targetW, targetH);
            
            rawPixelDataRef.current = pixelData;
            rawMaskPixelsRef.current = maskPixels;
            
            // Note: resultCanvasRef.current is now in the DOM, we just update its dimensions
            if (resultCanvasRef.current) {
                resultCanvasRef.current.width = targetW;
                resultCanvasRef.current.height = targetH;
                applyThresholdAndSave(threshold, pixelData, maskPixels, resultCanvasRef.current);
            }

            setProgress('');
        } catch (err) {
            console.error('Error al quitar el fondo:', err);
            setError('Error: ' + (err.message || 'Ocurrio un problema inesperado.'));
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!hasResult || !resultCanvasRef.current) return;
        const link = document.createElement('a');
        link.href = resultCanvasRef.current.toDataURL('image/png'); 
        link.download = 'imagen_sin_fondo.png';
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const handleReset = () => {
        setSelectedImage(null); setHasResult(false); setError(null); setProgress('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- Eraser Logic ---
    const startErasing = (e) => {
        if (!isEraserMode) return;
        setIsDrawing(true);
        erase(e);
    };

    const stopErasing = () => {
        setIsDrawing(false);
    };

    const erase = (e) => {
        if (!isDrawing || !isEraserMode || !resultCanvasRef.current) return;
        const canvas = resultCanvasRef.current;
        const ctx = canvas.getContext('2d');
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, brushSize, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Helmet><title>Quita Fondos IA | Dashboard</title></Helmet>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Quita Fondos IA</h1>
                    <p className="text-sm text-slate-500">Elimina el fondo de tus imagenes automaticamente. 100% gratuito y privado.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-slate-800">Imagen Original</h2>
                    {!selectedImage ? (
                        <label onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
                            className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 rounded-xl p-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-all">
                            <UploadCloud className="w-10 h-10 text-slate-300" />
                            <div className="text-center">
                                <p className="font-medium text-slate-700">Arrastra tu imagen aqui</p>
                                <p className="text-sm text-slate-400">o haz clic para seleccionar</p>
                                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                        </label>
                    ) : (
                        <div className="space-y-3">
                            <div className="rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center" style={{ minHeight: 260 }}>
                                <img src={selectedImage} alt="Original" className="max-h-64 object-contain" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleRemoveBackground} disabled={loading}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Procesando IA...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Scissors className="w-5 h-5" />
                                            Quitar Fondo Mágicamente
                                        </div>
                                    )}
                                </button>
                                <button onClick={handleReset} className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                                
                                <div className="mt-4 flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <input 
                                        type="checkbox" 
                                        id="enhance"
                                        checked={enhanceImage}
                                        onChange={(e) => setEnhanceImage(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                    />
                                    <label htmlFor="enhance" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                        Mejorar resolución y despixelar (x2)
                                    </label>
                                </div>
                            {progress && (
                                <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                                    <RefreshCw className="w-3 h-3 animate-spin shrink-0" />{progress}
                                </div>
                            )}
                            {error && (
                                <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h2 className="font-semibold text-slate-800">Resultado</h2>
                    
                    <div className={!hasResult ? 'hidden' : 'space-y-3'}>
                        <div className={`rounded-xl overflow-hidden flex items-center justify-center ${isEraserMode ? 'cursor-crosshair' : ''}`}
                            style={{ minHeight: 260, background: 'repeating-conic-gradient(#e2e8f0 0% 25%, white 0% 50%) 0 0 / 20px 20px' }}>
                            <canvas 
                                ref={resultCanvasRef}
                                className="max-h-64 object-contain"
                                onMouseDown={startErasing}
                                onMouseMove={erase}
                                onMouseUp={stopErasing}
                                onMouseLeave={stopErasing}
                            />
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-lg">
                                <button 
                                    onClick={() => setIsEraserMode(false)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${!isEraserMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                                >
                                    Ajuste Mágico
                                </button>
                                <button 
                                    onClick={() => setIsEraserMode(true)}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${isEraserMode ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
                                >
                                    Borrador Manual
                                </button>
                            </div>

                            {!isEraserMode ? (
                                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-700">Fuerza de Recorte</label>
                                        <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">{threshold}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Desliza para ajustar qué tanto del fondo se elimina automáticamente.</p>
                                    <input 
                                        type="range" min="1" max="254" 
                                        value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-semibold text-slate-700">Tamaño del Borrador</label>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => {
                                                    if (rawPixelDataRef.current && rawMaskPixelsRef.current && resultCanvasRef.current) {
                                                        applyThresholdAndSave(threshold, rawPixelDataRef.current, rawMaskPixelsRef.current, resultCanvasRef.current);
                                                    }
                                                }}
                                                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                            >
                                                <RefreshCw className="w-3 h-3" />
                                                Deshacer Borrados
                                            </button>
                                            <span className="text-xs font-medium text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">{brushSize}px</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500">Pasa el mouse sobre la imagen arriba para borrar imperfecciones a mano.</p>
                                    <input 
                                        type="range" min="5" max="100" 
                                        value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                    />
                                </div>
                            )}
                        </div>

                        <button onClick={handleDownload}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-700 transition-all">
                            <Download className="w-4 h-4" /> Descargar PNG
                        </button>
                    </div>
                    
                    {!hasResult && (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 h-64">
                            <ImageIcon className="w-10 h-10 text-slate-200" />
                            <p className="text-sm text-slate-400">El resultado aparecera aqui</p>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700">
                <strong>Privado:</strong> tus imagenes se procesan directamente en tu navegador. Nunca se suben a ningun servidor.
            </div>
        </div>
    );
}
