import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage = ({ title = "Página en Construcción", description = "Esta funcionalidad estará disponible muy pronto." }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="w-24 h-24 bg-violet-50 rounded-full flex items-center justify-center mb-6 border border-violet-100 animate-pulse">
          <Construction className="w-10 h-10 text-violet-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">¡Estamos trabajando en ello!</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg leading-relaxed">{description}</p>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;