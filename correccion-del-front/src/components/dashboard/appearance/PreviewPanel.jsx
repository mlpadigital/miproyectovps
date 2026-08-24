import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import DynamicStore from '@/components/DynamicStore';

const PreviewPanel = ({ config, store }) => {
  const [view, setView] = useState('desktop'); // mobile, tablet, desktop

  return (
    <div className="flex flex-col h-full bg-slate-100 border-l border-slate-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white">
        <h3 className="font-semibold text-slate-900">Vista Previa</h3>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('mobile')}
            className={cn("p-2 rounded-md transition-all", view === 'mobile' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-900")}
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('tablet')}
            className={cn("p-2 rounded-md transition-all", view === 'tablet' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-900")}
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setView('desktop')}
            className={cn("p-2 rounded-md transition-all", view === 'desktop' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-900")}
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex items-start justify-center bg-slate-200/50">
        <div 
          className={cn(
            "bg-white shadow-2xl transition-all duration-300 ease-in-out border border-slate-200 overflow-y-auto overflow-x-hidden flex flex-col relative",
            view === 'mobile' ? 'w-[375px] h-[812px] rounded-[2.5rem]' : 
            view === 'tablet' ? 'w-[768px] h-[1024px] rounded-[2rem]' : 
            'w-full h-full rounded-xl'
          )}
          style={{ transform: 'translateZ(0)' }}
        >
           {store?.id ? (
               <DynamicStore 
                   previewStoreId={store.id} 
                   previewConfig={config} 
                   isPreview={true} 
               />
           ) : (
               <div className="flex items-center justify-center w-full h-full text-slate-400">
                   Cargando vista previa...
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
