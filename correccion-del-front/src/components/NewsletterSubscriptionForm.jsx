import React, { useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Mail, Check, Loader2 } from 'lucide-react';

export const NewsletterSubscriptionForm = ({ storeId, buttonStyle, inputStyle, className, buttonText = 'Suscribirme', successMessage = '¡Gracias por suscribirte!' }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) return;
        setLoading(true);
        setError(null);

        try {
            const cleanEmail = email.trim().toLowerCase();
            
            if (storeId) {
                const { error: insertError } = await supabase
                    .from('store_customers')
                    .insert({
                        store_id: storeId,
                        email: cleanEmail,
                        name: 'Suscriptor Newsletter',
                        status: 'subscriber'
                    });

                if (insertError && insertError.code !== '23505') {
                    console.warn('Newsletter insert warning:', insertError);
                }
            }

            setSuccess(true);
            setEmail('');
            setTimeout(() => setSuccess(false), 5000);
        } catch (err) {
            console.error('Newsletter submission error:', err);
            setError('No se pudo procesar la suscripción.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit} className={className || "flex flex-col sm:flex-row gap-2 max-w-md w-full"}>
                <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Tu correo electrónico..."
                    className={inputStyle || "flex-1 px-4 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"}
                    disabled={loading || success}
                />
                <button
                    type="submit"
                    disabled={loading || success}
                    className={buttonStyle || "px-5 py-2.5 bg-slate-900 text-white font-medium rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shrink-0"}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : success ? (
                        <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span>¡Suscrito!</span>
                        </>
                    ) : (
                        <>
                            <Mail className="w-4 h-4" />
                            <span>{buttonText}</span>
                        </>
                    )}
                </button>
            </form>
            {success && (
                <p className="text-xs text-green-600 font-medium mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {successMessage}
                </p>
            )}
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

export default NewsletterSubscriptionForm;
