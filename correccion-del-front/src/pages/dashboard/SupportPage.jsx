import React, { useState, useEffect } from 'react';
import { HelpCircle, Play, Phone, Video, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const SupportPage = () => {
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState([]);
    const [videos, setVideos] = useState([]);

    useEffect(() => {
        fetchSupportSettings();
    }, []);

    const fetchSupportSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://mlpadigital.com/api/support-settings');
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.json();
                setContacts(data.whatsapp_contacts || []);
                setVideos(data.tutorial_videos || []);
                localStorage.setItem('mlpa_support_settings', JSON.stringify(data));
            } else {
                const cached = localStorage.getItem('mlpa_support_settings');
                if (cached) {
                    const data = JSON.parse(cached);
                    setContacts(data.whatsapp_contacts || []);
                    setVideos(data.tutorial_videos || []);
                }
            }
        } catch (error) {
            console.warn('Error fetching support settings:', error);
            const cached = localStorage.getItem('mlpa_support_settings');
            if (cached) {
                try {
                    const data = JSON.parse(cached);
                    setContacts(data.whatsapp_contacts || []);
                    setVideos(data.tutorial_videos || []);
                } catch (e) {}
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-black mb-4">Ayuda y Soporte</h1>
                    <p className="text-indigo-100 text-lg sm:text-xl max-w-2xl leading-relaxed">
                        Estamos aquí para ayudarte a crecer tu negocio. Explora nuestros videos tutoriales para dominar la plataforma o contáctanos directamente si necesitas asistencia personalizada.
                    </p>
                </div>
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
                    <HelpCircle className="w-64 h-64" />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left column: Contact options */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Phone className="w-6 h-6 text-emerald-500" />
                        Contacto Directo
                    </h2>
                    
                    {contacts.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed">
                            <CardContent className="pt-6 flex flex-col items-center text-center">
                                <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
                                <p className="text-sm text-slate-500">No hay números de contacto configurados en este momento.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {contacts.map((contact, idx) => (
                                <Card key={idx} className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow group">
                                    <div className="h-1 bg-emerald-500 w-full" />
                                    <CardContent className="p-5 flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                            </svg>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg mb-1">{contact.name}</h3>
                                        <p className="text-slate-500 font-mono text-sm mb-4">{contact.number}</p>
                                        <Button 
                                            onClick={() => window.open(`https://wa.me/${contact.number.replace(/[^0-9]/g, '')}`, '_blank')}
                                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20"
                                        >
                                            Contactar por WhatsApp
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right column: Video library */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                        <Video className="w-6 h-6 text-indigo-500" />
                        Videoteca de Aprendizaje
                    </h2>
                    
                    {videos.length === 0 ? (
                        <Card className="bg-slate-50 border-dashed h-64 flex items-center justify-center">
                            <CardContent className="flex flex-col items-center text-center">
                                <Play className="w-12 h-12 text-slate-300 mb-4" />
                                <p className="text-slate-500 font-medium">Aún no hay videos tutoriales disponibles.</p>
                                <p className="text-sm text-slate-400 mt-1">Pronto agregaremos nuevo material para ayudarte.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-6">
                            {videos.map((video, idx) => {
                                const ytId = getYouTubeId(video.url);
                                return (
                                    <Card key={idx} className="overflow-hidden border-slate-200 hover:shadow-lg transition-shadow group flex flex-col">
                                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                                            {ytId ? (
                                                <iframe 
                                                    credentialless=""
                                                    width="100%" 
                                                    height="100%" 
                                                    src={`https://www.youtube.com/embed/${ytId}`} 
                                                    title={video.title} 
                                                    frameBorder="0" 
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                    allowFullScreen
                                                    className="absolute inset-0"
                                                ></iframe>
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                                    <Play className="w-10 h-10 text-slate-400 opacity-50" />
                                                    <span className="absolute bottom-2 text-xs text-slate-400">Video no disponible</span>
                                                </div>
                                            )}
                                        </div>
                                        <CardContent className="p-4 flex-1 flex items-center">
                                            <h3 className="font-bold text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                                                {video.title}
                                            </h3>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
