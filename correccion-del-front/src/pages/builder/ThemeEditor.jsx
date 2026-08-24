import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft, Lock, Unlock, Monitor, Smartphone, Save, Globe,
  Image as ImageIcon, Palette, Type, LayoutTemplate,
  Home, CreditCard, ArrowDownToLine, Code, RefreshCw, ChevronRight, HelpCircle, Upload, Loader2, PanelTop,
  Eye, EyeOff, Trash2, Edit2, ArrowUp, ArrowDown, Plus, ShoppingBag, MessageCircle, FileText, Search, Check
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { applyThemeConfigToDocument } from '../../utils/themeInjector';
import BannerDesigner from '../../components/dashboard/BannerDesigner';
import BannerTemplatesModal from '../../components/dashboard/BannerTemplatesModal';
import { getDefaultConfig } from '../../templates/defaultConfigs';

const CATALOG_SECTIONS = [
  // Básicas
  { id: 'banners', type: 'banners', title: 'Banners', desc: 'Sirve para dar a conocer tu marca, promociones y beneficios.', category: 'basic', isImplemented: true },
  { id: 'purchase_info', type: 'purchase_info', title: 'Información de compra', desc: 'Podrás incluir información básica sobre el proceso de compra.', category: 'basic', isImplemented: true },
  { id: 'selected_products', type: 'selected_products', title: 'Productos seleccionados', desc: 'Elegí a mano una cantidad ilimitada de productos específicos para destacar en tu tienda.', category: 'basic', isImplemented: true },
  { id: 'product_group', type: 'product_group', title: 'Grupo de productos', desc: 'Mostrá un grupo de productos en específico. Ej: Ofertas, destacados, novedades...', category: 'basic', isImplemented: true },
  { id: 'announcement_bar', type: 'announcement_bar', title: 'Barra de anuncio', desc: 'Mostrá un mensaje destacado, ideal para anunciar descuentos, envíos gratis o novedades.', category: 'basic', isImplemented: true },
  { id: 'featured_categories', type: 'featured_categories', title: 'Categorías destacadas', desc: 'Mostrá las categorías más importantes de tu negocio a partir de un listado de imágenes.', category: 'basic', isImplemented: true },
  { id: 'product_list', type: 'product_list', title: 'Listado de productos', desc: 'Mostrá un listado de productos ordenados por precio o fecha de creación.', category: 'basic', isImplemented: true },
  { id: 'newsletter', type: 'newsletter', title: 'Newsletter', desc: 'Agregá un formulario de Newsletter, los correos registrados aparecerán en la pestaña de "Clientes".', category: 'basic', isImplemented: true },
  { id: 'blog', type: 'blog', title: 'Blog', desc: 'Mostrá un grupo de blogs en específico.', category: 'basic', isImplemented: true },

  // Avanzadas
  { id: 'text', type: 'text', title: 'Texto', desc: 'Puede servir para mostrar información que creas importante.', category: 'advanced', isImplemented: true },
  { id: 'image_grid', type: 'image_grid', title: 'Grilla de imágenes con links', desc: 'Mostrá un listado de imágenes y agregá un link a cada una.', category: 'advanced', isImplemented: true },
  { id: 'image_gallery', type: 'image_gallery', title: 'Galería de fotos', desc: 'Mostrá varias fotografías con diseño moderno.', category: 'advanced', isImplemented: true },
  { id: 'image_text_button', type: 'image_text_button', title: 'Imagen con texto y botón', desc: 'Destacá un producto o promoción con foto, texto y botón.', category: 'advanced', isImplemented: true },
  { id: 'logos_list', type: 'logos_list', title: 'Lista de logos / Marcas', desc: 'Mostrá las marcas o aliados que trabajan con tu negocio.', category: 'advanced', isImplemented: true },
  { id: 'video_text_button', type: 'video_text_button', title: 'Video con texto y botón', desc: 'Un video para promocionar productos o destacar ofertas especiales.', category: 'advanced', isImplemented: true },
  { id: 'reviews', type: 'reviews', title: 'Reseñas / Testimonios', desc: 'Podrás incluir información sobre las reseñas y testimonios de tus clientes.', category: 'advanced', isImplemented: true },
  { id: 'bg_image_text', type: 'bg_image_text', title: 'Imagen de fondo con texto', desc: 'Puede servir para llevarte a ver algo en específico.', category: 'advanced', isImplemented: true },
  { id: 'image_timer', type: 'image_timer', title: 'Imagen con temporizador', desc: 'Ideal para anunciar el inicio de una oferta o el lanzamiento de un evento especial.', category: 'advanced', isImplemented: true },
  { id: 'html_code', type: 'html_code', title: 'Código HTML', desc: 'Ideal para hacer tus propias secciones customizadas.', category: 'advanced', isImplemented: true },
];

const SidebarSection = ({ icon: Icon, title, isUpdated, isOpen, onClick, children }) => (
  <div className="border-b border-slate-100">
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 px-4 hover:bg-slate-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-600" />
        <span className="font-medium text-slate-700 text-sm">{title}</span>
        {isUpdated && <span className="bg-[#8cc63f] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm">¡Actualizado!</span>}
      </div>
      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-4 pb-4 bg-slate-50 border-t border-slate-200 pt-4 animate-in slide-in-from-top-2">
        {children}
      </div>
    )}
  </div>
);

const ThemeEditor = () => {
  const [searchParams] = useSearchParams();
  const themeId = searchParams.get('theme') || 'default';
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  const [device, setDevice] = useState('desktop'); // 'desktop' or 'mobile'
  const [activePage, setActivePage] = useState('index.html');
  const [store, setStore] = useState(null);

  // States for Banner Designer
  const [isDesigningBanner, setIsDesigningBanner] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [bannerDesignTarget, setBannerDesignTarget] = useState(null); // { sectionIndex, blockIndex }
  const [designerImageUrl, setDesignerImageUrl] = useState(null);

  const [themeConfig, setThemeConfig] = useState({
    primaryColor: '#8cc63f',
    headerColor: '#ffffff',
    buttonColor: '#8cc63f',
    footerColor: '#1e293b',
    backgroundColor: '#ffffff',
    primaryTextColor: '#1e293b',
    secondaryTextColor: '#64748b',
    fontFamily: 'Open Sans',
    secondaryFontFamily: 'Open Sans',
    buttonFontFamily: 'Open Sans',
    logoUrl: '',
    faviconUrl: '',
    headerStyle: 'default',
    stickyHeader: false,
    absoluteHeader: false,
    logoMaxWidth: 140,
    showAnnouncementBar1: false,
    announcementPosition1: 'above', // 'above', 'below'
    announcementType1: 'static', // 'static', 'animated', 'countdown'
    announcementText1: '',
    announcementLink1: '',
    announcementColorMode1: 'primary', // 'background', 'primary', 'secondary', 'custom'
    announcementCustomColor1: '#000000',
    announcementCountdownDate1: '', // ISO date string

    showAnnouncementBar2: false,
    announcementPosition2: 'above',
    announcementType2: 'static',
    announcementText2: '',
    announcementLink2: '',
    announcementColorMode2: 'button',
    announcementCustomColor2: '#000000',

    // Home Page Sections
    pageSections: { 'index.html': [] },
    homeSections: [],
    purchaseInfoConfig: {
      element1: { title: 'Enviamos tu compra', text: 'Llegamos a todo el país', icon: 'shipping' },
      element2: { title: 'Pagá como quieras', text: 'Pagá con tarjeta o efectivo', icon: 'payment' },
      element3: { title: 'Comprá con seguridad', text: 'Tus datos siempre protegidos', icon: 'security' },
      spacing: 'normal',
      colorMode: 'default'
    }
  });
  const [activeSection, setActiveSection] = useState(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [isUploadingFooterImage, setIsUploadingFooterImage] = useState(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const [storeCategories, setStoreCategories] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [productPickerSearch, setProductPickerSearch] = useState('');
  const [productPickerCategory, setProductPickerCategory] = useState('all');

  const toggleSection = (section) => {
    setActiveSection(prev => prev === section ? null : section);
  };

  const updateConfig = (key, value) => {
    setThemeConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateSectionSettings = (sectionId, newSettings) => {
    setThemeConfig(prev => {
      const newSections = ((prev.pageSections && prev.pageSections[activePage]) || []).map(s => {
        if (s.id === sectionId) {
          return { ...s, settings: { ...(s.settings || {}), ...newSettings } };
        }
        return s;
      });
      return { ...prev, pageSections: { ...(prev.pageSections || {}), [activePage]: newSections } };
    });
  };

  // --- Home Page Section Builder Helpers ---
  const moveSection = (index, direction) => {
    const newSections = [...((themeConfig.pageSections && themeConfig.pageSections[activePage]) || [])];
    if (direction === 'up' && index > 0) {
      const temp = newSections[index];
      newSections[index] = newSections[index - 1];
      newSections[index - 1] = temp;
    } else if (direction === 'down' && index < newSections.length - 1) {
      const temp = newSections[index];
      newSections[index] = newSections[index + 1];
      newSections[index + 1] = temp;
    }
    updateConfig('pageSections', { ...(themeConfig.pageSections || {}), [activePage]: newSections });
  };

  const toggleSectionVisibility = (index) => {
    const newSections = [...((themeConfig.pageSections && themeConfig.pageSections[activePage]) || [])];
    newSections[index].visible = !newSections[index].visible;
    updateConfig('pageSections', { ...(themeConfig.pageSections || {}), [activePage]: newSections });
  };

  const removeSection = (index) => {
    const newSections = [...((themeConfig.pageSections && themeConfig.pageSections[activePage]) || [])];
    newSections.splice(index, 1);
    updateConfig('pageSections', { ...(themeConfig.pageSections || {}), [activePage]: newSections });
  };

  const addSection = (sectionDef) => {
    const newSections = [...((themeConfig.pageSections && themeConfig.pageSections[activePage]) || [])];
    const initialSettings = {};
    if (sectionDef.type === 'selected_products') {
      initialSettings.title = 'Productos seleccionados';
      initialSettings.selectedProductIds = [];
      initialSettings.enableSearch = false;
    }
    const newId = Math.random().toString(36).substr(2, 9);
    newSections.push({
      id: newId,
      type: sectionDef.type,
      title: sectionDef.title,
      visible: true,
      settings: initialSettings
    });
    updateConfig('pageSections', { ...(themeConfig.pageSections || {}), [activePage]: newSections });
    setIsAddingSection(false);
    setEditingSectionId(newId);
  };
  const applyStylesToIframe = () => {
    if (iframeRef.current && iframeRef.current.contentDocument) {
      applyThemeConfigToDocument(iframeRef.current.contentDocument, themeConfig);
    }
    // Ensure we send the latest config to the React app iframe
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_THEME_CONFIG',
        payload: themeConfig
      }, '*');
    }
  };

  useEffect(() => {
    applyStylesToIframe();
  }, [themeConfig]);

  useEffect(() => {
    const handleIframeMessage = (event) => {
      if (event.data?.type === 'INLINE_TEXT_UPDATE') {
        const { sectionId, content, field = 'content' } = event.data;
        setThemeConfig(prev => {
          const newSections = ((prev.pageSections && prev.pageSections[activePage]) || []).map(s => {
            if (s.id === sectionId) {
              return { ...s, settings: { ...(s.settings || {}), [field]: content } };
            }
            return s;
          });
          return { ...prev, pageSections: { ...(prev.pageSections || {}), [activePage]: newSections } };
        });
      } else if (event.data?.type === 'EDIT_SECTION') {
        setEditingSectionId(event.data.sectionId);
        setActiveSection('pages'); // Asegura que el panel correcto esté abierto
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, [activePage]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        supabase.from('stores').select('*').eq('owner_id', data.session.user.id).single()
          .then(({ data: storeData, error }) => {
            if (error) {
              console.error("Error fetching store in ThemeEditor:", error);
            } else {
              setStore(storeData);
              // Fetch store products & categories for product selector
              supabase.from('products').select('*').eq('store_id', storeData.id).eq('is_active', true).order('created_at', { ascending: false })
                .then(({ data: prods }) => {
                  if (prods) {
                    setStoreProducts(prods);
                    const cats = Array.from(new Set(prods.map(p => p.category).filter(Boolean))).sort();
                    setStoreCategories(cats);
                  }
                });

              if (storeData.theme_id !== themeId) {
                // El usuario seleccionó un nuevo tema para probar
                const defaultConfig = getDefaultConfig(themeId);
                setThemeConfig({
                  ...defaultConfig,
                  logoUrl: storeData.logo_url || '',
                  faviconUrl: storeData.logo_url || ''
                });
              } else if (storeData.theme_config) {
                const loadedConfig = storeData.theme_config;
                loadedConfig.themeId = themeId; // Garantizar que tenga el themeId correcto para previsualización cruzada
                if (!loadedConfig.pageSections || Object.keys(loadedConfig.pageSections).length === 0) {
                  // Si no hay secciones pero es el mismo tema, cargamos defaults también
                  const defaultConfig = getDefaultConfig(themeId);
                  loadedConfig.pageSections = defaultConfig.pageSections;
                } else if (!loadedConfig.pageSections['index.html']) {
                  loadedConfig.pageSections['index.html'] = loadedConfig.homeSections || [];
                }

                setThemeConfig(prev => ({
                  ...prev,
                  ...loadedConfig,
                  logoUrl: storeData.logo_url || '',
                  faviconUrl: storeData.favicon_url || storeData.logo_url || '',
                  tabName: storeData.browser_title || loadedConfig.tabName || ''
                }));
              } else {
                // Fallback final
                const defaultConfig = getDefaultConfig(themeId);
                setThemeConfig({
                  ...defaultConfig,
                  logoUrl: storeData.logo_url || '',
                  faviconUrl: storeData.logo_url || ''
                });
              }
            }
          });
      }
    });
  }, []);

  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Send message to the iframe to live-update CSS variables
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_THEME_CONFIG',
        payload: themeConfig
      }, '*');
    }
  }, [themeConfig]);

  const handlePublish = async () => {
    if (!store) return;
    
    const updates = {
      theme_id: themeId,
      theme_config: themeConfig,
      design_config: {
        ...(store.design_config || {}),
        pageSections: themeConfig.pageSections,
        colors: themeConfig.colors,
        typography: themeConfig.typography
      }
    };
    if (themeConfig.logoUrl) updates.logo_url = themeConfig.logoUrl;
    if (themeConfig.faviconUrl) updates.favicon_url = themeConfig.faviconUrl;
    if (themeConfig.tabName) updates.browser_title = themeConfig.tabName;

    // Actualizamos theme_id y theme_config en Supabase
    const { error } = await supabase.from('stores').update(updates).eq('id', store.id);
    if (error) {
      alert('Error al publicar el tema');
    } else {
      alert('¡Tema publicado con éxito!');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file || !store) return;

    const setUploading = type === 'logo' ? setIsUploadingLogo : (type === 'footerImage' ? setIsUploadingFooterImage : setIsUploadingFavicon);
    const configKey = type === 'logo' ? 'logoUrl' : (type === 'footerImage' ? 'footerImageUrl' : 'faviconUrl');


    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${store.id}-${type}-${Math.random()}.${fileExt}`;
      const filePath = `store-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      if (type === 'footerImage') {
        updateConfig('footer', { ...(themeConfig.footer || {}), footerImageUrl: data.publicUrl });
      } else {
        updateConfig(configKey, data.publicUrl);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Error al subir la imagen del ${type}`);
    } finally {
      setUploading(false);
    }
  };

  const [uploadingSectionItem, setUploadingSectionItem] = useState(null);

  const handleSectionImageUpload = async (file, sectionId, itemIndex, arrayKey = 'items', fieldKey = 'image') => {
    if (!file || !store) return;
    setUploadingSectionItem({ sectionId, itemIndex, arrayKey });
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${store.id}-section-${Math.random()}.${fileExt}`;
      const filePath = `store-assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('store-assets')
        .getPublicUrl(filePath);

      const newSections = [...(themeConfig.pageSections[activePage] || [])];
      const sectionIndex = newSections.findIndex(s => s.id === sectionId);

      if (sectionIndex !== -1) {
        const section = newSections[sectionIndex];
        if (!section.settings) section.settings = {};
        if (!section.settings[arrayKey]) section.settings[arrayKey] = [];

        section.settings[arrayKey][itemIndex] = {
          ...(section.settings[arrayKey][itemIndex] || {}),
          [fieldKey]: data.publicUrl
        };
        updateConfig('pageSections', { ...themeConfig.pageSections, [activePage]: newSections });
      }
    } catch (error) {
      console.error(`Error uploading section image:`, error);
      alert(`Error al subir la imagen`);
    } finally {
      setUploadingSectionItem(null);
    }
  };

  const previewUrl = store ? `/?preview=true&store=${store.id}&page=${activePage}&theme_id=${themeId}` : '';

  const currentEditingSection = (themeConfig.pageSections?.[activePage] || [])?.find(s => s.id === editingSectionId);
  const currentSectionType = currentEditingSection?.type;
  const currentSectionSettings = currentEditingSection?.settings || {};

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden font-sans">
      <Helmet><title>Personalizador de Tema | MLPA Digital</title></Helmet>

      {/* HEADER */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/templates')}
            className="flex items-center gap-2 bg-[#1e293b] hover:bg-[#ea6831] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Ir al inicio
          </button>
          <button
            onClick={() => setIsSidebarPinned(!isSidebarPinned)}
            className={`transition-colors ${isSidebarPinned ? 'text-indigo-600 hover:text-indigo-700' : 'text-slate-400 hover:text-slate-600'}`}
            title={isSidebarPinned ? "Desbloquear menú" : "Bloquear menú"}
          >
            {isSidebarPinned ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 flex justify-center items-center gap-4">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 rounded-md transition-colors ${device === 'desktop' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 rounded-md transition-colors ${device === 'mobile' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-400 hover:bg-slate-100'}`}
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
            Guardar borrador <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handlePublish}
            className="bg-[#8cc63f] hover:bg-[#7ab133] text-white px-6 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            Publicar <Globe className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR */}
        <aside className={`${!isSidebarPinned ? 'w-0 border-r-0 opacity-0' : 'w-80 opacity-100'} bg-white border-r border-slate-200 flex flex-col overflow-y-auto transition-all duration-300 ease-in-out shrink-0`}>
          <div className="p-4 border-b border-slate-200 bg-slate-50 min-w-[320px]">
            <p className="text-xs text-slate-500 mb-2">Las configuraciones marcadas con "En desarrollo" aún no son funcionales, estamos construyendo el soporte para este diseño.</p>
          </div>
          <div className="p-4">
            <h3 className="text-[#311b92] font-bold text-sm mb-2">Imagen de la marca</h3>
            <SidebarSection
              icon={ImageIcon} title="Logo y Favicon de la Tienda"
              isOpen={activeSection === 'logo'} onClick={() => toggleSection('logo')}
            >
              <div className="space-y-4">
                <div className="space-y-4">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Logo de la Tienda</label>
                    {themeConfig.logoUrl && (
                      <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded flex justify-center items-center h-20">
                        <img src={themeConfig.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileUpload(e, 'logo')}
                        disabled={isUploadingLogo}
                      />
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                        {isUploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{isUploadingLogo ? 'Subiendo...' : 'Seleccionar logo desde PC'}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Este logo reemplazará el nombre en texto del encabezado.</p>
                  </div>

                  {/* Store Title & Subtitle */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la Tienda (Texto)</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-black mb-2"
                      placeholder="Ej. Mi Emprendimiento"
                      value={themeConfig.storeTitle || ''}
                      onChange={(e) => updateConfig('storeTitle', e.target.value)}
                    />
                    {themeConfig.storeTitle && (
                      <div className="flex gap-3 mb-3 bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">COLOR TÍTULO</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                              value={themeConfig.storeTitleColor || '#000000'}
                              onChange={(e) => updateConfig('storeTitleColor', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">TAMAÑO: {themeConfig.storeTitleSize || 20}px</label>
                          <input
                            type="range"
                            min="12" max="48"
                            className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer mt-1"
                            value={themeConfig.storeTitleSize || 20}
                            onChange={(e) => updateConfig('storeTitleSize', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Subtítulo o Eslogan</label>
                    <input
                      type="text"
                      className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs text-black"
                      placeholder="Ej. Los mejores productos"
                      value={themeConfig.storeSubtitle || ''}
                      onChange={(e) => updateConfig('storeSubtitle', e.target.value)}
                    />
                    {themeConfig.storeSubtitle && (
                      <div className="flex gap-3 mt-2 mb-1 bg-slate-50 p-2 rounded border border-slate-100">
                        <div className="flex-1">
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">COLOR SUBTÍTULO</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              className="w-6 h-6 rounded cursor-pointer border-0 p-0"
                              value={themeConfig.storeSubtitleColor || '#666666'}
                              onChange={(e) => updateConfig('storeSubtitleColor', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex-[2]">
                          <label className="block text-[9px] font-bold text-slate-500 mb-1">TAMAÑO: {themeConfig.storeSubtitleSize || 14}px</label>
                          <input
                            type="range"
                            min="10" max="32"
                            className="w-full h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer mt-1"
                            value={themeConfig.storeSubtitleSize || 14}
                            onChange={(e) => updateConfig('storeSubtitleSize', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-500 mt-1">Se mostrarán junto al logo o en su lugar si no hay logo.</p>
                  </div>

                  {/* Favicon Upload */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-2">Favicon (Ícono de Pestaña)</label>
                    {themeConfig.faviconUrl && (
                      <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded flex justify-center items-center h-12">
                        <img src={themeConfig.faviconUrl} alt="Favicon" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileUpload(e, 'favicon')}
                        disabled={isUploadingFavicon}
                      />
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                        {isUploadingFavicon ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{isUploadingFavicon ? 'Subiendo...' : 'Seleccionar favicon'}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">El ícono que aparece en la pestaña del navegador (se recomienda 32x32 px).</p>
                  </div>
                  
                  {/* Tab Name */}
                  <div className="pt-4 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la pestaña (Título del sitio)</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-slate-200 rounded text-sm text-black"
                      value={themeConfig.tabName || ''}
                      onChange={(e) => updateConfig('tabName', e.target.value)}
                      placeholder="Ej. Mi Tienda Increíble"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">Este texto aparecerá en la pestaña del navegador.</p>
                  </div>
                </div>
              </div>
            </SidebarSection>

            <SidebarSection
              icon={Palette} title="Colores de tu tienda"
              isOpen={activeSection === 'colors'} onClick={() => toggleSection('colors')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color Primario</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.primaryColor || '#8cc63f'}
                      onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.primaryColor || '#8cc63f'}
                      onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Este color se usará en acentos principales y algunos íconos.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Fondo del Encabezado</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.headerColor || '#ffffff'}
                      onChange={(e) => updateConfig('headerColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.headerColor || '#ffffff'}
                      onChange={(e) => updateConfig('headerColor', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Texto del Encabezado</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.headerTextColor || '#000000'}
                      onChange={(e) => updateConfig('headerTextColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.headerTextColor || '#000000'}
                      onChange={(e) => updateConfig('headerTextColor', e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Este color se usará para el menú principal (ej. Inicio, Catálogo).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Botones</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.buttonColor || '#8cc63f'}
                      onChange={(e) => updateConfig('buttonColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.buttonColor || '#8cc63f'}
                      onChange={(e) => updateConfig('buttonColor', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Pie de Página (Footer)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.footerColor || '#1e293b'}
                      onChange={(e) => updateConfig('footerColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.footerColor || '#1e293b'}
                      onChange={(e) => updateConfig('footerColor', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Fondo de Página</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.backgroundColor || '#ffffff'}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.backgroundColor || '#ffffff'}
                      onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Texto Primario (Títulos)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.primaryTextColor || '#1e293b'}
                      onChange={(e) => updateConfig('primaryTextColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.primaryTextColor || '#1e293b'}
                      onChange={(e) => updateConfig('primaryTextColor', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Color de Texto Secundario (Párrafos)</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                      value={themeConfig.secondaryTextColor || '#64748b'}
                      onChange={(e) => updateConfig('secondaryTextColor', e.target.value)}
                    />
                    <input
                      type="text"
                      className="flex-1 p-2 border border-slate-200 rounded text-sm uppercase text-black font-medium"
                      value={themeConfig.secondaryTextColor || '#64748b'}
                      onChange={(e) => updateConfig('secondaryTextColor', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </SidebarSection>

            <SidebarSection
              icon={PanelTop} title="Encabezado"
              isOpen={activeSection === 'header'} onClick={() => toggleSection('header')}
            >
              <div className="space-y-5">
                {/* Opciones de Visibilidad */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      checked={themeConfig.stickyHeader || false}
                      onChange={(e) => updateConfig('stickyHeader', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-700">Encabezado siempre visible</span>
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6 -mt-2">El encabezado te acompañará al hacer scroll.</p>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      checked={themeConfig.absoluteHeader || false}
                      onChange={(e) => updateConfig('absoluteHeader', e.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-700">Encabezado flotante sobre el banner</span>
                  </label>
                  <p className="text-[10px] text-slate-500 pl-6 -mt-2">Ideal para fondos oscuros. Quita el fondo del encabezado y lo superpone.</p>
                </div>

                {/* Tamaño del Logo */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Máximo ancho del logo</label>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{themeConfig.logoMaxWidth || 140}px</span>
                  </div>
                  <input
                    type="range"
                    min="50" max="300" step="5"
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    value={themeConfig.logoMaxWidth || 140}
                    onChange={(e) => updateConfig('logoMaxWidth', parseInt(e.target.value))}
                  />
                </div>

                {/* Barras de Anuncios */}
                <div className="pt-3 border-t border-slate-100 space-y-4">
                  <label className="block text-xs font-bold text-slate-700">Barras de Anuncios</label>
                  <p className="text-[10px] text-slate-500 -mt-3 mb-3">Muestra información importante. ¡Usa emojis! 🎉</p>

                  {/* Barra 1 */}
                  <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer border-b border-slate-200 pb-2 mb-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                        checked={themeConfig.showAnnouncementBar1 || false}
                        onChange={(e) => updateConfig('showAnnouncementBar1', e.target.checked)}
                      />
                      <span className="text-sm font-bold text-indigo-900">Mostrar Barra Primaria</span>
                    </label>

                    {themeConfig.showAnnouncementBar1 && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Posición</label>
                            <select
                              className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementPosition1 || 'above'}
                              onChange={(e) => updateConfig('announcementPosition1', e.target.value)}
                            >
                              <option value="above">Arriba del encabezado</option>
                              <option value="below">Debajo del encabezado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Tipo</label>
                            <select
                              className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementType1 || 'static'}
                              onChange={(e) => updateConfig('announcementType1', e.target.value)}
                            >
                              <option value="static">Estático</option>
                              <option value="animated">Animado (Marquesina)</option>
                              <option value="countdown">Cuenta Regresiva</option>
                            </select>
                          </div>
                        </div>

                        {themeConfig.announcementType1 === 'countdown' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Fecha Límite</label>
                            <input
                              type="datetime-local"
                              className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementCountdownDate1 || ''}
                              onChange={(e) => updateConfig('announcementCountdownDate1', e.target.value)}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Mensaje</label>
                          <input
                            type="text"
                            placeholder="Ej: ¡Envío gratis hoy!"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                            value={themeConfig.announcementText1 || ''}
                            onChange={(e) => updateConfig('announcementText1', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Enlace (Opcional)</label>
                          <input
                            type="url"
                            placeholder="https://"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                            value={themeConfig.announcementLink1 || ''}
                            onChange={(e) => updateConfig('announcementLink1', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Color de Fondo</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementColorMode1 || 'primary'}
                              onChange={(e) => updateConfig('announcementColorMode1', e.target.value)}
                            >
                              <option value="primary">Color Primario</option>
                              <option value="secondary">Color Secundario</option>
                              <option value="background">Color de Fondo</option>
                              <option value="custom">Color Personalizado</option>
                            </select>
                            {themeConfig.announcementColorMode1 === 'custom' && (
                              <input
                                type="color"
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                value={themeConfig.announcementCustomColor1 || '#000000'}
                                onChange={(e) => updateConfig('announcementCustomColor1', e.target.value)}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Barra 2 */}
                  <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer border-b border-slate-200 pb-2 mb-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                        checked={themeConfig.showAnnouncementBar2 || false}
                        onChange={(e) => updateConfig('showAnnouncementBar2', e.target.checked)}
                      />
                      <span className="text-sm font-bold text-indigo-900">Mostrar Barra Secundaria</span>
                    </label>

                    {themeConfig.showAnnouncementBar2 && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Posición</label>
                            <select
                              className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementPosition2 || 'above'}
                              onChange={(e) => updateConfig('announcementPosition2', e.target.value)}
                            >
                              <option value="above">Arriba del encabezado</option>
                              <option value="below">Debajo del encabezado</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Tipo</label>
                            <select
                              className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementType2 || 'static'}
                              onChange={(e) => updateConfig('announcementType2', e.target.value)}
                            >
                              <option value="static">Estático</option>
                              <option value="animated">Animado (Marquesina)</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Mensaje</label>
                          <input
                            type="text"
                            placeholder="Ej: 10% OFF pagando con Transferencia 🔥"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                            value={themeConfig.announcementText2 || ''}
                            onChange={(e) => updateConfig('announcementText2', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Enlace (Opcional)</label>
                          <input
                            type="url"
                            placeholder="https://"
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                            value={themeConfig.announcementLink2 || ''}
                            onChange={(e) => updateConfig('announcementLink2', e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">Color de Fondo</label>
                          <div className="flex gap-2">
                            <select
                              className="flex-1 p-1.5 border border-slate-300 rounded text-xs text-black"
                              value={themeConfig.announcementColorMode2 || 'button'}
                              onChange={(e) => updateConfig('announcementColorMode2', e.target.value)}
                            >
                              <option value="primary">Color Primario</option>
                              <option value="secondary">Color Secundario</option>
                              <option value="background">Color de Fondo</option>
                              <option value="custom">Color Personalizado</option>
                            </select>
                            {themeConfig.announcementColorMode2 === 'custom' && (
                              <input
                                type="color"
                                className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                value={themeConfig.announcementCustomColor2 || '#000000'}
                                onChange={(e) => updateConfig('announcementCustomColor2', e.target.value)}
                              />
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </SidebarSection>

            <SidebarSection
              icon={Type} title="Tipografia de Tienda, Íconos y Botones"
              isOpen={activeSection === 'typography'} onClick={() => toggleSection('typography')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuente Principal (Títulos)</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                    value={themeConfig.fontFamily || 'Open Sans'}
                    onChange={(e) => updateConfig('fontFamily', e.target.value)}
                  >
                    <option value="Open Sans">Open Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Inter">Inter</option>
                    <option value="Playfair Display">Playfair Display (Serif)</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Quicksand">Quicksand</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Fredoka">Fredoka</option>
                    <option value="Comfortaa">Comfortaa</option>
                    <option value="Righteous">Righteous</option>
                    <option value="Bungee">Bungee</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Lora">Lora</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Satisfy">Satisfy</option>
                    <option value="Caveat">Caveat</option>
                    <option value="Space Mono">Space Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuente Secundaria (Cuerpo y Párrafos)</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                    value={themeConfig.secondaryFontFamily || 'Open Sans'}
                    onChange={(e) => updateConfig('secondaryFontFamily', e.target.value)}
                  >
                    <option value="Open Sans">Open Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Inter">Inter</option>
                    <option value="Lora">Lora (Serif)</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Raleway">Raleway</option>
                    <option value="Quicksand">Quicksand</option>
                    <option value="Fredoka">Fredoka</option>
                    <option value="Comfortaa">Comfortaa</option>
                    <option value="Righteous">Righteous</option>
                    <option value="Bungee">Bungee</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Satisfy">Satisfy</option>
                    <option value="Caveat">Caveat</option>
                    <option value="Space Mono">Space Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Fuente de Botones</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                    value={themeConfig.buttonFontFamily || 'Open Sans'}
                    onChange={(e) => updateConfig('buttonFontFamily', e.target.value)}
                  >
                    <option value="Open Sans">Open Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Inter">Inter</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Oswald">Oswald</option>
                    <option value="Outfit">Outfit</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Fredoka">Fredoka</option>
                    <option value="Comfortaa">Comfortaa</option>
                    <option value="Righteous">Righteous</option>
                    <option value="Bungee">Bungee</option>
                    <option value="Cinzel">Cinzel</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Lora">Lora</option>
                    <option value="Cormorant Garamond">Cormorant Garamond</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Satisfy">Satisfy</option>
                    <option value="Caveat">Caveat</option>
                    <option value="Space Mono">Space Mono</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </select>
                </div>
              </div>
            </SidebarSection>
          </div>  {/*aca*/}
          <div className="p-4 pt-0">
            <h3 className="text-[#311b92] font-bold text-sm mb-2">Apariencia de la tienda</h3>{/*aca*/}
            <SidebarSection
              icon={ShoppingBag} title="Tarjeta de producto"
              isOpen={activeSection === 'product_card'} onClick={() => toggleSection('product_card')}
            >
              <div className="space-y-6">
                {/* Imagen del producto */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Imagen del producto</h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Relación de aspecto de la imagen</label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">Definí la relación de aspecto de las imágenes de tus productos, probá las distintas configuraciónes para determinar cuál queda mejor en tu tienda.</p>
                    <select
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                      value={themeConfig.productCard?.aspectRatio || 'adapt'}
                      onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), aspectRatio: e.target.value })}
                    >
                      <option value="adapt">Adaptar a la imagen</option>
                      <option value="1:1">Cuadrada 1:1</option>
                      <option value="3:4">Vertical 3:4</option>
                      <option value="2:3">Vertical 2:3</option>
                      <option value="4:3">Horizontal 4:3</option>
                      <option value="3:2">Horizontal 3:2</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tamaño de la imagen</label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">Definí como se verán las imágenes de tus productos, mostrando la imagen completa o ajustándola a la tarjeta del producto.</p>
                    <select
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                      value={themeConfig.productCard?.imageFit || 'contain'}
                      onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), imageFit: e.target.value })}
                    >
                      <option value="contain">Mostrar imagen completa</option>
                      <option value="cover">Ajustar imagen a la tarjeta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de visualización</label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">Definí cómo se mostrarán las imágenes de tus productos. Elegí qué debe ocurrir al pasar el cursor por encima.</p>
                    <select
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                      value={themeConfig.productCard?.hoverAction || 'none'}
                      onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), hoverAction: e.target.value })}
                    >
                      <option value="none">Sin acción al pasar el cursor</option>
                      <option value="next_image">Cambiar a la siguiente imagen</option>
                      <option value="arrows">Mostrar flechas de navegación</option>
                    </select>
                  </div>
                </div>

                {/* Información de precio a mostrar */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Información de precio a mostrar</h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Precio a mostrar</label>
                    <p className="text-[10px] text-slate-500 mb-2 leading-tight">Elegí cómo mostrar los precios de los productos en tu tienda online. Atraé a más clientes destacando el precio más económico.</p>
                    <select
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                      value={themeConfig.productCard?.priceDisplay || 'both'}
                      onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), priceDisplay: e.target.value })}
                    >
                      <option value="list_price">Precio lista</option>
                      <option value="discount_price">Precio con descuento por método de pago</option>
                      <option value="both">Mostrar ambos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Leyenda de la ficha</label>
                    <select
                      className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                      value={themeConfig.productCard?.badge || 'installments'}
                      onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), badge: e.target.value })}
                    >
                      <option value="none">No mostrar ningun mensaje</option>
                      <option value="installments">Mostrar cuotas sin interés</option>
                      <option value="payment_discount">Mostrar descuento por método de pago</option>
                      <option value="custom">Mostrar mensaje personalizado</option>
                    </select>

                    {themeConfig.productCard?.badge === 'custom' && (
                      <input
                        type="text"
                        placeholder="Ej: ¡Envío Gratis!"
                        className="w-full p-2 mt-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-indigo-500 text-black font-medium"
                        value={themeConfig.productCard?.customBadgeText || ''}
                        onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), customBadgeText: e.target.value })}
                      />
                    )}
                  </div>
                </div>

                {/* Opciones de diseño */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Opciones de diseño</h4>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.productCard?.showBorders ?? true}
                        onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), showBorders: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar bordes</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.productCard?.showSku ?? false}
                        onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), showSku: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar SKU del producto</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.productCard?.quickBuy ?? false}
                        onChange={(e) => updateConfig('productCard', { ...(themeConfig.productCard || {}), quickBuy: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Botón de compra rápida</span>
                    </label>
                  </div>
                </div>
              </div>
            </SidebarSection>
          </div>
          <div>
            <SidebarSection icon={FileText} title="Páginas" isOpen={activeSection === 'pages'} onClick={() => toggleSection('pages')}>
              <div className="p-4 pt-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex flex-col gap-2 mb-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-[#311b92] uppercase tracking-wider">Tus Páginas</label>
                    <button
                      onClick={() => {
                        const title = prompt('Ingresa el nombre de la nueva página (ej: Blog, Sobre Nosotros):');
                        if (title && title.trim() !== '') {
                          const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.html';
                          const newCustomPages = [...(themeConfig.customPages || []), { id, title }];
                          const newConfig = {
                            ...themeConfig,
                            customPages: newCustomPages,
                            pageSections: {
                              ...(themeConfig.pageSections || {}),
                              [id]: []
                            }
                          };
                          setThemeConfig(newConfig);
                          setActivePage(id);
                          
                          if (iframeRef.current && iframeRef.current.contentWindow) {
                            iframeRef.current.contentWindow.postMessage({
                              type: 'UPDATE_THEME_CONFIG',
                              payload: newConfig,
                              activePage: id
                            }, '*');
                          }
                        }
                      }}
                      className="text-xs font-bold text-[#311b92] hover:text-[#4527a0] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" /> Crear
                    </button>
                  </div>
                  
                  <div className="space-y-1">
                    {/* Default Pages */}
                    {[
                      { id: 'index.html', title: themeConfig?.defaultPageTitles?.['index.html'] || 'Inicio' },
                      { id: 'shop.html', title: themeConfig?.defaultPageTitles?.['shop.html'] || 'Tienda / Catálogo' },
                      { id: 'single.html', title: themeConfig?.defaultPageTitles?.['single.html'] || 'Detalle de Producto' },
                      { id: 'contact.html', title: themeConfig?.defaultPageTitles?.['contact.html'] || 'Contacto' }
                    ].map(page => {
                      if (themeConfig?.hiddenDefaultPages?.includes(page.id)) return null;
                      return (
                      <div 
                        key={page.id} 
                        onClick={() => setActivePage(page.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer border group ${activePage === page.id ? 'border-[#311b92] bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <span className="text-sm font-medium text-slate-700">{page.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTitle = prompt('Editar nombre de página:', page.title);
                              if (newTitle && newTitle.trim() !== '') {
                                const newTitles = { ...(themeConfig.defaultPageTitles || {}), [page.id]: newTitle };
                                const newConfig = { ...themeConfig, defaultPageTitles: newTitles };
                                setThemeConfig(newConfig);
                                if (iframeRef.current && iframeRef.current.contentWindow) {
                                  iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME_CONFIG', payload: newConfig, activePage }, '*');
                                }
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Editar nombre"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {page.id !== 'index.html' && page.id !== 'single.html' && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`¿Seguro que deseas eliminar la página "${page.title}" de tu menú?`)) {
                                  const hiddenPages = [...(themeConfig.hiddenDefaultPages || []), page.id];
                                  const newConfig = { ...themeConfig, hiddenDefaultPages: hiddenPages };
                                  setThemeConfig(newConfig);
                                  if (activePage === page.id) setActivePage('index.html');
                                  if (iframeRef.current && iframeRef.current.contentWindow) {
                                    iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME_CONFIG', payload: newConfig, activePage: activePage === page.id ? 'index.html' : activePage }, '*');
                                  }
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                              title="Eliminar página"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    )})}

                    {/* Custom Pages */}
                    {(themeConfig.customPages || []).map(page => (
                      <div 
                        key={page.id} 
                        onClick={() => setActivePage(page.id)}
                        className={`flex items-center justify-between p-2 rounded cursor-pointer border group ${activePage === page.id ? 'border-[#311b92] bg-indigo-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <span className="text-sm font-medium text-slate-700">{page.title}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              const newTitle = prompt('Editar nombre de página:', page.title);
                              if (newTitle && newTitle.trim() !== '') {
                                const newCustomPages = themeConfig.customPages.map(p => p.id === page.id ? { ...p, title: newTitle } : p);
                                const newConfig = { ...themeConfig, customPages: newCustomPages };
                                setThemeConfig(newConfig);
                                if (iframeRef.current && iframeRef.current.contentWindow) {
                                  iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME_CONFIG', payload: newConfig, activePage }, '*');
                                }
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Editar nombre"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`¿Seguro que deseas eliminar la página "${page.title}"?`)) {
                                const newCustomPages = themeConfig.customPages.filter(p => p.id !== page.id);
                                const newPageSections = { ...themeConfig.pageSections };
                                delete newPageSections[page.id];
                                const newConfig = { ...themeConfig, customPages: newCustomPages, pageSections: newPageSections };
                                setThemeConfig(newConfig);
                                if (activePage === page.id) {
                                  setActivePage('index.html');
                                }
                                if (iframeRef.current && iframeRef.current.contentWindow) {
                                  iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME_CONFIG', payload: newConfig, activePage: activePage === page.id ? 'index.html' : activePage }, '*');
                                }
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                            title="Eliminar página"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-sm font-bold text-[#311b92]">Navegación One-Page</span>
                        <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px]">Muestra todas las páginas apiladas y utiliza scroll suave al navegar por el menú.</p>
                      </div>
                      <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input 
                          type="checkbox" 
                          name="toggleOnePage" 
                          id="toggleOnePage" 
                          className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer"
                          style={{
                            right: themeConfig.isOnePage ? '0' : '1.25rem',
                            borderColor: themeConfig.isOnePage ? '#311b92' : '#cbd5e1',
                            transition: 'right 0.2s, border-color 0.2s'
                          }}
                          checked={themeConfig.isOnePage || false}
                          onChange={(e) => {
                            const newConfig = { ...themeConfig, isOnePage: e.target.checked };
                            setThemeConfig(newConfig);
                            if (iframeRef.current && iframeRef.current.contentWindow) {
                              iframeRef.current.contentWindow.postMessage({ type: 'UPDATE_THEME_CONFIG', payload: newConfig, activePage }, '*');
                            }
                          }}
                        />
                        <label 
                          htmlFor="toggleOnePage" 
                          className="toggle-label block overflow-hidden h-5 rounded-full cursor-pointer"
                          style={{
                            backgroundColor: themeConfig.isOnePage ? '#e0e7ff' : '#cbd5e1',
                            transition: 'background-color 0.2s'
                          }}
                        ></label>
                      </div>
                    </label>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-tight mt-2">Crea o selecciona la página que deseas visualizar y editar.</p>
                </div>
              </div>
            </SidebarSection>
            
            <SidebarSection icon={LayoutTemplate} title="Constructor de Páginas" isOpen={activeSection === 'home'} onClick={() => toggleSection('home')}>
              <div className="p-4 pt-2 bg-slate-50 border-t border-slate-100 flex flex-col gap-4">
                <div className="flex flex-col gap-2 mb-2 border-b border-slate-200 pb-4">
                  <label className="text-xs font-bold text-[#311b92] uppercase tracking-wider">Página seleccionada</label>
                  <div className="w-full p-2 border border-slate-200 rounded text-sm text-slate-700 bg-white">
                    {activePage === 'index.html' ? 'Inicio' : 
                     activePage === 'shop.html' ? 'Tienda / Catálogo' : 
                     activePage === 'single.html' ? 'Detalle de Producto' : 
                     activePage === 'contact.html' ? 'Contacto' : 
                     (themeConfig.customPages || []).find(p => p.id === activePage)?.title || activePage}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight">Para cambiar de página, ve a la sección "Páginas".</p>
                </div>
                {isAddingSection ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <button onClick={() => setIsAddingSection(false)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium mb-4">
                      <ArrowLeft className="w-4 h-4" /> Volver
                    </button>
                    <h4 className="font-bold text-slate-800 text-sm mb-2">¿Qué sección deseas agregar?</h4>

                    <div className="mb-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secciones básicas</h5>
                      <div className="flex flex-col gap-2">
                        {CATALOG_SECTIONS.filter(s => s.category === 'basic').map(section => (
                          <div key={section.id} className="bg-white border border-slate-200 rounded p-3 flex justify-between items-center group cursor-pointer hover:border-[#311b92]" onClick={() => section.isImplemented ? addSection(section) : null}>
                            <div className="pr-4">
                              <div className="flex items-center gap-2">
                                <h6 className="text-sm font-bold text-slate-800">{section.title}</h6>
                                {!section.isImplemented && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">En desarrollo</span>}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{section.desc}</p>
                            </div>
                            {section.isImplemented && <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#311b92]" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Secciones avanzadas</h5>
                      <div className="flex flex-col gap-2">
                        {CATALOG_SECTIONS.filter(s => s.category === 'advanced').map(section => (
                          <div key={section.id} className="bg-white border border-slate-200 rounded p-3 flex justify-between items-center group cursor-pointer hover:border-[#311b92]" onClick={() => section.isImplemented ? addSection(section) : null}>
                            <div className="pr-4">
                              <div className="flex items-center gap-2">
                                <h6 className="text-sm font-bold text-slate-800">{section.title}</h6>
                                {!section.isImplemented && <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">En desarrollo</span>}
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 leading-tight">{section.desc}</p>
                            </div>
                            {section.isImplemented && <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#311b92]" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : editingSectionId ? (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-200">
                    <button onClick={() => setEditingSectionId(null)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium mb-4">
                      <ArrowLeft className="w-4 h-4" /> Volver al listado
                    </button>

                    {currentSectionType === 'purchase_info' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Información de compra</h4>

                        {['element1', 'element2', 'element3'].map((el, i) => (
                          <div key={el} className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-3">
                            <h5 className="text-xs font-bold text-slate-700">Elemento {i + 1}</h5>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título</label>
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={themeConfig.purchaseInfoConfig[el].title}
                                onChange={(e) => updateConfig('purchaseInfoConfig', { ...themeConfig.purchaseInfoConfig, [el]: { ...themeConfig.purchaseInfoConfig[el], title: e.target.value } })}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto descriptivo</label>
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={themeConfig.purchaseInfoConfig[el].text}
                                onChange={(e) => updateConfig('purchaseInfoConfig', { ...themeConfig.purchaseInfoConfig, [el]: { ...themeConfig.purchaseInfoConfig[el], text: e.target.value } })}
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Ícono</label>
                              <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={themeConfig.purchaseInfoConfig[el].icon}
                                onChange={(e) => updateConfig('purchaseInfoConfig', { ...themeConfig.purchaseInfoConfig, [el]: { ...themeConfig.purchaseInfoConfig[el], icon: e.target.value } })}
                              >
                                <option value="shipping">Envío</option>
                                <option value="payment">Pago online</option>
                                <option value="security">Pago seguro</option>
                                <option value="home">Compra en casa</option>
                                <option value="discount">Descuentos</option>
                                <option value="store">Local</option>
                                <option value="email">Email</option>
                                <option value="phone">Teléfono</option>
                                <option value="whatsapp">WhatsApp</option>
                                <option value="transfer">Transferencia</option>
                                <option value="cash">Efectivo</option>
                              </select>
                            </div>
                          </div>
                        ))}

                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-3 mt-2">
                          <h5 className="text-xs font-bold text-slate-700">Diseño</h5>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Separación por sección</label>
                            <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={themeConfig.purchaseInfoConfig.spacing}
                              onChange={(e) => updateConfig('purchaseInfoConfig', { ...themeConfig.purchaseInfoConfig, spacing: e.target.value })}
                            >
                              <option value="small">Pequeño</option>
                              <option value="normal">Normal</option>
                              <option value="large">Grande</option>
                              <option value="xlarge">Muy grande</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Colores</label>
                            <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={themeConfig.purchaseInfoConfig.colorMode}
                              onChange={(e) => updateConfig('purchaseInfoConfig', { ...themeConfig.purchaseInfoConfig, colorMode: e.target.value })}
                            >
                              <option value="default">Usar colores del tema (Primario/Fondo)</option>
                              <option value="inverted">Invertido (Fondo Primario)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'banners' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Banners</h4>

                        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-[10px] text-amber-800">
                          Para que tu tienda sea más rápida para tus usuarios, te recomendamos que antes de subir las imágenes las comprimas <a href="https://www.iloveimg.com/es/comprimir-imagen?ref=tiendanegocio.com" target="_blank" rel="noreferrer" className="font-bold underline text-amber-900">en este link.</a>
                        </div>

                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-3">
                          <h5 className="text-xs font-bold text-slate-700">Imágenes</h5>

                          {/* Banner Miniature Preview */}
                          {(themeConfig.pageSections?.[activePage] || []).find(s => s.id === editingSectionId)?.settings?.items?.[0]?.image && (
                            <div className="w-full h-32 rounded border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center relative">
                              <img
                                src={(themeConfig.pageSections?.[activePage] || []).find(s => s.id === editingSectionId).settings.items[0].image}
                                alt="Banner"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}

                          <div className="flex gap-2 flex-wrap">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`upload-banner-${currentEditingSection.id}-0`}
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleSectionImageUpload(e.target.files[0], currentEditingSection.id, 0);
                                }
                              }}
                            />
                            <button
                              onClick={() => document.getElementById(`upload-banner-${currentEditingSection.id}-0`).click()}
                              disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0 ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Upload className="w-3 h-3" />
                              )}
                              {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0 ? 'Subiendo...' : 'Subir imagen'}
                            </button>
                            <button
                              onClick={() => {
                                setBannerDesignTarget({ sectionIndex: (themeConfig.pageSections?.[activePage] || []).findIndex(s => s.id === editingSectionId), blockIndex: 0 });
                                setIsTemplatesModalOpen(true);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 border border-slate-200 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              <ImageIcon className="w-3 h-3" /> Imágenes gratis
                            </button>
                            <button
                              onClick={() => {
                                const targetIdx = (themeConfig.pageSections?.[activePage] || []).findIndex(s => s.id === editingSectionId);
                                setBannerDesignTarget({ sectionIndex: targetIdx, blockIndex: 0 });
                                setDesignerImageUrl(themeConfig.pageSections?.[activePage]?.[targetIdx]?.settings?.items?.[0]?.image || null);
                                setIsDesigningBanner(true);
                              }}
                              className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-indigo-200 bg-indigo-50 text-indigo-700 rounded text-xs font-bold hover:bg-indigo-100 transition-colors"
                            >
                              ✨ Diseñar / Editar Imagen
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100">
                            <span className="font-bold text-slate-700 block mb-1">Tamaño recomendado: 1200px x 450px</span>
                            Te sugerimos ubicar el contenido principal de la imagen de forma central en un ancho menor a 400px, para que en dispositivos móviles se vea de forma completa.
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <h5 className="text-xs font-bold text-slate-700">Configuración</h5>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Altura del banner</label>
                            <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={themeConfig.bannerConfig?.height || 'auto'}
                              onChange={(e) => updateConfig('bannerConfig', { ...(themeConfig.bannerConfig || {}), height: e.target.value })}
                            >
                              <option value="small">Pequeño</option>
                              <option value="large">Grande</option>
                              <option value="auto">Automático</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Autoplay</label>
                            <select className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={themeConfig.bannerConfig?.autoplay !== false ? 'yes' : 'no'}
                              onChange={(e) => updateConfig('bannerConfig', { ...(themeConfig.bannerConfig || {}), autoplay: e.target.value === 'yes' })}
                            >
                              <option value="yes">Sí</option>
                              <option value="no">No</option>
                            </select>
                          </div>

                          {(themeConfig.bannerConfig?.autoplay !== false) && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Tiempo de cambio ({themeConfig.bannerConfig?.interval || 5} segundos)</label>
                              <input
                                type="range"
                                min="0"
                                max="9"
                                className="w-full"
                                value={themeConfig.bannerConfig?.interval || 5}
                                onChange={(e) => updateConfig('bannerConfig', { ...(themeConfig.bannerConfig || {}), interval: parseInt(e.target.value) })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'announcement_bar' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Barra de anuncio</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto del anuncio</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.text || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { text: e.target.value })}
                              placeholder="Ej: ¡Envíos gratis superando los $50.000!" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Link (Opcional)</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.link || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { link: e.target.value })}
                              placeholder="Ej: /productos/ofertas" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Color de fondo</label>
                            <input type="color" className="w-full h-8 p-0 border-0 rounded cursor-pointer"
                              value={currentSectionSettings.backgroundColor || '#000000'}
                              onChange={(e) => updateSectionSettings(editingSectionId, { backgroundColor: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Color de texto</label>
                            <input type="color" className="w-full h-8 p-0 border-0 rounded cursor-pointer"
                              value={currentSectionSettings.textColor || '#ffffff'}
                              onChange={(e) => updateSectionSettings(editingSectionId, { textColor: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'selected_products' && (
                      <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                          <h4 className="font-bold text-slate-800 text-sm">Productos seleccionados</h4>
                          <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                            {(currentSectionSettings.selectedProductIds || []).length} seleccionados
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title ?? 'Productos seleccionados'}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Lo más vendido, Selección especial..."
                            />
                          </div>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              checked={currentSectionSettings.enableSearch ?? false}
                              onChange={(e) => updateSectionSettings(editingSectionId, { enableSearch: e.target.checked })}
                            />
                            <span className="text-xs font-bold text-slate-700">Habilitar Buscador en la sección</span>
                          </label>

                          <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Elegir productos de tu catálogo</label>
                              <span className="text-[10px] text-slate-400">Total tienda: {storeProducts.length}</span>
                            </div>

                            {/* Search & Filter within store products */}
                            <div className="flex flex-col gap-2">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Buscar producto por nombre..."
                                  value={productPickerSearch}
                                  onChange={(e) => setProductPickerSearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded text-xs text-black bg-slate-50 focus:bg-white"
                                />
                                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                              </div>

                              {storeCategories.length > 0 && (
                                <select
                                  value={productPickerCategory}
                                  onChange={(e) => setProductPickerCategory(e.target.value)}
                                  className="w-full p-1.5 border border-slate-200 rounded text-xs text-black bg-slate-50"
                                >
                                  <option value="all">Todas las categorías ({storeProducts.length})</option>
                                  {storeCategories.map(cat => (
                                    <option key={cat} value={cat}>
                                      {cat} ({storeProducts.filter(p => p.category === cat).length})
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>

                            {/* Action Buttons: Select all / Deselect all */}
                            <div className="flex justify-between items-center text-[10px] pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  const filtered = storeProducts.filter(p => {
                                    const matchCat = productPickerCategory === 'all' || p.category === productPickerCategory;
                                    const matchQuery = !productPickerSearch || (p.name && p.name.toLowerCase().includes(productPickerSearch.toLowerCase()));
                                    return matchCat && matchQuery;
                                  });
                                  const currentSelected = new Set(currentSectionSettings.selectedProductIds || []);
                                  filtered.forEach(p => currentSelected.add(p.id));
                                  updateSectionSettings(editingSectionId, { selectedProductIds: Array.from(currentSelected) });
                                }}
                                className="text-indigo-600 hover:text-indigo-800 font-bold"
                              >
                                + Seleccionar visibles
                              </button>
                              {(currentSectionSettings.selectedProductIds || []).length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateSectionSettings(editingSectionId, { selectedProductIds: [] });
                                  }}
                                  className="text-red-500 hover:text-red-700 font-bold"
                                >
                                  Desmarcar todos
                                </button>
                              )}
                            </div>

                            {/* Products checklist */}
                            <div className="max-h-64 overflow-y-auto flex flex-col gap-1.5 border border-slate-100 rounded-lg p-1.5 bg-slate-50">
                              {storeProducts
                                .filter(p => {
                                  const matchCat = productPickerCategory === 'all' || p.category === productPickerCategory;
                                  const matchQuery = !productPickerSearch || (p.name && p.name.toLowerCase().includes(productPickerSearch.toLowerCase()));
                                  return matchCat && matchQuery;
                                })
                                .map(prod => {
                                  const isSelected = (currentSectionSettings.selectedProductIds || []).includes(prod.id);
                                  return (
                                    <div
                                      key={prod.id}
                                      onClick={() => {
                                        const current = currentSectionSettings.selectedProductIds || [];
                                        const next = isSelected 
                                          ? current.filter(id => id !== prod.id)
                                          : [...current, prod.id];
                                        updateSectionSettings(editingSectionId, { selectedProductIds: next });
                                      }}
                                      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all border ${isSelected ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-medium shadow-xs' : 'bg-white border-slate-200/80 hover:bg-slate-100/80 text-slate-700'}`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => {}} // Handled by parent div onClick
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 pointer-events-none"
                                      />
                                      <div className="w-9 h-9 rounded bg-white border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        <img src={prod.images?.[0] || 'https://placehold.co/40?text=P'} alt="" className="w-full h-full object-contain" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] truncate leading-tight">{prod.name}</p>
                                        <span className="text-[9px] text-slate-400">{prod.category || 'Sin categoría'}</span>
                                      </div>
                                      <span className="text-[11px] font-bold text-slate-900">${prod.price}</span>
                                    </div>
                                  );
                                })}

                              {storeProducts.length === 0 && (
                                <p className="text-center py-4 text-xs text-slate-400">No tienes productos creados en tu tienda.</p>
                              )}
                            </div>
                          </div>

                          {/* Selected Products List & Ordering */}
                          {(currentSectionSettings.selectedProductIds || []).length > 0 && (
                            <div className="border-t border-slate-100 pt-3">
                              <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">
                                Orden de visualización ({(currentSectionSettings.selectedProductIds || []).length} productos)
                              </label>
                              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                                {(currentSectionSettings.selectedProductIds || []).map((prodId, idx) => {
                                  const prod = storeProducts.find(p => p.id === prodId);
                                  if (!prod) return null;
                                  return (
                                    <div key={prodId} className="flex items-center justify-between p-1.5 bg-slate-50 border border-slate-200 rounded text-xs">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-[9px] font-bold text-slate-400 w-4 text-center">{idx + 1}</span>
                                        <img src={prod.images?.[0] || 'https://placehold.co/30'} alt="" className="w-6 h-6 object-contain rounded bg-white border border-slate-100" />
                                        <span className="truncate text-[11px] font-medium text-slate-700 max-w-[140px]">{prod.name}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        {idx > 0 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const ids = [...(currentSectionSettings.selectedProductIds || [])];
                                              const temp = ids[idx];
                                              ids[idx] = ids[idx - 1];
                                              ids[idx - 1] = temp;
                                              updateSectionSettings(editingSectionId, { selectedProductIds: ids });
                                            }}
                                            className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                            title="Subir posición"
                                          >
                                            <ArrowUp className="w-3 h-3" />
                                          </button>
                                        )}
                                        {idx < (currentSectionSettings.selectedProductIds || []).length - 1 && (
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const ids = [...(currentSectionSettings.selectedProductIds || [])];
                                              const temp = ids[idx];
                                              ids[idx] = ids[idx + 1];
                                              ids[idx + 1] = temp;
                                              updateSectionSettings(editingSectionId, { selectedProductIds: ids });
                                            }}
                                            className="p-1 hover:bg-slate-200 rounded text-slate-600"
                                            title="Bajar posición"
                                          >
                                            <ArrowDown className="w-3 h-3" />
                                          </button>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const ids = (currentSectionSettings.selectedProductIds || []).filter(id => id !== prodId);
                                            updateSectionSettings(editingSectionId, { selectedProductIds: ids });
                                          }}
                                          className="p-1 hover:bg-red-100 rounded text-red-500"
                                          title="Quitar de seleccionados"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'product_list' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Listado de productos</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Nuestros Productos" />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              checked={currentSectionSettings.enableSearch ?? false}
                              onChange={(e) => updateSectionSettings(editingSectionId, { enableSearch: e.target.checked })}
                            />
                            <span className="text-xs font-bold text-slate-700">Habilitar Buscador Inteligente</span>
                          </label>
                          <div className="mt-2">
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Diseño de Categorías</label>
                            <select 
                               className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                               value={currentSectionSettings.categoryStyle || 'horizontal'}
                               onChange={(e) => updateSectionSettings(editingSectionId, { categoryStyle: e.target.value })}
                            >
                                <option value="horizontal">Botones Horizontales</option>
                                <option value="dropdown">Buscador Desplegable</option>
                                <option value="sidebar">Lista Lateral</option>
                                <option value="none">Ocultar Categorías</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'product_group' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Grupo de productos</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Ofertas Destacadas" />
                          </div>
                          {storeCategories.length > 0 && (
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Filtrar por Categoría</label>
                              <select 
                                className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                value={currentSectionSettings.selectedCategory || 'all'}
                                onChange={(e) => updateSectionSettings(editingSectionId, { selectedCategory: e.target.value })}
                              >
                                <option value="all">Todas las categorías</option>
                                {storeCategories.map(cat => (
                                  <option key={cat} value={cat}>{cat}</option>
                                ))}
                              </select>
                            </div>
                          )}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Cantidad de productos a mostrar</label>
                            <input 
                              type="number" 
                              min="1" 
                              max="48" 
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.limit || 8}
                              onChange={(e) => updateSectionSettings(editingSectionId, { limit: parseInt(e.target.value) || 8 })}
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer mt-2">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              checked={currentSectionSettings.enableSearch ?? false}
                              onChange={(e) => updateSectionSettings(editingSectionId, { enableSearch: e.target.checked })}
                            />
                            <span className="text-xs font-bold text-slate-700">Habilitar Buscador Inteligente</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'featured_categories' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Categorías destacadas</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title ?? 'Categorías destacadas'}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Explorá nuestras categorías"
                            />
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <div className="flex justify-between items-center mb-2">
                              <label className="block text-[10px] font-bold text-slate-500 uppercase">Listado de Categorías</label>
                              {storeCategories.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const currentCats = currentSectionSettings.categories || [];
                                    const newCats = storeCategories.map(cat => ({
                                      name: cat,
                                      image: currentCats.find(c => c.name === cat)?.image || '',
                                      link: `/productos?category=${encodeURIComponent(cat)}`
                                    }));
                                    updateSectionSettings(editingSectionId, { categories: newCats });
                                  }}
                                  className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold"
                                >
                                  + Importar de mis productos
                                </button>
                              )}
                            </div>

                            {(currentSectionSettings.categories || [
                              { name: 'Categoría 1', image: '', link: '' },
                              { name: 'Categoría 2', image: '', link: '' },
                              { name: 'Categoría 3', image: '', link: '' }
                            ]).map((catItem, idx) => (
                              <div key={idx} className="flex flex-col gap-2 p-3 border border-slate-100 bg-slate-50 rounded mb-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[10px] font-bold text-slate-700">Categoría {idx + 1}</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCategories = [...(currentSectionSettings.categories || [])];
                                      newCategories.splice(idx, 1);
                                      updateSectionSettings(editingSectionId, { categories: newCategories });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                    title="Eliminar categoría"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Nombre</label>
                                  <input
                                    type="text"
                                    className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                    placeholder="Nombre de categoría"
                                    value={catItem.name || ''}
                                    onChange={(e) => {
                                      const newCategories = [...(currentSectionSettings.categories || [])];
                                      if (!newCategories[idx]) newCategories[idx] = {};
                                      newCategories[idx].name = e.target.value;
                                      updateSectionSettings(editingSectionId, { categories: newCategories });
                                    }}
                                  />
                                </div>

                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Imagen / Foto</label>
                                  {catItem.image && (
                                    <div className="w-20 h-20 rounded-full border border-slate-200 overflow-hidden bg-white mb-2 mx-auto flex items-center justify-center">
                                      <img src={catItem.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`upload-cat-${currentEditingSection.id}-${idx}`}
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, idx, 'categories');
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => document.getElementById(`upload-cat-${currentEditingSection.id}-${idx}`).click()}
                                    className="w-full flex items-center justify-center py-1.5 border border-slate-200 bg-white rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx}
                                  >
                                    {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx ? 'Subiendo...' : (catItem.image ? 'Cambiar Imagen' : 'Subir Imagen')}
                                  </button>
                                </div>

                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Enlace / Destino (Opcional)</label>
                                  <input
                                    type="text"
                                    className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                    placeholder="Ej: /productos?category=Nombre"
                                    value={catItem.link || ''}
                                    onChange={(e) => {
                                      const newCategories = [...(currentSectionSettings.categories || [])];
                                      if (!newCategories[idx]) newCategories[idx] = {};
                                      newCategories[idx].link = e.target.value;
                                      updateSectionSettings(editingSectionId, { categories: newCategories });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const newCategories = [...(currentSectionSettings.categories || []), { name: '', image: '', link: '' }];
                                updateSectionSettings(editingSectionId, { categories: newCategories });
                              }}
                              className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3 h-3" /> Agregar otra categoría
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'newsletter' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Newsletter</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Suscribite a nuestro newsletter" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Descripción</label>
                            <textarea className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.description || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { description: e.target.value })}
                              placeholder="Ej: Recibí las mejores ofertas y novedades en tu correo."></textarea>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'blog' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Blog</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Últimas Noticias"
                            />
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Artículos</label>
                            {(currentSectionSettings.items || [
                              { title: 'Artículo 1', description: 'Breve descripción del artículo para atraer a los lectores...', image: '', link: '' },
                              { title: 'Artículo 2', description: 'Breve descripción del artículo para atraer a los lectores...', image: '', link: '' }
                            ]).map((blogItem, idx) => (
                              <div key={idx} className="flex flex-col gap-2 p-3 border border-slate-100 bg-slate-50 rounded mb-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[10px] font-bold text-slate-700">Artículo {idx + 1}</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...(currentSectionSettings.items || [])];
                                      newItems.splice(idx, 1);
                                      updateSectionSettings(editingSectionId, { items: newItems });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <input
                                  type="text"
                                  className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white font-bold"
                                  placeholder="Título del artículo"
                                  value={blogItem.title || ''}
                                  onChange={(e) => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    if (!newItems[idx]) newItems[idx] = {};
                                    newItems[idx].title = e.target.value;
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }}
                                />

                                <textarea
                                  className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white h-16"
                                  placeholder="Descripción corta del artículo..."
                                  value={blogItem.description || ''}
                                  onChange={(e) => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    if (!newItems[idx]) newItems[idx] = {};
                                    newItems[idx].description = e.target.value;
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }}
                                ></textarea>

                                {blogItem.image && (
                                  <div className="w-full h-20 rounded border border-slate-200 overflow-hidden bg-slate-100 mb-1 flex items-center justify-center">
                                    <img src={blogItem.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`upload-blog-${currentEditingSection.id}-${idx}`}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, idx);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`upload-blog-${currentEditingSection.id}-${idx}`).click()}
                                  className="w-full flex items-center justify-center py-1.5 border border-slate-200 bg-white rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx}
                                >
                                  {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx ? 'Subiendo...' : (blogItem.image ? 'Cambiar Foto' : 'Subir Foto')}
                                </button>

                                <input
                                  type="text"
                                  className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                  placeholder="Link / URL del post"
                                  value={blogItem.link || ''}
                                  onChange={(e) => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    if (!newItems[idx]) newItems[idx] = {};
                                    newItems[idx].link = e.target.value;
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }}
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...(currentSectionSettings.items || []), { title: '', description: '', image: '', link: '' }];
                                updateSectionSettings(editingSectionId, { items: newItems });
                              }}
                              className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3 h-3" /> Agregar otro artículo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'text' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Texto</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Contenido</label>
                            <textarea className="w-full p-2 border border-slate-200 rounded text-xs text-black h-24"
                              value={currentSectionSettings.content || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { content: e.target.value })}
                              placeholder="Escribe tu texto aquí..."></textarea>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'image_grid' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Grilla de imágenes con links</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          {[0, 1, 2, 3].map((idx) => (
                            <div key={idx} className="flex flex-col gap-2 p-2 border border-slate-100 rounded">
                              <h5 className="text-[10px] font-bold text-slate-700">Imagen {idx + 1}</h5>
                              
                              {/* Preview */}
                              {currentSectionSettings.items?.[idx]?.image && (
                                <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                                  <img src={currentSectionSettings.items[idx].image} alt="" className="h-full object-contain" />
                                </div>
                              )}
                              
                              {/* Upload Button */}
                              <input type="file" accept="image/*" className="hidden" id={`upload-ig-${currentEditingSection.id}-${idx}`}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, idx);
                                }}
                              />
                              <button onClick={() => document.getElementById(`upload-ig-${currentEditingSection.id}-${idx}`).click()} className="flex items-center justify-center py-1.5 border border-slate-200 rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx}>
                                {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx ? 'Subiendo...' : 'Subir Imagen'}
                              </button>

                              {/* Link input */}
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                placeholder="Link al hacer clic (ej: /productos)"
                                value={currentSectionSettings.items?.[idx]?.link || ''}
                                onChange={(e) => {
                                  const newItems = [...(currentSectionSettings.items || [])];
                                  if (!newItems[idx]) newItems[idx] = {};
                                  newItems[idx].link = e.target.value;
                                  updateSectionSettings(editingSectionId, { items: newItems });
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'video_text_button' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Video con texto y botón</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">URL del Video (YouTube/Vimeo)</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.videoUrl || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { videoUrl: e.target.value })}
                              placeholder="Ej: https://youtube.com/..." />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto descriptivo</label>
                            <textarea className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.text || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { text: e.target.value })}></textarea>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto del botón</label>
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={currentSectionSettings.buttonText || ''}
                                onChange={(e) => updateSectionSettings(editingSectionId, { buttonText: e.target.value })}
                                placeholder="Ver más" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Link del botón</label>
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={currentSectionSettings.buttonLink || ''}
                                onChange={(e) => updateSectionSettings(editingSectionId, { buttonLink: e.target.value })}
                                placeholder="/productos" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'reviews' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Reseñas / Testimonios</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de sección</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Lo que dicen nuestros clientes" />
                          </div>
                          <div className="border-t border-slate-100 pt-3">
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Testimonios</label>
                            {Array.from({ length: Math.max(1, (currentSectionSettings.items || []).length) }).map((_, idx) => (
                              <div key={idx} className="flex flex-col gap-2 p-3 border border-slate-100 bg-slate-50 rounded mb-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[10px] font-bold text-slate-700">Reseña {idx + 1}</h5>
                                  <button onClick={() => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    newItems.splice(idx, 1);
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }} className="text-red-500 hover:text-red-700">
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                                <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                  placeholder="Nombre del cliente"
                                  value={currentSectionSettings.items?.[idx]?.author || ''}
                                  onChange={(e) => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    if (!newItems[idx]) newItems[idx] = {};
                                    newItems[idx].author = e.target.value;
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }}
                                />
                                <textarea className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white h-16"
                                  placeholder="Escribe aquí la reseña..."
                                  value={currentSectionSettings.items?.[idx]?.text || ''}
                                  onChange={(e) => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    if (!newItems[idx]) newItems[idx] = {};
                                    newItems[idx].text = e.target.value;
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }}
                                ></textarea>
                                <div>
                                  <label className="block text-[10px] text-slate-500 mb-1">Estrellas (1-5)</label>
                                  <input type="number" min="1" max="5" className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                    value={currentSectionSettings.items?.[idx]?.stars || 5}
                                    onChange={(e) => {
                                      const newItems = [...(currentSectionSettings.items || [])];
                                      if (!newItems[idx]) newItems[idx] = {};
                                      newItems[idx].stars = parseInt(e.target.value);
                                      updateSectionSettings(editingSectionId, { items: newItems });
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                            <button onClick={() => {
                              const newItems = [...(currentSectionSettings.items || []), { author: '', text: '', stars: 5 }];
                              updateSectionSettings(editingSectionId, { items: newItems });
                            }} className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                              <Plus className="w-3 h-3" /> Agregar otra reseña
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'image_gallery' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Galería de imágenes</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title ?? 'Nuestra Galería'}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Galería de Fotos"
                            />
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Imágenes</label>
                            {(currentSectionSettings.items || [{}, {}, {}]).map((item, idx) => (
                              <div key={idx} className="flex flex-col gap-2 p-3 border border-slate-100 bg-slate-50 rounded mb-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[10px] font-bold text-slate-700">Foto {idx + 1}</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...(currentSectionSettings.items || [])];
                                      newItems.splice(idx, 1);
                                      updateSectionSettings(editingSectionId, { items: newItems });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {item.image && (
                                  <div className="w-full h-24 rounded border border-slate-200 overflow-hidden bg-slate-100 mb-1 flex items-center justify-center">
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`upload-gal-${currentEditingSection.id}-${idx}`}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, idx);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`upload-gal-${currentEditingSection.id}-${idx}`).click()}
                                  className="w-full flex items-center justify-center py-1.5 border border-slate-200 bg-white rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx}
                                >
                                  {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx ? 'Subiendo...' : (item.image ? 'Cambiar Foto' : 'Subir Foto')}
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...(currentSectionSettings.items || []), {}];
                                updateSectionSettings(editingSectionId, { items: newItems });
                              }}
                              className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3 h-3" /> Agregar otra foto
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'bg_image_text' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Imagen de fondo con texto</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div className="flex flex-col gap-2 p-2 border border-slate-100 rounded">
                            <h5 className="text-[10px] font-bold text-slate-700">Imagen de Fondo</h5>
                            
                            {/* Preview */}
                            {currentSectionSettings.items?.[0]?.image && (
                              <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                                <img src={currentSectionSettings.items[0].image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            
                            {/* Upload Button */}
                            <input type="file" accept="image/*" className="hidden" id={`upload-bg-${currentEditingSection.id}-0`}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, 0);
                              }}
                            />
                            <button onClick={() => document.getElementById(`upload-bg-${currentEditingSection.id}-0`).click()} className="flex items-center justify-center py-1.5 border border-slate-200 rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0}>
                              {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0 ? 'Subiendo...' : (currentSectionSettings.items?.[0]?.image ? 'Cambiar Imagen' : 'Subir Imagen')}
                            </button>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto principal</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.text || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { text: e.target.value })} />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Descripción</label>
                            <textarea className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.description || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { description: e.target.value })}></textarea>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto del botón</label>
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={currentSectionSettings.buttonText || ''}
                                onChange={(e) => updateSectionSettings(editingSectionId, { buttonText: e.target.value })}
                                placeholder="Acción" />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Link del botón</label>
                              <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={currentSectionSettings.buttonLink || ''}
                                onChange={(e) => updateSectionSettings(editingSectionId, { buttonLink: e.target.value })}
                                placeholder="/productos" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'image_text_button' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Imagen con texto y botón</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          {/* Image preview & upload */}
                          <div className="flex flex-col gap-2 p-2 border border-slate-100 bg-slate-50 rounded">
                            <h5 className="text-[10px] font-bold text-slate-700">Imagen Principal</h5>
                            {currentSectionSettings.items?.[0]?.image && (
                              <div className="w-full h-28 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                                <img src={currentSectionSettings.items[0].image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              id={`upload-itb-${currentEditingSection.id}-0`}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, 0);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById(`upload-itb-${currentEditingSection.id}-0`).click()}
                              className="flex items-center justify-center py-1.5 border border-slate-200 bg-white rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                              disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0}
                            >
                              {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0 ? 'Subiendo...' : (currentSectionSettings.items?.[0]?.image ? 'Cambiar Imagen' : 'Subir Imagen')}
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Calidad que nos distingue"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto descriptivo</label>
                            <textarea
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black h-20"
                              value={currentSectionSettings.text || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { text: e.target.value })}
                              placeholder="Acompañá la imagen con un texto descriptivo..."
                            ></textarea>
                          </div>

                          <div className="flex gap-2">
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Texto del botón</label>
                              <input
                                type="text"
                                className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={currentSectionSettings.buttonText || ''}
                                onChange={(e) => updateSectionSettings(editingSectionId, { buttonText: e.target.value })}
                                placeholder="Ver más"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Link del botón</label>
                              <input
                                type="text"
                                className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                                value={currentSectionSettings.buttonLink || ''}
                                onChange={(e) => updateSectionSettings(editingSectionId, { buttonLink: e.target.value })}
                                placeholder="/productos"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'logos_list' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Lista de logos</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título de la sección</label>
                            <input
                              type="text"
                              className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title ?? 'Marcas que confían en nosotros'}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="Ej: Nuestras Marcas"
                            />
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase">Logos</label>
                            {(currentSectionSettings.items || [{}, {}, {}, {}]).map((logoItem, idx) => (
                              <div key={idx} className="flex flex-col gap-2 p-3 border border-slate-100 bg-slate-50 rounded mb-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-[10px] font-bold text-slate-700">Logo {idx + 1}</h5>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...(currentSectionSettings.items || [])];
                                      newItems.splice(idx, 1);
                                      updateSectionSettings(editingSectionId, { items: newItems });
                                    }}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {logoItem.image && (
                                  <div className="w-full h-16 rounded border border-slate-200 overflow-hidden bg-white mb-1 flex items-center justify-center p-2">
                                    <img src={logoItem.image} alt="" className="max-h-full object-contain" />
                                  </div>
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  id={`upload-logo-${currentEditingSection.id}-${idx}`}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, idx);
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => document.getElementById(`upload-logo-${currentEditingSection.id}-${idx}`).click()}
                                  className="w-full flex items-center justify-center py-1.5 border border-slate-200 bg-white rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx}
                                >
                                  {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === idx ? 'Subiendo...' : (logoItem.image ? 'Cambiar Logo' : 'Subir Logo')}
                                </button>

                                <input
                                  type="text"
                                  className="w-full p-2 border border-slate-200 rounded text-xs text-black bg-white"
                                  placeholder="Link / URL opcional"
                                  value={logoItem.link || ''}
                                  onChange={(e) => {
                                    const newItems = [...(currentSectionSettings.items || [])];
                                    if (!newItems[idx]) newItems[idx] = {};
                                    newItems[idx].link = e.target.value;
                                    updateSectionSettings(editingSectionId, { items: newItems });
                                  }}
                                />
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...(currentSectionSettings.items || []), {}];
                                updateSectionSettings(editingSectionId, { items: newItems });
                              }}
                              className="w-full py-2 border border-dashed border-slate-300 rounded text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                              <Plus className="w-3 h-3" /> Agregar otro logo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'image_timer' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Imagen con temporizador</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div className="flex flex-col gap-2 p-2 border border-slate-100 rounded">
                            <h5 className="text-[10px] font-bold text-slate-700">Imagen de Fondo</h5>
                            
                            {/* Preview */}
                            {currentSectionSettings.items?.[0]?.image && (
                              <div className="w-full h-20 bg-slate-100 rounded flex items-center justify-center overflow-hidden border border-slate-200">
                                <img src={currentSectionSettings.items[0].image} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            
                            {/* Upload Button */}
                            <input type="file" accept="image/*" className="hidden" id={`upload-timer-${currentEditingSection.id}-0`}
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleSectionImageUpload(e.target.files[0], currentEditingSection.id, 0);
                              }}
                            />
                            <button onClick={() => document.getElementById(`upload-timer-${currentEditingSection.id}-0`).click()} className="flex items-center justify-center py-1.5 border border-slate-200 rounded text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50" disabled={uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0}>
                              {uploadingSectionItem?.sectionId === currentEditingSection.id && uploadingSectionItem?.itemIndex === 0 ? 'Subiendo...' : 'Subir Imagen'}
                            </button>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título</label>
                            <input type="text" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.title || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { title: e.target.value })}
                              placeholder="¡Oferta por tiempo limitado!" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Fecha límite (YYYY-MM-DD)</label>
                            <input type="date" className="w-full p-2 border border-slate-200 rounded text-xs text-black"
                              value={currentSectionSettings.endDate || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { endDate: e.target.value })} />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentSectionType === 'html_code' && (
                      <div className="flex flex-col gap-4">
                        <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">Código HTML</h4>
                        <div className="bg-white p-3 rounded border border-slate-200 flex flex-col gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Tu código</label>
                            <textarea className="w-full p-2 border border-slate-200 rounded text-xs font-mono text-black h-32"
                              value={currentSectionSettings.html || ''}
                              onChange={(e) => updateSectionSettings(editingSectionId, { html: e.target.value })}
                              placeholder="<h1>Mi código</h1>"></textarea>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-200">
                    <h4 className="font-bold text-slate-800 text-sm mb-3">Listado de secciones</h4>

                    {(!(themeConfig.pageSections?.[activePage] || []) || (themeConfig.pageSections?.[activePage] || []).length === 0) ? (
                      <div className="text-center py-6 bg-white border border-slate-200 border-dashed rounded mb-4">
                        <p className="text-sm text-slate-500">No tienes secciones.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 mb-4">
                        {(themeConfig.pageSections?.[activePage] || []).map((section, index) => (
                          <div key={section.id} className="bg-white border border-slate-200 rounded p-2 flex items-center justify-between group shadow-sm">
                            <div className="flex items-center gap-2">
                              <div className="flex flex-col">
                                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button onClick={() => moveSection(index, 'down')} disabled={index === (themeConfig.pageSections?.[activePage] || []).length - 1} className="text-slate-300 hover:text-slate-600 disabled:opacity-30">
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                              <span className={`text-sm font-medium ${!section.visible ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{section.title}</span>
                            </div>
                            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => toggleSectionVisibility(index)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title={section.visible ? "Ocultar" : "Mostrar"}>
                                {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button onClick={() => setEditingSectionId(section.id)} className="p-1.5 hover:bg-slate-100 rounded text-blue-500" title="Editar">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => removeSection(index)} className="p-1.5 hover:bg-slate-100 rounded text-red-500" title="Eliminar">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        <p className="text-[10px] text-slate-400 mt-1 italic">Usa las flechas para ordenar las secciones en tu página de inicio.</p>
                      </div>
                    )}

                    <button onClick={() => setIsAddingSection(true)} className="w-full py-2 bg-white border border-[#311b92] text-[#311b92] rounded font-bold text-sm hover:bg-[#311b92] hover:text-white transition-colors mb-6 flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Añadir nueva sección
                    </button>

                    <div className="border-t border-slate-200 pt-4">
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recomendaciones para vos:</h5>
                      <div className="flex flex-col gap-3">
                        <div className="bg-blue-50 border border-blue-100 p-3 rounded cursor-pointer hover:border-blue-300" onClick={() => addSection(CATALOG_SECTIONS.find(s => s.id === 'banners'))}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-blue-900">Opción 1: Banners</span>
                            <Plus className="w-3 h-3 text-blue-600" />
                          </div>
                          <p className="text-[10px] text-blue-700 leading-tight">Sirve para dar a conocer tu marca, promociones y beneficios.</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 p-3 rounded cursor-pointer hover:border-emerald-300" onClick={() => addSection(CATALOG_SECTIONS.find(s => s.id === 'purchase_info'))}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-emerald-900">Opción 2: Información de compra</span>
                            <Plus className="w-3 h-3 text-emerald-600" />
                          </div>
                          <p className="text-[10px] text-emerald-700 leading-tight">Podrás incluir información básica sobre el proceso de compra.</p>
                        </div>
                      </div>
                      <a href="https://blog.mlpadigital.com/ayuda/pagina-de-inicio/" target="_blank" rel="noreferrer" className="block mt-4 text-xs text-blue-600 hover:underline text-center">
                        [Página de Inicio] Ayuda y Tutoriales
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </SidebarSection>
            <SidebarSection icon={ArrowDownToLine} title="Pie de página" isOpen={activeSection === 'footer'} onClick={() => toggleSection('footer')}>
              <div className="space-y-6">
                {/* Imagen del footer */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Imagen</h4>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">Subir tu imagen</label>
                    {themeConfig.footer?.footerImageUrl && (
                      <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded flex justify-center items-center h-20">
                        <img src={themeConfig.footer.footerImageUrl} alt="Footer" className="max-h-full max-w-full object-contain" />
                      </div>
                    )}
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => handleFileUpload(e, 'footerImage')}
                        disabled={isUploadingFooterImage}
                      />
                      <div className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded text-sm text-slate-700 hover:bg-slate-50 transition-colors bg-white">
                        {isUploadingFooterImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{isUploadingFooterImage ? 'Subiendo...' : 'Cargar imagen de la PC'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menús */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Menús</h4>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showMainMenu ?? true}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showMainMenu: e.target.checked })}
                      />
                      <span className="text-sm font-bold text-slate-700">Mostrar menú principal</span>
                    </label>

                    {themeConfig.footer?.showMainMenu !== false && (
                      <div className="pl-6 space-y-3 bg-slate-50 p-3 rounded border border-slate-100">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Título</label>
                          <input
                            type="text"
                            placeholder='Ej: "Páginas"'
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                            value={themeConfig.footer?.mainMenuTitle || ''}
                            onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), mainMenuTitle: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Menú a mostrar</label>
                          <select
                            className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                            value={themeConfig.footer?.mainMenuType || 'main'}
                            onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), mainMenuType: e.target.value })}
                          >
                            <option value="main">Menú principal</option>
                            <option value="secondary">Menú secundario</option>
                            <option value="categories">Categorías</option>
                          </select>
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-2 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showSecondaryMenu ?? false}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showSecondaryMenu: e.target.checked })}
                      />
                      <span className="text-sm font-bold text-slate-700">Mostrar menú secundario</span>
                    </label>
                  </div>
                </div>

                {/* Opciones adicionales */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-[#311b92] uppercase tracking-wider border-b border-slate-200 pb-1">Opciones adicionales</h4>

                  <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showNewsletter ?? true}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showNewsletter: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar newsletter</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showPaymentMethods ?? true}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showPaymentMethods: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar medios de pago</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showShippingMethods ?? true}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showShippingMethods: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar medios de envío</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showContactInfo ?? true}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showContactInfo: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar datos de contacto</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                        checked={themeConfig.footer?.showSocialMedia ?? true}
                        onChange={(e) => updateConfig('footer', { ...(themeConfig.footer || {}), showSocialMedia: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-slate-700">Mostrar redes sociales</span>
                    </label>


                  </div>
                </div>
              </div>
            </SidebarSection>
            <SidebarSection icon={MessageCircle} title="Botón de WhatsApp" isOpen={activeSection === 'whatsapp'} onClick={() => toggleSection('whatsapp')}>
              <div className="space-y-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    checked={themeConfig.whatsapp?.enabled ?? false}
                    onChange={(e) => updateConfig('whatsapp', { ...(themeConfig.whatsapp || {}), enabled: e.target.checked })}
                  />
                  <span className="text-sm font-bold text-slate-700">Mostrar botón de WhatsApp</span>
                </label>

                {themeConfig.whatsapp?.enabled && (
                  <div className="space-y-3 bg-slate-50 p-3 rounded border border-slate-100">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Número de WhatsApp</label>
                      <input
                        type="text"
                        placeholder="Ej: 5491123456789"
                        className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                        value={themeConfig.whatsapp?.number || ''}
                        onChange={(e) => updateConfig('whatsapp', { ...(themeConfig.whatsapp || {}), number: e.target.value })}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Incluir código de país sin el símbolo + ni espacios</p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Mensaje predeterminado</label>
                      <textarea
                        placeholder="Ej: Hola, me gustaría recibir más información."
                        className="w-full p-1.5 border border-slate-300 rounded text-xs text-black resize-none"
                        rows="2"
                        value={themeConfig.whatsapp?.message || ''}
                        onChange={(e) => updateConfig('whatsapp', { ...(themeConfig.whatsapp || {}), message: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Posición</label>
                      <select
                        className="w-full p-1.5 border border-slate-300 rounded text-xs text-black"
                        value={themeConfig.whatsapp?.position || 'right'}
                        onChange={(e) => updateConfig('whatsapp', { ...(themeConfig.whatsapp || {}), position: e.target.value })}
                      >
                        <option value="right">Abajo a la derecha</option>
                        <option value="left">Abajo a la izquierda</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </SidebarSection>
            <SidebarSection icon={Code} title="Edición avanzada de CSS" isOpen={activeSection === 'css'} onClick={() => toggleSection('css')}>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-[#311b92] mb-1">Para diseñadores web</h4>
                  <p className="text-xs text-slate-600 mb-3">
                    Acá podés escribir código CSS para que se muestre en tu sitio web. Esta sección es recomendada solo para quienes tengan conocimiento de CSS.
                  </p>
                </div>
                <div className="relative">
                  <textarea
                    value={themeConfig.customCss || ''}
                    onChange={(e) => updateConfig('customCss', e.target.value)}
                    className="w-full h-64 p-3 font-mono text-xs text-slate-100 bg-[#1e293b] border border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-y"
                    placeholder="/* Escribe tu CSS personalizado aquí */&#10;.mi-clase {&#10;  color: red;&#10;}"
                    spellCheck="false"
                  />
                  <div className="absolute top-2 right-2 flex items-center justify-center p-1.5 bg-slate-800 rounded opacity-50">
                    <Code className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </SidebarSection>
            <SidebarSection icon={RefreshCw} title="Elegir otro diseño" isUpdated onClick={() => navigate('/dashboard/templates')} />
          </div>
        </aside>

        {/* PREVIEW AREA */}
        <main className="flex-1 bg-slate-100 flex justify-center items-start p-6 overflow-hidden relative">
          <div
            className={`bg-white shadow-xl rounded-lg overflow-hidden flex flex-col transition-all duration-300 ${device === 'mobile' ? 'w-[375px] h-[812px]' : 'w-full h-full'
              }`}
          >
            {/* Faux browser header for preview */}
            <div className="bg-slate-200 h-8 flex items-center px-4 gap-2 border-b border-slate-300">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-white/60 text-[10px] text-slate-500 px-4 py-1 rounded-full font-mono flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />vista previa de tu tienda editor de mlpadigital.com/preview/{store?.slug || 'preview'}
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              <iframe
                ref={iframeRef}
                src={previewUrl}
                className="w-full h-full border-none"
                title="Store Preview"
                onLoad={applyStylesToIframe}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Banner Designer Modal */}
      <BannerDesigner
        isOpen={isDesigningBanner}
        onClose={() => setIsDesigningBanner(false)}
        initialImage={designerImageUrl}
        onSave={async (base64Image) => {
          if (bannerDesignTarget !== null) {
            try {
              // 1. Convert Base64 to Blob/File
              const base64Response = await fetch(base64Image);
              const blob = await base64Response.blob();
              const file = new File([blob], `banner-${Date.now()}.png`, { type: 'image/png' });

              // 2. Upload to Supabase Storage
              const filePath = `store-assets/${store?.id}-banner-${Math.random().toString(36).substring(7)}.png`;
              const { error: uploadError } = await supabase.storage
                .from('store-assets')
                .upload(filePath, file);

              if (uploadError) throw uploadError;

              // 3. Get Public URL
              const { data } = supabase.storage
                .from('store-assets')
                .getPublicUrl(filePath);

              const imageUrl = data.publicUrl;

              // 4. Save Public URL to themeConfig
              const newSections = [...(themeConfig.pageSections[activePage] || [])];
              const section = { ...newSections[bannerDesignTarget.sectionIndex] };
              if (!section.settings) section.settings = {};
              if (!section.settings.items) section.settings.items = [{}];

              section.settings.items[bannerDesignTarget.blockIndex] = {
                ...section.settings.items[bannerDesignTarget.blockIndex],
                image: imageUrl
              };
              newSections[bannerDesignTarget.sectionIndex] = section;

              const newConfig = {
                ...themeConfig,
                pageSections: {
                  ...(themeConfig.pageSections || {}),
                  [activePage]: newSections
                }
              };

              setThemeConfig(newConfig);

              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage({
                  type: 'UPDATE_THEME_CONFIG',
                  payload: newConfig
                }, '*');
              }
            } catch (error) {
              console.error("Error uploading designed banner:", error);
              alert("Error al subir el diseño del banner.");
            }
          }
        }}
      />
      <BannerTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelect={(url) => {
          if (!bannerDesignTarget) return;
          const newSections = [...(themeConfig.pageSections[activePage] || [])];
          if (newSections[bannerDesignTarget.sectionIndex]) {
            if (!newSections[bannerDesignTarget.sectionIndex].settings) {
              newSections[bannerDesignTarget.sectionIndex].settings = {};
            }
            if (!newSections[bannerDesignTarget.sectionIndex].settings.items) {
              newSections[bannerDesignTarget.sectionIndex].settings.items = [{}];
            }

            const targetItem = newSections[bannerDesignTarget.sectionIndex].settings.items[bannerDesignTarget.blockIndex] || {};
            newSections[bannerDesignTarget.sectionIndex].settings.items[bannerDesignTarget.blockIndex] = {
              ...targetItem,
              image: url
            };
            updateConfig('pageSections', { ...themeConfig.pageSections, [activePage]: newSections });
          }
          // After selecting a template, open the designer immediately
          setDesignerImageUrl(url);
          setIsDesigningBanner(true);
        }}
      />
    </div>
  );
};

export default ThemeEditor;
