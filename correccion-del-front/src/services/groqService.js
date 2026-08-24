// src/services/groqService.js

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

/**
 * Petición genérica enviando una lista de mensajes [{role: 'user', content: '...'}]
 */
export async function getGroqCompletion(messages, options = {}) {
    if (!GROQ_API_KEY) {
        console.warn('VITE_GROQ_API_KEY no está configurada en las variables de entorno.');
        throw new Error('MISSING_API_KEY');
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: options.model || 'llama-3.3-70b-versatile',
                messages: messages,
                temperature: options.temperature ?? 0.7,
                max_tokens: options.max_tokens ?? 800,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error en getGroqCompletion:', error);
        throw error;
    }
}

/**
 * Petición simplificada pasándole un prompt y un contexto opcional
 */
export async function askGroq(prompt, systemContext = '') {
    const messages = [];
    if (systemContext) {
        messages.push({ role: 'system', content: systemContext });
    }
    messages.push({ role: 'user', content: prompt });

    try {
        return await getGroqCompletion(messages);
    } catch (error) {
        return 'Ocurrió un error al procesar tu solicitud con la IA.';
    }
}