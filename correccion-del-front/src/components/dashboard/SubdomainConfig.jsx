import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Globe, Save, Loader2, ExternalLink, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

const SubdomainConfig = () => {
  const { user } = useSupabaseAuth();
  const contextData = useOutletContext() || {};
  const { toast } = useToast();

  const [store, setStore] = useState(contextData.store || null);
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(!contextData.store);
  const [saving, setSaving] = useState(false);
  const [lastError, setLastError] = useState(null);

  // Sincronizar store desde el Contexto o hacer fetch si no estuviera disponible
  useEffect(() => {
    if (contextData.store) {
      setStore(contextData.store);
      setSubdomain(contextData.store.subdomain || '');
      setLoading(false);
      return;
    }

    const fetchStore = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (data) {
          setStore(data);
          setSubdomain(data.subdomain || '');
        }
      } catch (err) {
        console.error('Error cargando tienda:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [user, contextData.store]);

  const handleSave = async () => {
    setLastError(null);

    // Client-side Validation
    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanSubdomain.length < 3) {
      toast({
        variant: "destructive",
        title: "Subdominio inválido",
        description: "El subdominio debe tener al menos 3 caracteres.",
      });
      return;
    }

    setSaving(true);

    try {
      console.log("Invoking 'create-subdomain' with:", cleanSubdomain);

      // 1. Invocar la Edge Function para Hostinger / DNS
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-subdomain', {
        body: { subdomain: cleanSubdomain }
      });

      // Network or System Errors (Supabase layer)
      if (functionError) {
        console.error('Supabase Invoke Error:', functionError);
        throw new Error(functionError.message || "Error de conexión con el servidor de dominios.");
      }

      // Application Errors (Logic or Hostinger API layer)
      if (functionData && functionData.error) {
        console.error('Hostinger Logic Error:', functionData.error);
        throw new Error(functionData.error);
      }

      // 2. Actualizar o Insertar en la Base de Datos al confirmar el DNS
      if (store?.id) {
        const { error: dbError } = await supabase
          .from('stores')
          .update({ subdomain: cleanSubdomain, updated_at: new Date().toISOString() })
          .eq('id', store.id);

        if (dbError) throw dbError;
        setStore({ ...store, subdomain: cleanSubdomain });
      } else {
        const { data: newStore, error: dbError } = await supabase
          .from('stores')
          .insert([{ owner_id: user.id, name: 'Mi Tienda', subdomain: cleanSubdomain }])
          .select()
          .single();

        if (dbError) throw dbError;
        setStore(newStore);
      }

      toast({
        title: "¡Subdominio Creado!",
        description: `Tu tienda está activa en https://${cleanSubdomain}.mlpadigital.com`,
        className: "bg-emerald-600 text-white border-emerald-500"
      });

    } catch (error) {
      console.error('Full Process Error:', error);
      setLastError(error.message);

      toast({
        variant: "destructive",
        title: "Error al crear subdominio",
        description: error.message || "Revisá la consola para más detalles.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="animate-spin text-violet-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl mx-auto mt-6">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Globe className="w-5 h-5 text-violet-600" /> Configuración de Dominio
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Definí la dirección web donde tus clientes encontrarán tu tienda online.
        </p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <Label className="text-slate-700 font-medium">Subdominio Deseado</Label>
          <div className="flex mt-2 shadow-sm group focus-within:ring-2 focus-within:ring-violet-500/20 rounded-md transition-all">
            <Input
              value={subdomain}
              onChange={(e) => setSubdomain(e.target.value)}
              className="rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0 z-10 border-slate-300 h-12 text-base"
              placeholder="mi-marca"
              disabled={saving}
            />
            <div className="bg-slate-100 border border-l-0 border-slate-300 px-4 flex items-center text-slate-500 text-sm font-medium rounded-r-md select-none whitespace-nowrap">
              .mlpadigital.com
            </div>
          </div>

          {/* Reglas de Validación */}
          <div className="flex items-start gap-2 mt-3 text-xs text-slate-500">
            <AlertCircle className="w-3 h-3 mt-0.5 text-blue-500 shrink-0" />
            <p>Solo letras minúsculas, números y guiones (-). No uses espacios ni caracteres especiales.</p>
          </div>

          {/* Muestreo de Errores */}
          {lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-sm text-red-600">
              <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="flex flex-col">
                <span className="font-semibold">El registro falló:</span>
                <span>{lastError}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {store?.subdomain ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Actual:</span>
              <a
                href={`https://${store.subdomain}.mlpadigital.com`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-md border border-emerald-100 hover:border-emerald-200 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {store.subdomain}.mlpadigital.com <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          ) : (
            <span className="text-sm text-slate-400 italic flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
              Sin dominio configurado
            </span>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !subdomain}
            className="bg-violet-600 hover:bg-violet-700 text-white min-w-[140px]"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Dominio
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-3">
          Dominio Personalizado PRO
        </h4>
        {store?.custom_domain ? (
          <div className="flex flex-col gap-2 text-sm">
            <span className="text-slate-500">Tu tienda también está configurada y responde en:</span>
            <a
              href={`https://${store.custom_domain}`}
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-md border border-indigo-100 hover:border-indigo-200 transition-all w-fit"
            >
              <CheckCircle2 className="w-4 h-4" />
              www.{store.custom_domain} <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        ) : (
          <div className="text-sm text-slate-600 bg-slate-100/80 p-4 rounded-md border border-slate-200">
            <p>¿Querés usar tu propio dominio web (ej. <strong>www.mitienda.com</strong>) en lugar de un subdominio?</p>
            <p className="mt-2">Nosotros nos encargamos de registrarlo, configurarlo en los DNS e instalarle el certificado de seguridad SSL por vos.</p>
            <p className="mt-2 font-medium text-slate-800">¡Contactanos para solicitar y activar tu dominio personalizado!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubdomainConfig;