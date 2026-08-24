import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { askGroq } from '@/services/groqService.js';

export default function AIAssistantWidget({ storeContext }) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `¡Hola! Soy tu asistente de ${storeContext?.storeName || 'tu tienda'}. ¿En qué te puedo ayudar hoy?`,
        },
    ]);
    const [loading, setLoading] = useState(false);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const systemPrompt = `Eres el asistente virtual experto de la tienda e-commerce "${storeContext?.storeName || 'Mi Tienda'}". Sé conciso, amable y ayuda al comerciante con sugerencias de ventas, stock o atención al cliente.`;
            const response = await askGroq(userMessage.content, systemPrompt);

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: response },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Ocurrió un error al procesar tu solicitud. Intenta de nuevo.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Botón Flotante */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-all transform hover:scale-105 font-medium text-sm"
                >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>Asistente IA</span>
                </button>
            )}

            {/* Ventana de Chat */}
            {isOpen && (
                <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden transition-all">
                    {/* Header */}
                    <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-500 rounded-lg">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">Asistente Virtual</h3>
                                <p className="text-xs text-indigo-200 truncate max-w-[180px]">
                                    {storeContext?.storeName || 'Mi Tienda'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-indigo-200 hover:text-white p-1 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Lista de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-none'
                                            : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-900 text-slate-400 border border-slate-800 px-3 py-2 rounded-2xl text-xs flex items-center gap-1.5">
                                    <span className="animate-pulse">Pensando respuesta...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Formulario */}
                    <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Escribe tu consulta..."
                            className="flex-1 text-sm bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                        <Button type="submit" size="icon" disabled={loading || !input.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            )}
        </div>
    );
}