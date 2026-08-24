import React from 'react';
import { X, Image as ImageIcon } from 'lucide-react';

const TEMPLATES = [
  {
    id: 't1',
    name: 'Minimalista Blanco',
    url: '/banners/t1.jpg',
    category: 'Minimal'
  },
  {
    id: 't2',
    name: 'Urbano Oscuro',
    url: '/banners/t2.jpg',
    category: 'Dark'
  },
  {
    id: 't3',
    name: 'Oferta Especial',
    url: '/banners/t3.jpg',
    category: 'Ventas'
  },
  {
    id: 't4',
    name: 'Naturaleza Verde',
    url: '/banners/t4.jpg',
    category: 'Naturaleza'
  },
  {
    id: 't5',
    name: 'Tecnología',
    url: '/banners/t5.jpg',
    category: 'Tech'
  },
  {
    id: 't6',
    name: 'Moda / Ropa',
    url: '/banners/t6.jpg',
    category: 'Moda'
  }
];

export default function BannerTemplatesModal({ isOpen, onClose, onSelect }) {
  const [loadingId, setLoadingId] = React.useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Modelos de Banners Gratis</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <p className="text-sm text-slate-500 mb-4">
            Selecciona un modelo base. Al elegirlo, se abrirá el editor para que puedas agregar tu texto o logos encima.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TEMPLATES.map((tpl) => (
              <div 
                key={tpl.id}
                onClick={async () => {
                  if (loadingId) return;
                  setLoadingId(tpl.id);
                  try {
                    const response = await fetch(tpl.url);
                    const blob = await response.blob();
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      onSelect(reader.result);
                      setLoadingId(null);
                      onClose();
                    };
                    reader.readAsDataURL(blob);
                  } catch (e) {
                    console.error('Error fetching local template image:', e);
                    onSelect(window.location.origin + tpl.url);
                    setLoadingId(null);
                    onClose();
                  }
                }}
                className={`group relative rounded-lg border border-slate-200 bg-white overflow-hidden cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all ${loadingId === tpl.id ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="aspect-[12/4.5] w-full bg-slate-100 relative">
                  <img 
                    src={tpl.url} 
                    alt={tpl.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-900/20 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                      {loadingId === tpl.id ? 'Cargando...' : 'Usar este modelo'}
                    </span>
                  </div>
                </div>
                <div className="p-2 text-center border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-700">{tpl.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
