import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Reorder } from 'framer-motion';
import { Loader2, Smartphone, Monitor, Save, ArrowLeft, Undo, Redo, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet';

// New Modular Components
import SectionRenderer from '@/components/builder/SectionRenderer';
import EditorPanel from '@/components/builder/EditorPanel';
import useBuilderHistory from '@/hooks/useBuilderHistory';

// --- Default Initial Data for New Stores ---
const INITIAL_SECTIONS = [
  {
    id: 'hero-default',
    type: 'hero',
    content: {
      title: 'Bienvenido a mi Tienda',
      titleStyle: { fontSize: 48, bold: true, color: '#000000' },
      subtitle: 'La mejor selección de productos para ti.',
      subtitleStyle: { fontSize: 18, color: '#475569' },
      buttonText: 'Ver Colección',
      buttonColor: '#0f172a',
      buttonTextColor: '#ffffff',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=1200'
    },
    style: { backgroundColor: '#ffffff', paddingY: 80, align: 'center', fontFamily: 'Inter, sans-serif' }
  },
  {
    id: 'features-default',
    type: 'features',
    content: {
      title: '¿Por qué elegirnos?',
      titleStyle: { fontSize: 32, bold: true }
    },
    style: { backgroundColor: '#f8fafc', paddingY: 60, fontFamily: 'Inter, sans-serif' }
  },
  {
    id: 'footer-default',
    type: 'footer',
    content: {
      storeName: 'Mi Marca',
      description: 'Enviamos a todo el mundo con amor.'
    },
    style: { backgroundColor: '#0f172a', paddingY: 40, color: '#ffffff', fontFamily: 'Inter, sans-serif' }
  }
];

const StoreBuilder = () => {
  const { user, loading: authLoading } = useSupabaseAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // History & State Management
  const { state: sectionsState, pushState, undo, redo, canUndo, canRedo } = useBuilderHistory(INITIAL_SECTIONS);
  
  // Ensure sections is always an array to prevent crashes
  const sections = Array.isArray(sectionsState) ? sectionsState : [];
  
  // UI State
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState(null);

  // Load Store Data
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchStoreData = async () => {
      try {
        const { data: store, error } = await supabase
          .from('stores')
          .select('id, design_config')
          .eq('owner_id', user.id)
          .limit(1).single();

        if (error && error.code !== 'PGRST116') throw error;

        if (store) {
          setStoreId(store.id);
          // Check if user has new builder format or legacy
          if (store.design_config?.sections && Array.isArray(store.design_config.sections)) {
             pushState(store.design_config.sections);
          } 
        }
      } catch (error) {
        console.error('Error fetching store:', error);
        toast({ variant: "destructive", title: "Error", description: "No se pudo cargar la configuración." });
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  // --- Handlers ---

  const handleAddSection = (type) => {
    const newSection = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContentForType(type),
      style: { backgroundColor: '#ffffff', paddingY: 60, align: 'left', fontFamily: 'Inter, sans-serif' }
    };
    
    // Add to end but before footer if footer exists
    const newSections = [...sections];
    const footerIndex = newSections.findIndex(s => s.type === 'footer');
    
    if (footerIndex !== -1) {
      newSections.splice(footerIndex, 0, newSection);
    } else {
      newSections.push(newSection);
    }

    pushState(newSections);
    setSelectedSectionId(newSection.id);
  };

  const handleUpdateSection = (updatedSection) => {
    const newSections = sections.map(s => s.id === updatedSection.id ? updatedSection : s);
    pushState(newSections);
  };

  const handleDeleteSection = () => {
    if (!selectedSectionId) return;
    const newSections = sections.filter(s => s.id !== selectedSectionId);
    pushState(newSections);
    setSelectedSectionId(null);
  };

  const handleReorder = (newOrder) => {
    // Ensure we are comparing valid arrays
    if (JSON.stringify(newOrder) !== JSON.stringify(sections)) {
        pushState(newOrder);
    }
  };

  const handleMoveSection = (direction) => {
    if (!selectedSectionId) return;
    const idx = sections.findIndex(s => s.id === selectedSectionId);
    if (idx === -1) return;

    const newSections = [...sections];
    if (direction === 'up' && idx > 0) {
      [newSections[idx], newSections[idx - 1]] = [newSections[idx - 1], newSections[idx]];
    } else if (direction === 'down' && idx < sections.length - 1) {
      [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
    }
    pushState(newSections);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stores')
        .update({ 
          design_config: { sections }, // Save in new format
          updated_at: new Date()
        })
        .eq('id', storeId);

      if (error) throw error;

      toast({ title: "Tienda Guardada", description: "Tus cambios están en vivo." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setSaving(false);
    }
  };

  // --- Helpers ---

  const getDefaultContentForType = (type) => {
    switch (type) {
      case 'hero': return { title: 'Nuevo Banner Principal', titleStyle: { fontSize: 40, bold: true }, subtitle: 'Subtítulo aquí' };
      case 'products': return { title: 'Productos Destacados', titleStyle: { fontSize: 30, bold: true }, description: 'Mira nuestra colección' };
      case 'features': return { title: 'Nuestras Características', titleStyle: { fontSize: 30, bold: true } };
      case 'testimonials': return { };
      case 'cta': return { title: '¡Actúa Ahora!', titleStyle: { fontSize: 36, bold: true }, buttonText: 'Empezar', buttonColor: '#000', buttonTextColor: '#fff' };
      case 'footer': return { storeName: 'Mi Tienda', description: 'Descripción del pie de página' };
      default: return {};
    }
  };

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-slate-700" /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 overflow-hidden">
      <Helmet>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Fira+Code:wght@300;400;600&family=Inter:wght@300;400;600;800&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto+Slab:wght@300;400;700&display=swap" rel="stylesheet" />
      </Helmet>

      {/* --- Top Bar --- */}
      <header className="h-14 bg-white border-b flex items-center justify-between px-4 shrink-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} title="Salir" className="text-slate-700">
            <ArrowLeft className="w-4 h-4 mr-2 text-gray-700" /> Salir
          </Button>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Deshacer">
              <Undo className="w-4 h-4 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Rehacer">
              <Redo className="w-4 h-4 text-gray-700" />
            </Button>
          </div>
        </div>

        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setViewMode('desktop')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'desktop' ? "bg-white shadow text-slate-900" : "text-slate-500")} title="Vista de Escritorio">
            <Monitor className="w-4 h-4 text-gray-700" />
          </button>
          <button onClick={() => setViewMode('mobile')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'mobile' ? "bg-white shadow text-slate-900" : "text-slate-500")} title="Vista Móvil">
            <Smartphone className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2 text-gray-700" />}
          Guardar
        </Button>
      </header>

      {/* --- Main Workspace --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar (Tools) */}
        <aside className="w-80 bg-white border-r z-40 flex flex-col shadow-lg">
          <EditorPanel 
            selectedSection={selectedSection}
            onUpdateSection={handleUpdateSection}
            onAddSection={handleAddSection}
            onDeleteSection={handleDeleteSection}
            onMoveSection={handleMoveSection}
          />
        </aside>

        {/* Center Canvas (Preview) */}
        <main 
          className="flex-1 bg-slate-200/50 p-8 flex justify-center overflow-y-auto relative"
          onClick={() => setSelectedSectionId(null)} // Deselect when clicking background
        >
          <div className={cn(
            "transition-all duration-500 ease-in-out shadow-2xl bg-white origin-top",
            viewMode === 'mobile' 
              ? "w-[375px] min-h-[800px] rounded-[2rem] border-[8px] border-slate-800" 
              : "w-full max-w-5xl min-h-screen rounded-md border border-slate-200"
          )}>
             {/* Canvas Content */}
             <div className="w-full h-full bg-white rounded-md overflow-hidden">
                <Reorder.Group axis="y" values={sections} onReorder={handleReorder}>
                  {sections.map((section) => (
                    <Reorder.Item key={section.id} value={section}>
                      <SectionRenderer 
                        section={section}
                        isSelected={selectedSectionId === section.id}
                        onClick={() => setSelectedSectionId(section.id)}
                      />
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
                
                {/* Empty State / Add Hint */}
                {sections.length === 0 && (
                  <div className="p-20 text-center text-slate-500 border-2 border-dashed m-8 rounded-lg">
                    <p>Tu tienda está vacía. Añade secciones desde el panel izquierdo.</p>
                  </div>
                )}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StoreBuilder;