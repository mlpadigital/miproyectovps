import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/customSupabaseClient';
import { Search, Loader2, MapPin, Truck, ExternalLink, Briefcase, Star } from 'lucide-react';

const ML_SITES = [
  { id: 'MLA', name: 'Argentina' },
  { id: 'MLB', name: 'Brasil' },
  { id: 'MLC', name: 'Chile' },
  { id: 'MCO', name: 'Colombia' },
  { id: 'MLM', name: 'México' },
  { id: 'MLU', name: 'Uruguay' },
  { id: 'MLP', name: 'Perú' },
];

const ProvidersSearchPage = () => {
  const [query, setQuery] = useState('');
  const [siteId, setSiteId] = useState('MLA');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const countryMap = { MLA: 'AR', MLB: 'BR', MLC: 'CL', MCO: 'CO', MLM: 'MX', MLU: 'UY', MLP: 'PE' };
      
      let queryBuilder = supabase.from('providers').select('*');
      
      if (siteId) {
        queryBuilder = queryBuilder.eq('country', countryMap[siteId]);
      }
      
      if (query.trim()) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,niche.ilike.%${query}%,description.ilike.%${query}%`);
      }
      
      if (freeShipping) {
        queryBuilder = queryBuilder.eq('free_shipping', true);
      }
      
      if (minPrice) {
        queryBuilder = queryBuilder.gte('price_min', minPrice);
      }
      
      if (maxPrice) {
        queryBuilder = queryBuilder.lte('price_max', maxPrice);
      }

      const { data, error } = await queryBuilder.limit(30);
      
      if (error) throw error;
      
      setResults(data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-600" />
          Buscador de Insumos
        </h1>
        <p className="text-slate-500 mt-2">
          Encontrá los mejores proveedores, materiales y herramientas para tu negocio en tiempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* FILTROS LATERALES */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm shadow-blue-100/50 rounded-2xl overflow-hidden">
            <div className="p-4 bg-blue-600">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4" /> Filtros de Búsqueda
              </h3>
            </div>
            <CardContent className="p-5 space-y-6 bg-white">
              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 uppercase">País de Búsqueda</Label>
                <select 
                  className="w-full flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                >
                  {ML_SITES.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 uppercase">Beneficios</Label>
                <div className="flex items-center justify-between">
                  <Label htmlFor="free-shipping" className="cursor-pointer font-medium text-slate-700">Envío Gratis</Label>
                  <Switch 
                    id="free-shipping" 
                    checked={freeShipping}
                    onCheckedChange={setFreeShipping}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-bold text-slate-500 uppercase">Rango de Precio</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    type="number" 
                    placeholder="Mínimo" 
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    className="h-9 bg-slate-50 border-slate-200"
                  />
                  <Input 
                    type="number" 
                    placeholder="Máximo" 
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    className="h-9 bg-slate-50 border-slate-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RESULTADOS */}
        <div className="lg:col-span-3 space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <Input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="¿Qué insumo necesitas? Ej: telas por metro, cajas de cartón, vinilo..." 
                className="pl-11 h-14 rounded-xl border-slate-200 bg-white text-lg shadow-sm w-full"
              />
            </div>
            <Button type="submit" disabled={loading} className="h-14 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-md transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </Button>
          </form>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
              <p className="font-medium text-lg">Buscando proveedores en tiempo real...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(item => (
                <a 
                  key={item.id} 
                  href={item.contact_url || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col"
                >
                  <div className="aspect-square bg-white relative p-4 flex items-center justify-center border-b border-slate-100">
                    <img 
                      src={item.image_url || 'https://via.placeholder.com/500?text=Proveedor'} 
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.free_shipping && (
                      <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                        <Truck className="w-3 h-3" /> Envío Gratis
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                      <Star className="w-3 h-3 text-amber-400" /> {item.rating}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="text-xs font-bold text-blue-600 mb-1 uppercase tracking-wider">{item.niche}</div>
                    <h3 className="font-bold text-lg text-slate-800 line-clamp-1 leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{item.description}</p>
                    <div className="mt-4">
                      <div className="text-xl font-black text-slate-900">
                        ${item.price_min?.toLocaleString('es-AR')} <span className="text-sm text-slate-400 font-medium">min.</span>
                      </div>
                      
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 font-medium bg-slate-50 p-2 rounded-lg">
                        <MapPin className="w-4 h-4 text-slate-400" /> {item.location}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        Contactar Proveedor <ExternalLink className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <Search className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium text-lg">No encontramos proveedores con esos filtros.</p>
              <p className="text-sm">Probá cambiando las palabras clave o quitando algún filtro de precio.</p>
            </div>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
              <Briefcase className="w-12 h-12 mb-4 text-slate-300" />
              <p className="font-medium text-lg">Escribí el insumo o rubro que estás buscando.</p>
              <p className="text-sm">Te conectamos directamente con publicaciones activas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProvidersSearchPage;
