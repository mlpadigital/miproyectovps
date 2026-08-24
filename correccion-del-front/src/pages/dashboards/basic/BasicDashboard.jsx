import React from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import SubdomainConfig from '@/components/dashboard/SubdomainConfig';
import StorePreview from '@/components/dashboard/StorePreview';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowUpCircle, ShoppingBag, AlertCircle, Eye, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BasicDashboard = () => {
  const { store } = useOutletContext();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Upsell Banner for Basic Users */}
      <Alert className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <ArrowUpCircle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800 font-semibold">Desbloquea más potencial</AlertTitle>
        <AlertDescription className="text-amber-700">
          Estás en el plan Básico. Actualiza al plan Emprendedor para obtener análisis avanzados y soporte prioritario.
        </AlertDescription>
        <Button
          size="sm"
          onClick={() => navigate('/dashboard/billing')}
          className="mt-3 bg-amber-500 hover:bg-amber-600 border-none text-white cursor-pointer"
        >
          Ver Planes
        </Button>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Config Column */}
        <div className="lg:col-span-2 space-y-8">
          <SubdomainConfig />

          {/* Live Store Preview Section */}
          {store && (
            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-slate-900">
                      <Eye className="w-5 h-5 text-violet-600" /> Vista Previa de tu Tienda
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Así es como tus clientes ven tu tienda actualmente. Se actualiza en tiempo real.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to="/dashboard/appearance">
                      <Button variant="outline" size="sm">
                        Editar Diseño
                      </Button>
                    </Link>
                    <Link to="/builder">
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
                        <Wand2 className="w-3.5 h-3.5" /> Builder
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 bg-slate-50/50">
                <StorePreview storeId={store.id} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-500" /> Mis Productos
              </CardTitle>
              <CardDescription>Gestiona el inventario de tu tienda básica (Límite: 10 items).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-slate-500 mb-4">Aún no has agregado productos.</p>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard/products')}
                  className="cursor-pointer"
                >
                  Agregar Producto
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base">Estado del Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Límite de Productos</span>
                <span className="font-medium">0 / 10</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Ancho de Banda</span>
                <span className="font-medium">Ilimitado</span>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <AlertCircle className="w-3 h-3 text-slate-400" />
                  Soporte por email disponible 24/48h
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-50">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Herramientas Gratuitas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/ai-background-remover')}
                className="w-full text-left p-3 rounded-lg bg-white hover:bg-indigo-50/60 transition-colors flex items-center gap-3 border border-slate-100 group cursor-pointer shadow-sm"
              >
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Quita Fondos IA</div>
                  <div className="text-xs text-slate-500">Elimina el fondo de tus imágenes gratis</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BasicDashboard;