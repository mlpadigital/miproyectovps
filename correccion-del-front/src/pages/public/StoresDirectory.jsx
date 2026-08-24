import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { Link } from 'react-router-dom';
import { Store, ArrowRight, Loader2, Search } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Input } from '@/components/ui/input';

const StoresDirectory = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true);
        // Obtener tiendas que tienen subdominio o dominio personalizado
        const { data, error } = await supabase
          .from('stores')
          .select('id, name, subdomain, logo_url, browser_title')
          .not('subdomain', 'is', null);

        if (error) throw error;
        setStores(data || []);
      } catch (err) {
        console.error('Error fetching stores directory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  const getStoreUrl = (store) => {
    if (store.custom_domain) return `https://${store.custom_domain}`;
    return `https://${store.subdomain}.mlpadigital.com`;
  };

  const filteredStores = stores.filter(store => 
    store.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    store.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Directorio de Tiendas | MLPA Digital</title>
        <meta name="description" content="Descubre todas las tiendas creadas con MLPA Digital. Encuentra los mejores productos y emprendedores." />
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Link to="/" className="inline-block mb-6">
            <span className="text-2xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              MLPA Digital
            </span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Descubre Nuestras Tiendas
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mb-8">
            Explora cientos de negocios y emprendedores que ya están vendiendo online gracias a MLPA Digital.
          </p>
          
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input 
              type="text" 
              placeholder="Buscar tiendas..." 
              className="pl-10 h-12 rounded-full border-slate-300 shadow-sm text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Directory Grid */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-violet-600 mb-4" />
            <p className="text-slate-500 font-medium">Cargando directorio de tiendas...</p>
          </div>
        ) : filteredStores.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">No se encontraron tiendas</h3>
            <p className="text-slate-500 mt-2">Intenta buscar con otras palabras.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStores.map(store => (
              <a 
                key={store.id} 
                href={getStoreUrl(store)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full"
              >
                <div className="aspect-[2/1] bg-slate-100 flex items-center justify-center border-b border-slate-100 p-4 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="max-h-full max-w-full object-contain relative z-0" />
                  ) : (
                    <Store className="w-12 h-12 text-slate-300" />
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-violet-600 transition-colors line-clamp-1">
                    {store.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2 flex-1">
                    {store.browser_title || 'Visita nuestra tienda para descubrir nuestros productos.'}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center text-sm font-semibold text-violet-600 group-hover:text-violet-700">
                    Visitar tienda <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default StoresDirectory;
