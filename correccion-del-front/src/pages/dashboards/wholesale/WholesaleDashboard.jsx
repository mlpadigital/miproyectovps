import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubdomainConfig from '@/components/dashboard/SubdomainConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, Database, Share2 } from 'lucide-react';

const WholesaleDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Top Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-md">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-2">Multi-Tienda</h3>
            <p className="text-slate-400 text-sm mb-4">Gestionas 3 tiendas activas de ilimitadas.</p>
            <Button
              size="sm"
              onClick={() => navigate('/dashboard/settings')}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none cursor-pointer"
            >
              Crear Nueva Tienda
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-slate-200 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full">
            <div>
              <h3 className="font-bold text-lg text-slate-900">API Access Status</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm text-slate-600 font-medium">Operational - 14ms latency</span>
              </div>
            </div>
            <Button variant="outline" className="cursor-pointer">
              Ver Documentación API
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <SubdomainConfig />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Globe className="w-4 h-4 text-emerald-600" /> Dominios Personalizados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">Conecta tus propios dominios .com sin la marca mlpadigital.</p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/dashboard/settings')}
                  className="w-full cursor-pointer"
                >
                  Gestionar DNS
                </Button>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-slate-900">
                  <Database className="w-4 h-4 text-emerald-600" /> Exportación de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">Descarga CSVs completos de transacciones y usuarios.</p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/dashboard/analytics')}
                  className="w-full cursor-pointer"
                >
                  Ir a Exportaciones
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-emerald-50/60 border-emerald-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-emerald-950 text-base flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" /> Soporte Dedicado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-emerald-800 mb-4">Tienes asignado un gestor de cuenta prioritario.</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center font-bold text-emerald-800">
                  CM
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-900">Carlos M.</p>
                  <p className="text-xs text-emerald-700">Account Manager</p>
                </div>
              </div>
              <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white border-none cursor-pointer">
                Contactar Directamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WholesaleDashboard;