import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubdomainConfig from '@/components/dashboard/SubdomainConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, TrendingUp, MousePointerClick, Palette, Mail } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, trend }) => (
  <Card className="border-slate-200 shadow-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Icon className="w-5 h-5 text-amber-600" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium text-emerald-600">
          <TrendingUp className="w-3 h-3 mr-1" />
          {trend} este mes
        </div>
      )}
    </CardContent>
  </Card>
);

const EntrepreneurDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Visitas Totales" value="1,234" icon={MousePointerClick} trend="+12%" />
        <StatCard title="Ventas del Mes" value="$4,500" icon={BarChart3} trend="+8%" />
        <StatCard title="Clientes Nuevos" value="45" icon={Users} trend="+24%" />
        <StatCard title="Tasa de Conversión" value="3.2%" icon={TrendingUp} trend="+1.5%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Config Column */}
        <div className="lg:col-span-2 space-y-8">
          <SubdomainConfig />

          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Rendimiento de Tienda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Gráfico de ventas (Próximamente)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tools Column */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-slate-900">Herramientas Pro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button
                onClick={() => navigate('/dashboard/appearance')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 transition-colors flex items-center gap-3 border border-slate-100 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Editor de Tema</div>
                  <div className="text-xs text-slate-500">Personaliza colores y fuentes</div>
                </div>
              </button>

              <button
                onClick={() => navigate('/dashboard/notifications')}
                className="w-full text-left p-3 rounded-lg bg-slate-50 hover:bg-amber-50/60 transition-colors flex items-center gap-3 border border-slate-100 group cursor-pointer"
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">Marketing Email</div>
                  <div className="text-xs text-slate-500">Envía campañas a tus clientes</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EntrepreneurDashboard;