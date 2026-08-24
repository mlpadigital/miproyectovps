import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Sparkles, Copy, Check, Wand2, RefreshCw, ShoppingBag, Share2, MessageSquare } from 'lucide-react';
import { getGroqCompletion } from '@/services/groqService.js';

export default function AiGeneratorPage() {
    const [promptType, setPromptType] = useState('product_desc');
    const [productName, setProductName] = useState('');
    const [keyDetails, setKeyDetails] = useState('');
    const [tone, setTone] = useState('persuasivo y entusiasta');
    const [generatedResult, setGeneratedResult] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!productName.trim() || loading) return;

        setLoading(true);
        setGeneratedResult('');

        let prompt = '';
        if (promptType === 'product_desc') {
            prompt = `Escribe una descripción de producto atractiva y vendedora para un e-commerce.
Nombre del Producto: ${productName}
Detalles/Características clave: ${keyDetails}
Tono de comunicación: ${tone}
Formato: Título enganchador, párrafo persuasivo, 3-5 viñetas con beneficios clave y llamado a la acción.`;
        } else if (promptType === 'social_post') {
            prompt = `Escribe un post para redes sociales (Instagram/TikTok/Facebook) para vender este producto.
Producto: ${productName}
Detalles/Oferta: ${keyDetails}
Tono: ${tone}
Formato: Gancho inicial (hook), cuerpo con emojis, llamado a la acción y 5 hashtags.`;
        } else if (promptType === 'wholesale_offer') {
            prompt = `Redacta una propuesta de venta por mayor para clientes o revendedores.
Producto/Categoría: ${productName}
Condiciones u oferta: ${keyDetails}
Tono: ${tone}
Formato: Asunto, mensaje comercial directo, lista de beneficios mayoristas y condiciones de pedido.`;
        }

        try {
            const result = await getGroqCompletion([{ role: 'user', content: prompt }]);
            setGeneratedResult(result);
        } catch (error) {
            setGeneratedResult('⚠️ Ocurrió un error al generar el contenido. Verifica la clave VITE_GROQ_API_KEY.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!generatedResult) return;
        navigator.clipboard.writeText(generatedResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Helmet>
                <title>Generador IA - MlpaDigital</title>
            </Helmet>

            {/* Header */}
            <div className="border-b border-slate-800 pb-5">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                    Generador de Contenido IA
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Crea textos persuasivos para tus productos, redes sociales y propuestas comerciales en segundos.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Formulario */}
                <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                            ¿Qué querés generar hoy?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => setPromptType('product_desc')}
                                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${promptType === 'product_desc'
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>Producto</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPromptType('social_post')}
                                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${promptType === 'social_post'
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                <Share2 className="w-4 h-4" />
                                <span>Redes</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setPromptType('wholesale_offer')}
                                className={`p-3 rounded-xl border text-xs font-medium flex flex-col items-center gap-1.5 transition-all ${promptType === 'wholesale_offer'
                                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                                    }`}
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Mayorista</span>
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleGenerate} className="space-y-4 pt-2">
                        <div>
                            <label className="block text-xs text-slate-300 mb-1 font-medium">
                                Nombre del Producto / Oferta *
                            </label>
                            <input
                                type="text"
                                required
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Ej: Zapatillas Urbanas Pro..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-300 mb-1 font-medium">
                                Detalles clave / Beneficios
                            </label>
                            <textarea
                                rows={3}
                                value={keyDetails}
                                onChange={(e) => setKeyDetails(e.target.value)}
                                placeholder="Ej: Cuero sintético, ultra livianas, envío gratis..."
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-slate-300 mb-1 font-medium">Tono del texto</label>
                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                            >
                                <option value="persuasivo y entusiasta">Persuasivo y Entusiasta</option>
                                <option value="profesional y comercial">Profesional y Comercial</option>
                                <option value="divertido y juvenil">Divertido y Juvenil</option>
                                <option value="urgencia y oferta limitada">Urgencia / Oferta Limitada</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !productName.trim()}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Generando con Groq...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4" />
                                    Generar Texto
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Panel de Resultado */}
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                            <h3 className="text-sm font-semibold text-slate-200">Resultado Generado</h3>
                            {generatedResult && (
                                <button
                                    onClick={handleCopy}
                                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                                </button>
                            )}
                        </div>

                        {generatedResult ? (
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
                                {generatedResult}
                            </div>
                        ) : (
                            <div className="h-64 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-800 rounded-xl text-slate-500">
                                <Sparkles className="w-8 h-8 text-slate-600 mb-2" />
                                <p className="text-sm font-medium">Completa el formulario y presiona "Generar Texto"</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}