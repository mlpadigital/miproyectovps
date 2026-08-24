import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// --- Chart Components ---

const SimpleLineChart = ({ data, color = "violet", height = 60 }) => {
  if (!data || data.length < 2) return <div className="h-[60px] flex items-center justify-center text-slate-300 text-xs">Sin datos suficientes</div>;

  const max = Math.max(...data.map(d => d.value));
  const min = Math.min(...data.map(d => d.value));
  const range = max - min || 1;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - ((d.value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,100 ${points} 100,100`;

  const colorClasses = {
    violet: { stroke: "stroke-violet-500", fill: "fill-violet-500/10" },
    amber: { stroke: "stroke-amber-500", fill: "fill-amber-500/10" },
    blue: { stroke: "stroke-blue-500", fill: "fill-blue-500/10" },
    green: { stroke: "stroke-emerald-500", fill: "fill-emerald-500/10" }
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
        <polygon points={areaPoints} className={colorClasses[color].fill} />
        <polyline
          points={points}
          fill="none"
          vectorEffect="non-scaling-stroke"
          strokeWidth="2"
          className={colorClasses[color].stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

const BarList = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-center py-4 text-slate-400">Sin datos</div>;
  
  const max = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-slate-700 truncate max-w-[180px]">{item.name}</span>
            <span className="text-slate-500">{item.formattedValue}</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-violet-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Page Component ---

const AnalyticsPage = () => {
  const { user } = useSupabaseAuth();
  const [storeId, setStoreId] = useState(null);
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  
  // Metrics State
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    repeatCustomers: 0,
    revenueTrend: [], // { date: string, value: number }
    topProducts: [], // { name: string, value: number, formattedValue: string }
    categoryBreakdown: [] // { name: string, value: number, percentage: number }
  });

  useEffect(() => {
    if (user) {
      fetchStoreAndAnalytics();
    }
  }, [user, dateRange]);

  const fetchStoreAndAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Get Store
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1).single();

      if (storeError) throw storeError;
      setStoreId(storeData.id);

      // 2. Calculate Date Range
      const now = new Date();
      const startDate = new Date();
      if (dateRange === '7d') startDate.setDate(now.getDate() - 7);
      if (dateRange === '30d') startDate.setDate(now.getDate() - 30);
      if (dateRange === '90d') startDate.setDate(now.getDate() - 90);
      if (dateRange === '1y') startDate.setFullYear(now.getFullYear() - 1);

      // 3. Fetch Orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          created_at,
          customer_email,
          order_items (
            quantity,
            price,
            products (
              name,
              category
            )
          )
        `)
        .eq('store_id', storeData.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      processAnalytics(orders || []);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalytics = (orders) => {
    // Basic Metrics
    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total_amount), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Customers
    const customerEmails = orders.map(o => o.customer_email).filter(Boolean);
    const uniqueCustomers = new Set(customerEmails);
    const customerCounts = customerEmails.reduce((acc, email) => {
      acc[email] = (acc[email] || 0) + 1;
      return acc;
    }, {});
    const repeatCustomers = Object.values(customerCounts).filter(count => count > 1).length;

    // Revenue Trend (Group by day)
    const trendMap = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      trendMap[date] = (trendMap[date] || 0) + Number(order.total_amount);
    });
    const revenueTrend = Object.entries(trendMap).map(([date, value]) => ({ date, value }));

    // Product & Category Analysis
    const productSales = {};
    const categorySales = {};

    orders.forEach(order => {
      if (order.order_items) {
        order.order_items.forEach(item => {
          const productName = item.products?.name || 'Desconocido';
          const category = item.products?.category || 'Sin Categoría';
          const value = Number(item.price) * item.quantity;

          productSales[productName] = (productSales[productName] || 0) + value;
          categorySales[category] = (categorySales[category] || 0) + value;
        });
      }
    });

    // Top Products
    const topProducts = Object.entries(productSales)
      .map(([name, value]) => ({
        name,
        value,
        formattedValue: `$${value.toLocaleString()}`
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Category Breakdown
    const categoryBreakdown = Object.entries(categorySales)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / totalRevenue) * 100
      }))
      .sort((a, b) => b.value - a.value);

    setMetrics({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalCustomers: uniqueCustomers.size,
      repeatCustomers,
      revenueTrend,
      topProducts,
      categoryBreakdown
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Análisis & Reportes</h1>
          <p className="text-slate-500">Visualiza el rendimiento de tu tienda y el comportamiento de tus clientes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Seleccionar periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 días</SelectItem>
              <SelectItem value="30d">Últimos 30 días</SelectItem>
              <SelectItem value="90d">Últimos 90 días</SelectItem>
              <SelectItem value="1y">Este Año</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ventas Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="h-8 w-24 bg-slate-100 animate-pulse rounded" /> : (
              <>
                <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center">
                  En el periodo seleccionado
                </div>
              </>
            )}
            <div className="mt-4">
              <SimpleLineChart data={metrics.revenueTrend} color="violet" height={40} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" /> : (
              <>
                <div className="text-2xl font-bold">{metrics.totalOrders}</div>
                <div className="text-xs text-slate-500 mt-1">Órdenes completadas</div>
              </>
            )}
            <div className="mt-4">
               {/* Small viz placeholder or reuse line chart with different data if available */}
               <div className="h-[40px] w-full bg-slate-50 rounded flex items-end gap-1 p-1">
                  {[40, 60, 30, 70, 50, 80, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-amber-200 rounded-sm" style={{ height: `${h}%` }} />
                  ))}
               </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Promedio</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
             {loading ? <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" /> : (
              <>
                <div className="text-2xl font-bold">${metrics.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div className="text-xs text-slate-500 mt-1">Por orden</div>
              </>
            )}
            <div className="mt-4 h-[40px] flex items-center">
              <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[65%]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Clientes Totales</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
             {loading ? <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" /> : (
              <>
                <div className="text-2xl font-bold">{metrics.totalCustomers}</div>
                <p className="text-xs text-slate-500 mt-1">
                  <span className="text-emerald-600 font-medium">{metrics.repeatCustomers}</span> recurrentes
                </p>
              </>
            )}
            <div className="mt-4 flex gap-2">
               <div className="h-2 flex-1 bg-emerald-500 rounded-full opacity-80" title="Nuevos" />
               <div className="h-2 flex-[0.3] bg-emerald-200 rounded-full" title="Recurrentes" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Main Trend Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Tendencia de Ventas</CardTitle>
            <CardDescription>Ingresos diarios durante el periodo seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] w-full bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-4">
                 {metrics.revenueTrend.length > 0 ? (
                   <SimpleLineChart data={metrics.revenueTrend} height={280} />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-400">
                     No hay datos de ventas para mostrar en este periodo.
                   </div>
                 )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Por volumen de ingresos generados.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-8 bg-slate-100 animate-pulse rounded" />)}
              </div>
            ) : (
              <BarList data={metrics.topProducts} />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
            <CardDescription>Distribución de ingresos según el tipo de producto.</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
               <div className="h-[200px] bg-slate-100 animate-pulse rounded" />
             ) : metrics.categoryBreakdown.length > 0 ? (
               <div className="space-y-5">
                 {metrics.categoryBreakdown.map((cat, i) => (
                   <div key={i} className="flex items-center gap-4">
                     <div className="w-full space-y-1">
                       <div className="flex justify-between text-sm">
                         <span className="font-medium">{cat.name || "Sin Categoría"}</span>
                         <span className="text-slate-500">{cat.percentage.toFixed(1)}%</span>
                       </div>
                       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                         <div 
                           className={cn("h-full rounded-full", 
                             i === 0 ? "bg-violet-500" : 
                             i === 1 ? "bg-amber-500" : 
                             i === 2 ? "bg-blue-500" : "bg-slate-300"
                           )}
                           style={{ width: `${cat.percentage}%` }} 
                         />
                       </div>
                     </div>
                     <span className="text-sm font-bold text-slate-700 min-w-[80px] text-right">
                       ${cat.value.toLocaleString()}
                     </span>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="py-10 text-center text-slate-400">Sin datos de categorías</div>
             )}
          </CardContent>
        </Card>

        {/* Customer Insights (Placeholder/Simple) */}
        <Card>
          <CardHeader>
            <CardTitle>Insights de Clientes</CardTitle>
            <CardDescription>Métricas clave sobre tu base de compradores.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="flex items-center gap-2 text-slate-500 mb-2">
                 <Activity className="w-4 h-4" />
                 <span className="text-sm font-medium">Frecuencia</span>
               </div>
               <div className="text-2xl font-bold text-slate-900">
                 {metrics.totalOrders > 0 && metrics.totalCustomers > 0 
                   ? (metrics.totalOrders / metrics.totalCustomers).toFixed(1) 
                   : 0}
               </div>
               <p className="text-xs text-slate-400">pedidos por cliente</p>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="flex items-center gap-2 text-slate-500 mb-2">
                 <Users className="w-4 h-4" />
                 <span className="text-sm font-medium">Retención</span>
               </div>
               <div className="text-2xl font-bold text-slate-900">
                 {metrics.totalCustomers > 0 
                   ? Math.round((metrics.repeatCustomers / metrics.totalCustomers) * 100) 
                   : 0}%
               </div>
               <p className="text-xs text-slate-400">tasa de clientes recurrentes</p>
             </div>

             <div className="col-span-2 bg-violet-50 p-4 rounded-lg border border-violet-100 flex items-center justify-between">
               <div>
                 <h4 className="font-semibold text-violet-900">Reporte Mensual</h4>
                 <p className="text-sm text-violet-700">Descarga el detalle completo de ventas.</p>
               </div>
               <Button variant="outline" className="border-violet-200 text-violet-700 hover:bg-violet-100 hover:text-violet-800">
                 Exportar CSV
               </Button>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsPage;