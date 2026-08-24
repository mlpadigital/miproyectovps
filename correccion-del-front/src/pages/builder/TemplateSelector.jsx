import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft } from 'lucide-react';
const TemplateSelector = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/templates/catalog.json?t=' + new Date().getTime())
      .then(res => res.json())
      .then(data => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading templates", err);
        // Fallback for demo
        setTemplates([
            { id: 'default', name: 'Default', category: 'General', isNew: false, thumbnail: 'https://placehold.co/600x400/1e293b/ffffff?text=Default' }
        ]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Cargando diseños...</div>;
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <Helmet><title>Elegí el diseño | MLPA Digital</title></Helmet>
      
      <div className="max-w-6xl mx-auto mb-8 flex items-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel
        </button>
      </div>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-slate-900">Elegí el diseño de tu tienda</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
        {templates.map((t) => (
          <div 
            key={t.id} 
            className="group cursor-pointer flex flex-col"
            onClick={() => navigate(`/dashboard/theme-editor?theme=${t.id}`)}
          >
            <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 bg-slate-100 aspect-[16/10]">
              <div className="absolute inset-0 bg-white">
                <img 
                  src={t.thumbnail || 'https://placehold.co/600x400/1e293b/ffffff?text=Template'}
                  alt={t.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-white text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Personalizar
                  </div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-3 px-1">
              <h3 className="text-xl font-bold text-slate-900">{t.name}</h3>
              <span className="px-3 py-1 rounded-full border border-indigo-200 text-indigo-700 text-xs font-medium bg-indigo-50">
                {t.category}
              </span>
              {t.isNew && (
                <span className="px-3 py-1 rounded-full bg-indigo-700 text-white text-xs font-bold shadow-sm">
                  ¡Nuevo diseño!
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;