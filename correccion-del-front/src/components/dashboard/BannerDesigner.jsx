import React from 'react';
import FilerobotImageEditor, { TABS, TOOLS } from 'react-filerobot-image-editor';
import { X } from 'lucide-react';

export default function BannerDesigner({ isOpen, onClose, initialImage, onSave }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl w-full max-w-[90vw] h-[90vh] overflow-hidden flex flex-col shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Custom close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white shadow-md text-slate-700 hover:text-red-500 rounded-full p-2 transition-colors border border-slate-200"
          title="Cerrar Editor"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 relative">
          <style>{`
            .SfxModal-Wrapper, .SfxPopper-wrapper, [class*="Sfx"] {
              z-index: 100000 !important;
            }
          `}</style>
          <FilerobotImageEditor
            key={initialImage || 'default'}
            source={initialImage || 'https://scaleflex.airstore.io/demo/stephen-walker-unsplash.jpg'}
            defaultSavedImageType="png"
            onSave={(editedImageObject, designState) => {
              onSave(editedImageObject.imageBase64);
              onClose();
            }}
            onClose={onClose}
            annotationsCommon={{
              fill: '#ffffff',
            }}
            Text={{ text: 'Tu texto aquí...' }}
            tabsIds={[TABS.ADJUST, TABS.ANNOTATE, TABS.WATERMARK, TABS.FILTERS, TABS.FINETUNE]}
            defaultTabId={TABS.ANNOTATE}
            defaultToolId={TOOLS.TEXT}
            theme={{
              typography: {
                fontFamily: 'Inter, sans-serif',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
