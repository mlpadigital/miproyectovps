import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import SubdomainConfig from '@/components/dashboard/SubdomainConfig';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Store, CreditCard, Truck, Loader2, Save, Share2, Copy, CheckCircle2, Upload, MessageCircle, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const SettingsPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const [cartConfigId, setCartConfigId] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  // Formularios de estado
  const [general, setGeneral] = useState({
    name: '',
    subdomain: '',
    logo_url: '',
    favicon_url: '',
    browser_title: '',
    email: '',
    address: '',
    origin_zipcode: '',
    social_links: {
      instagram: '',
      facebook: '',
      tiktok: '',
      youtube: '',
      x: '',
      pinterest: ''
    }
  });
  const [copiedLink, setCopiedLink] = useState(false);
  
  const [payments, setPayments] = useState({
    transfer: { enabled: false, value: '', name: 'Transferencia / Billetera Virtual (Alias o CBU)' },
    paypal: { enabled: false, value: '', name: 'Enlace de PayPal (PayPal.me)' },
    payoneer: { enabled: false, value: '', name: 'Correo/Enlace de Payoneer' },
    mercadopago_auto: { enabled: false, value: '', name: 'Mercado Pago Automático' }
  });

  const [shipping, setShipping] = useState({
    pickup: { enabled: false, address: '' },
    delivery: { enabled: false, cost: 0, freeThreshold: 0 },
    oca: { enabled: false, cost: 0 },
    correo_argentino: { enabled: false, cost: 0 },
    andreani: { enabled: false, cost: 0 },
    other: { enabled: false, name: '', cost: 0 }
  });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // 1. Obtener la tienda
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id, name, subdomain, logo_url, favicon_url, browser_title, support_email, address, origin_zipcode, social_links')
        .eq('owner_id', user.id)
        .limit(1).single();

      if (storeError) throw storeError;
      setStoreId(storeData.id);
      setGeneral(prev => ({ 
        ...prev, 
        name: storeData.name || '', 
        subdomain: storeData.subdomain || '',
        logo_url: storeData.logo_url || '',
        favicon_url: storeData.favicon_url || '',
        browser_title: storeData.browser_title || '',
        email: storeData.support_email || '',
        address: storeData.address || '',
        origin_zipcode: storeData.origin_zipcode || '',
        social_links: storeData.social_links || {
          instagram: '', facebook: '', tiktok: '', youtube: '', x: '', pinterest: ''
        }
      }));

      // 2. Obtener o crear cart_config
      let { data: cartData } = await supabase
        .from('cart_config')
        .select('id')
        .eq('store_id', storeData.id)
        .limit(1).single();

      if (!cartData) {
        const { data: newCart, error: insertCartError } = await supabase
          .from('cart_config')
          .insert({ store_id: storeData.id, enabled: true })
          .select('id').single();
          
        if (insertCartError && insertCartError.code !== '42P01') {
          throw insertCartError;
        }
        cartData = newCart;
      }
      
      if (cartData) {
        setCartConfigId(cartData.id);

        // 3. Obtener métodos de pago
        const { data: payData } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('cart_config_id', cartData.id);

        if (payData && payData.length > 0) {
          const newPayments = { ...payments };
          payData.forEach(p => {
            if (p.provider === 'transfer' || p.provider === 'alias') newPayments.transfer = { enabled: p.enabled, value: p.config?.value || '', name: p.display_name };
            if (p.provider === 'paypal') newPayments.paypal = { enabled: p.enabled, value: p.config?.value || '', name: p.display_name };
            if (p.provider === 'payoneer') newPayments.payoneer = { enabled: p.enabled, value: p.config?.value || '', name: p.display_name };
            if (p.provider === 'mercadopago_auto') newPayments.mercadopago_auto = { enabled: p.enabled, value: p.config?.value || '', name: p.display_name };
          });
          setPayments(newPayments);
        }

        // 4. Obtener zonas de envío
        const { data: shipData } = await supabase
          .from('shipping_zones')
          .select('*')
          .eq('cart_config_id', cartData.id);

        if (shipData && shipData.length > 0) {
          const newShipping = { ...shipping };
          shipData.forEach(s => {
            const stateStr = Array.isArray(s.states) ? s.states[0] : s.states;
            if (s.name === 'pickup') newShipping.pickup = { enabled: s.cost === 0, address: stateStr || '' };
            if (s.name === 'delivery') newShipping.delivery = { enabled: s.cost > -1, cost: s.cost || 0, freeThreshold: 0 };
            if (s.name === 'oca') newShipping.oca = { enabled: s.cost > -1, cost: s.cost || 0 };
            if (s.name === 'correo_argentino') newShipping.correo_argentino = { enabled: s.cost > -1, cost: s.cost || 0 };
            if (s.name === 'andreani') newShipping.andreani = { enabled: s.cost > -1, cost: s.cost || 0 };
            if (s.name === 'other') newShipping.other = { enabled: s.cost > -1, cost: s.cost || 0, name: stateStr || '' };
          });
          setShipping(newShipping);
        }
      }

    } catch (error) {
      console.error('Error loading settings:', error);
      // No cortamos la ejecución para permitir que la UI cargue, 
      // si faltan tablas en la DB se usarán los defaults y fallará al guardar (mostrando toast).
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (event, field, setUploadingState) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];
      setUploadingState(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${storeId}_${field}_${Math.random()}.${fileExt}`;
      const filePath = `store_assets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('store-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('store-assets').getPublicUrl(filePath);
      
      setGeneral(prev => ({ ...prev, [field]: data.publicUrl }));
      toast({ title: "Imagen subida", description: "La imagen se subió correctamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Error al subir la imagen.", variant: "destructive" });
    } finally {
      setUploadingState(false);
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    try {
      const { data: currentStore } = await supabase
        .from('stores')
        .select('theme_config, design_config')
        .eq('id', storeId)
        .single();

      let updatedThemeConfig = currentStore?.theme_config || {};
      let updatedDesignConfig = currentStore?.design_config || {};

      if (updatedThemeConfig) {
        updatedThemeConfig.storeTitle = general.name;
        if (updatedThemeConfig.sections?.logoTitle && updatedThemeConfig.sections.logoTitle.toLowerCase() === 'mi tienda') {
          updatedThemeConfig.sections.logoTitle = general.name;
        }
      }

      if (updatedDesignConfig) {
        if (updatedDesignConfig.sections) {
          if (!updatedDesignConfig.sections.logoTitle || updatedDesignConfig.sections.logoTitle.toLowerCase() === 'mi tienda') {
            updatedDesignConfig.sections.logoTitle = general.name;
          }
          if (updatedDesignConfig.sections.logoSubtitle && updatedDesignConfig.sections.logoSubtitle.toLowerCase() === 'la mejor') {
            updatedDesignConfig.sections.logoSubtitle = '';
          }
        }
      }

      const { error } = await supabase.from('stores').update({
        name: general.name,
        browser_title: general.browser_title,
        logo_url: general.logo_url,
        favicon_url: general.favicon_url,
        support_email: general.email,
        address: general.address,
        origin_zipcode: general.origin_zipcode,
        social_links: general.social_links,
        theme_config: updatedThemeConfig,
        design_config: updatedDesignConfig
      }).eq('id', storeId);

      if (error) throw error;
      toast({ title: "Guardado exitoso", description: "Los detalles de la tienda han sido actualizados." });
      
      // Reload to reflect changes in the sidebar logo (miniatura) and other global components
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "No se pudieron guardar los detalles.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePayments = async () => {
    if (!cartConfigId) {
      toast({ title: "Error", description: "Configuración de carrito no inicializada.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const methods = [
        { cart_config_id: cartConfigId, provider: 'transfer', display_name: payments.transfer.name, enabled: payments.transfer.enabled, config: { value: payments.transfer.value } },
        { cart_config_id: cartConfigId, provider: 'paypal', display_name: payments.paypal.name, enabled: payments.paypal.enabled, config: { value: payments.paypal.value } },
        { cart_config_id: cartConfigId, provider: 'payoneer', display_name: payments.payoneer.name, enabled: payments.payoneer.enabled, config: { value: payments.payoneer.value } },
        { cart_config_id: cartConfigId, provider: 'mercadopago_auto', display_name: payments.mercadopago_auto.name, enabled: payments.mercadopago_auto.enabled, config: { value: payments.mercadopago_auto.value } },
      ];

      for (const method of methods) {
        const { data: existing } = await supabase
          .from('payment_methods')
          .select('id')
          .eq('cart_config_id', cartConfigId)
          .eq('provider', method.provider)
          .maybeSingle();

        let err;
        if (existing) {
          const { error } = await supabase.from('payment_methods').update(method).eq('id', existing.id);
          err = error;
        } else {
          const { error } = await supabase.from('payment_methods').insert(method);
          err = error;
        }
        if (err) throw err;
      }

      toast({ title: "Guardado exitoso", description: "Métodos de pago actualizados correctamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron guardar los métodos de pago.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShipping = async () => {
    if (!cartConfigId) return;
    setSaving(true);
    try {
      const zones = [
        { cart_config_id: cartConfigId, name: 'pickup', cost: shipping.pickup.enabled ? 0 : -1, states: shipping.pickup.address ? [shipping.pickup.address] : [] },
        { cart_config_id: cartConfigId, name: 'delivery', cost: shipping.delivery.enabled ? Number(shipping.delivery.cost) || 0 : -1 },
        { cart_config_id: cartConfigId, name: 'oca', cost: shipping.oca.enabled ? Number(shipping.oca.cost) || 0 : -1 },
        { cart_config_id: cartConfigId, name: 'correo_argentino', cost: shipping.correo_argentino.enabled ? Number(shipping.correo_argentino.cost) || 0 : -1 },
        { cart_config_id: cartConfigId, name: 'andreani', cost: shipping.andreani.enabled ? Number(shipping.andreani.cost) || 0 : -1 },
        { cart_config_id: cartConfigId, name: 'other', cost: shipping.other.enabled ? Number(shipping.other.cost) || 0 : -1, states: shipping.other.name ? [shipping.other.name] : [] }
      ];

      for (const zone of zones) {
        const { data: existing } = await supabase
          .from('shipping_zones')
          .select('id')
          .eq('cart_config_id', cartConfigId)
          .eq('name', zone.name)
          .maybeSingle();

        let err;
        if (existing) {
          const { error } = await supabase.from('shipping_zones').update(zone).eq('id', existing.id);
          err = error;
        } else {
          const { error } = await supabase.from('shipping_zones').insert(zone);
          err = error;
        }
        if (err) throw err;
      }

      toast({ title: "Guardado exitoso", description: "Opciones de envío actualizadas correctamente." });
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "No se pudieron guardar los métodos de envío.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración de la Tienda</h1>
        <p className="text-slate-500">Administra el checkout, métodos de pago y conectividad de tu negocio.</p>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="general"><Store className="w-4 h-4 mr-2" /> General</TabsTrigger>
          <TabsTrigger value="payments"><CreditCard className="w-4 h-4 mr-2" /> Pagos</TabsTrigger>
          <TabsTrigger value="shipping"><Truck className="w-4 h-4 mr-2" /> Envíos</TabsTrigger>
          <TabsTrigger value="integrations"><Share2 className="w-4 h-4 mr-2" /> Integraciones</TabsTrigger>
        </TabsList>

        {/* GENERAL TAB */}
        <TabsContent value="general" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Dominio y Conectividad</CardTitle>
              <CardDescription>Configura tu dirección web para que tus clientes te encuentren fácilmente.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubdomainConfig />
            </CardContent>
          </Card>

            {/* Section: General Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Información General</h3>
                  <p className="text-xs text-slate-500">Los detalles básicos de tu tienda.</p>
                </div>
                <button 
                  onClick={handleSaveGeneral} 
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-70 shadow-sm"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Nombre de la Tienda</Label>
                    <Input 
                      value={general.name} 
                      onChange={(e) => setGeneral({ ...general, name: e.target.value })}
                      className="border-slate-300 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Subdominio (url)</Label>
                    <div className="flex rounded-md shadow-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                        https://
                      </span>
                      <Input 
                        value={general.subdomain}
                        onChange={(e) => setGeneral({ ...general, subdomain: e.target.value })}
                        className="rounded-none border-slate-300 focus:border-indigo-500 z-10"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                        .mlpadigital.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Email de Soporte</Label>
                    <Input 
                      value={general.email}
                      onChange={(e) => setGeneral({ ...general, email: e.target.value })}
                      placeholder="hola@tutienda.com"
                      className="border-slate-300 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Título del Buscador (SEO)</Label>
                    <Input 
                      value={general.browser_title}
                      onChange={(e) => setGeneral({ ...general, browser_title: e.target.value })}
                      placeholder="Mi Tienda | Venta de ropa"
                      className="border-slate-300 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Social Media */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Redes Sociales</h3>
                  <p className="text-xs text-slate-500">Aparecerán como enlaces clicables en tu tienda online.</p>
                </div>
                <button 
                  onClick={handleSaveGeneral} 
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-70 shadow-sm"
                >
                  {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Redes
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-700">Instagram</Label>
                    <Input 
                      placeholder="https://www.instagram.com/tu_perfil/"
                      value={general.social_links?.instagram || ''} 
                      onChange={(e) => setGeneral({ ...general, social_links: { ...general.social_links, instagram: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Facebook</Label>
                    <Input 
                      placeholder="https://www.facebook.com/tu_pagina"
                      value={general.social_links?.facebook || ''} 
                      onChange={(e) => setGeneral({ ...general, social_links: { ...general.social_links, facebook: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">TikTok</Label>
                    <Input 
                      placeholder="https://www.tiktok.com/@tu_perfil"
                      value={general.social_links?.tiktok || ''} 
                      onChange={(e) => setGeneral({ ...general, social_links: { ...general.social_links, tiktok: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">YouTube</Label>
                    <Input 
                      placeholder="https://www.youtube.com/c/tu_canal"
                      value={general.social_links?.youtube || ''} 
                      onChange={(e) => setGeneral({ ...general, social_links: { ...general.social_links, youtube: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">X (Twitter)</Label>
                    <Input 
                      placeholder="https://x.com/tu_perfil"
                      value={general.social_links?.x || ''} 
                      onChange={(e) => setGeneral({ ...general, social_links: { ...general.social_links, x: e.target.value } })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-700">Pinterest</Label>
                    <Input 
                      placeholder="https://www.pinterest.com/tu_perfil/"
                      value={general.social_links?.pinterest || ''} 
                      onChange={(e) => setGeneral({ ...general, social_links: { ...general.social_links, pinterest: e.target.value } })}
                    />
                  </div>
                </div>
              </div>
            </div>
        </TabsContent>

        {/* INTEGRATIONS TAB */}
        <TabsContent value="integrations" className="space-y-6 mt-0">
          <Card className="border-violet-200 shadow-sm">
            <CardHeader className="bg-violet-50/50 pb-4">
              <CardTitle className="text-violet-900 flex items-center">
                <Share2 className="w-5 h-5 mr-2 text-violet-600" />
                Catálogo para WhatsApp y Facebook
              </CardTitle>
              <CardDescription>
                Conecta automáticamente todos tus productos con Meta Commerce Manager para vender por WhatsApp Business, Instagram Shopping y Facebook.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="bg-slate-50 border rounded-lg p-4 text-sm text-slate-700">
                <p className="mb-2 font-medium">¿Cómo funciona?</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Entrá a tu <a href="https://business.facebook.com/commerce" target="_blank" rel="noreferrer" className="text-violet-600 hover:underline">Commerce Manager de Meta</a>.</li>
                  <li>Ve a <strong>Orígenes de Datos (Data Sources)</strong> y selecciona <strong>Data Feed (Feed de Datos)</strong>.</li>
                  <li>Elige la opción de actualización programada y pega el siguiente enlace exacto:</li>
                </ol>
              </div>
              
              <div className="mt-4">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Tu Enlace de Catálogo XML</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    readOnly
                    className="font-mono text-xs bg-slate-100 border-slate-200 text-slate-600 focus-visible:ring-0"
                    value={general.subdomain ? `https://nvwigepphqybmjscdynw.supabase.co/functions/v1/meta-catalog?store=${general.subdomain}` : 'Cargando...'}
                  />
                  <Button 
                    variant="outline" 
                    className="flex-shrink-0"
                    disabled={!general.subdomain}
                    onClick={() => {
                      navigator.clipboard.writeText(`https://nvwigepphqybmjscdynw.supabase.co/functions/v1/meta-catalog?store=${general.subdomain}`);
                      setCopiedLink(true);
                      toast({ title: "Enlace Copiado", description: "Pégalo en tu Commerce Manager de Meta." });
                      setTimeout(() => setCopiedLink(false), 3000);
                    }}
                  >
                    {copiedLink ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">
                  * Este feed se actualiza en tiempo real. Si desactivás un producto, se borrará automáticamente de WhatsApp.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PAYMENTS TAB */}
        <TabsContent value="payments" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Configura cómo recibirás el dinero de tus ventas. Proporciona tus alias o enlaces directos de pago.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Alias / Transferencia */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Transferencia / Billetera Virtual</Label>
                    <p className="text-sm text-slate-500">MercadoPago, Ualá, Banco, etc.</p>
                  </div>
                  <Switch 
                    checked={payments.transfer.enabled} 
                    onCheckedChange={c => setPayments(p => ({...p, transfer: {...p.transfer, enabled: c}}))} 
                  />
                </div>
                {payments.transfer.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Tu ALIAS o CBU</Label>
                      <Input 
                        placeholder="ej: mitienda.mp" 
                        value={payments.transfer.value}
                        onChange={e => setPayments(p => ({...p, transfer: {...p.transfer, value: e.target.value}}))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Mercado Pago Automático */}
              <div className={`p-4 border rounded-xl transition-colors ${payments.mercadopago_auto.enabled ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-200 bg-white'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-slate-800">Mercado Pago Automático</h3>
                    <p className="text-sm text-slate-500">Checkout automático y actualización de pago (Vía Access Token).</p>
                  </div>
                  <Switch 
                    checked={payments.mercadopago_auto.enabled} 
                    onCheckedChange={c => setPayments(p => ({...p, mercadopago_auto: {...p.mercadopago_auto, enabled: c}}))} 
                  />
                </div>
                {payments.mercadopago_auto.enabled && (
                  <div className="space-y-4 pt-4">
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-2">
                      <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> ¿Cómo obtener tu Access Token?
                      </h4>
                      <ol className="list-decimal pl-5 text-sm text-blue-700 space-y-1">
                        <li>Ingresa a <a href="https://www.mercadopago.com.ar/developers/panel/applications" target="_blank" rel="noreferrer" className="underline font-bold">Mis Integraciones (Mercado Pago Developers)</a> con tu cuenta.</li>
                        <li>Haz clic en <b>"Crear Aplicación"</b> (Nombre: "Mi Tienda", Producto: "Checkout Pro", Plataforma: "Otra").</li>
                        <li>Una vez creada, entra a la aplicación y ve a <b>"Credenciales de Producción"</b>.</li>
                        <li>Copia el <b>"Access Token"</b> (comienza con <code className="bg-blue-100 px-1 py-0.5 rounded">APP_USR-</code>) y pégalo debajo.</li>
                      </ol>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Access Token de Producción</Label>
                      <Input 
                        placeholder="APP_USR-123456789-..." 
                        type="password"
                        value={payments.mercadopago_auto.value}
                        onChange={e => setPayments(p => ({...p, mercadopago_auto: {...p.mercadopago_auto, value: e.target.value}}))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PayPal */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">PayPal</Label>
                    <p className="text-sm text-slate-500">Recibe pagos internacionales</p>
                  </div>
                  <Switch 
                    checked={payments.paypal.enabled} 
                    onCheckedChange={c => setPayments(p => ({...p, paypal: {...p.paypal, enabled: c}}))} 
                  />
                </div>
                {payments.paypal.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Enlace de PayPal.me</Label>
                      <Input 
                        placeholder="https://paypal.me/usuario" 
                        value={payments.paypal.value}
                        onChange={e => setPayments(p => ({...p, paypal: {...p.paypal, value: e.target.value}}))}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Payoneer */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Payoneer</Label>
                    <p className="text-sm text-slate-500">Para clientes B2B en USD</p>
                  </div>
                  <Switch 
                    checked={payments.payoneer.enabled} 
                    onCheckedChange={c => setPayments(p => ({...p, payoneer: {...p.payoneer, enabled: c}}))} 
                  />
                </div>
                {payments.payoneer.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Correo electrónico asociado a Payoneer</Label>
                      <Input 
                        placeholder="pagos@mitienda.com" 
                        value={payments.payoneer.value}
                        onChange={e => setPayments(p => ({...p, payoneer: {...p.payoneer, value: e.target.value}}))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSavePayments} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Métodos de Pago
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SHIPPING TAB */}
        <TabsContent value="shipping" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Opciones de Entrega</CardTitle>
              <CardDescription>Configura cómo los clientes recibirán sus compras.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Local Pickup */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Retiro en Sucursal / Local</Label>
                    <p className="text-sm text-slate-500">Permite al cliente pasar a buscar su compra gratis.</p>
                  </div>
                  <Switch 
                    checked={shipping.pickup.enabled} 
                    onCheckedChange={c => setShipping(s => ({...s, pickup: {...s.pickup, enabled: c}}))} 
                  />
                </div>
                {shipping.pickup.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Dirección y horarios de retiro</Label>
                      <Input 
                        placeholder="Ej: Av. Principal 123. Lunes a Viernes de 10 a 18hs." 
                        value={shipping.pickup.address}
                        onChange={e => setShipping(s => ({...s, pickup: {...s.pickup, address: e.target.value}}))}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Delivery */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Envío a Domicilio (Costo Fijo)</Label>
                    <p className="text-sm text-slate-500">Cobra un valor único por llevar los paquetes dentro de tu zona.</p>
                  </div>
                  <Switch 
                    checked={shipping.delivery.enabled} 
                    onCheckedChange={c => setShipping(s => ({...s, delivery: {...s.delivery, enabled: c}}))} 
                  />
                </div>
                {shipping.delivery.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Costo de Envío ($)</Label>
                      <Input 
                        type="number"
                        placeholder="Ej: 3500" 
                        value={shipping.delivery.cost}
                        onChange={e => setShipping(s => ({...s, delivery: {...s.delivery, cost: e.target.value}}))}
                        className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    {/* Placeholder for future: Free threshold */}
                  </div>
                )}
              </div>

              {/* OCA */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Envío por OCA</Label>
                    <p className="text-sm text-slate-500">Activá esta opción para que el costo se calcule automáticamente en el checkout.</p>
                  </div>
                  <Switch 
                    checked={shipping.oca.enabled} 
                    onCheckedChange={c => setShipping(s => ({...s, oca: {...s.oca, enabled: c}}))} 
                  />
                </div>
              </div>

              {/* Correo Argentino */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Envío por Correo Argentino</Label>
                    <p className="text-sm text-slate-500">Activá esta opción para que el costo se calcule automáticamente en el checkout.</p>
                  </div>
                  <Switch 
                    checked={shipping.correo_argentino.enabled} 
                    onCheckedChange={c => setShipping(s => ({...s, correo_argentino: {...s.correo_argentino, enabled: c}}))} 
                  />
                </div>
              </div>

              {/* Andreani */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Envío por Andreani</Label>
                    <p className="text-sm text-slate-500">Tarifa plana de envío mediante Andreani.</p>
                  </div>
                  <Switch 
                    checked={shipping.andreani.enabled} 
                    onCheckedChange={c => setShipping(s => ({...s, andreani: {...s.andreani, enabled: c}}))} 
                  />
                </div>
              </div>

              {/* Other Correo */}
              <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-slate-900">Otro Correo Personalizado</Label>
                    <p className="text-sm text-slate-500">Tarifa plana para otro método de envío (Ej: Urbano, Mensajería).</p>
                  </div>
                  <Switch 
                    checked={shipping.other.enabled} 
                    onCheckedChange={c => setShipping(s => ({...s, other: {...s.other, enabled: c}}))} 
                  />
                </div>
                {shipping.other.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre del Correo</Label>
                      <Input 
                        placeholder="Ej: Mensajería Privada" 
                        value={shipping.other.name}
                        onChange={e => setShipping(s => ({...s, other: {...s.other, name: e.target.value}}))}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Costo de Envío ($)</Label>
                      <Input 
                        type="number"
                        placeholder="Ej: 3000" 
                        value={shipping.other.cost}
                        onChange={e => setShipping(s => ({...s, other: {...s.other, cost: e.target.value}}))}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveShipping} disabled={saving} className="bg-violet-600 hover:bg-violet-700 text-white">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Guardar Opciones de Entrega
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default SettingsPage;
