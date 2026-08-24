import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  ArrowRight,
  Shield,
  Clock
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BillingPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    if (user) {
      fetchBillingData();
      checkPaymentStatus();
    }
  }, [user]);

  const checkPaymentStatus = async () => {
    const params = new URLSearchParams(window.location.search);
    const isPaypal = params.get('paypal') === 'true';
    const status = params.get('payment');
    
    if (status === 'success') {
      if (isPaypal) {
        const token = params.get('token'); // PayPal token (orderId)
        const userId = params.get('userId');
        const planId = params.get('planId');
        const months = params.get('months');
        
        if (token && userId && planId) {
          try {
            setLoading(true);
            const response = await fetch('/api/capture-paypal-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId: token, userId, planId, months })
            });
            const data = await response.json();
            if (data.success) {
              toast({
                title: '¡Pago Exitoso!',
                description: 'Tu suscripción ha sido activada vía PayPal.',
              });
              window.history.replaceState({}, document.title, window.location.pathname);
              fetchBillingData();
            }
          } catch (err) {
            console.error('Error capturando PayPal', err);
          } finally {
            setLoading(false);
          }
        }
      } else {
        toast({
          title: '¡Pago Exitoso!',
          description: 'Tu suscripción ha sido activada vía MercadoPago.',
        });
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  };

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');

      // 1. Get current user's profile/client to find subscription
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .limit(1).single();

      // Get plans
      const { data: plansData, error: plansError } = await supabase
        .from('membership_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_ars', { ascending: true });

      if (plansData) {
        setPlans(plansData);
      } else {
        // Fallback dummy plans if table is missing or empty
        setPlans([
          { id: '1', name: 'Básico', price_ars: 5000, features: ['Tienda online', 'Hasta 100 productos', 'Soporte email'] },
          { id: '2', name: 'Emprendedor', price_ars: 12000, features: ['Productos ilimitados', 'Dominio personalizado', 'Herramientas IA', 'Soporte prioritario'] },
          { id: '3', name: 'Mayorista', price_ars: 25000, features: ['Todo lo anterior', 'Múltiples listas de precios', 'Integración ERP', 'Account manager dedicado'] }
        ]);
      }

      // Get subscription
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          membership_plans (
            name,
            price_ars
          )
        `)
        .eq('client_id', user.id)
        .eq('status', 'active')
        .limit(1).maybeSingle();
        
      if (subData) {
        setSubscription(subData);
      } else {
        // No active subscription found
        setSubscription({
          status: 'inactive',
          start_date: null,
          membership_plans: { name: 'Suscripción Pendiente de Pago', price_ars: 0 }
        });
      }
      
    } catch (error) {
      console.error('Error fetching billing info:', error);
      // Don't show hard error, just use fallbacks
      setPlans([
        { id: '1', name: 'Básico', price_ars: 5000, features: ['Tienda online', 'Hasta 100 productos', 'Soporte email'] },
        { id: '2', name: 'Emprendedor', price_ars: 12000, features: ['Productos ilimitados', 'Dominio personalizado', 'Herramientas IA', 'Soporte prioritario'] },
        { id: '3', name: 'Mayorista', price_ars: 25000, features: ['Todo lo anterior', 'Múltiples listas de precios', 'Integración ERP', 'Account manager dedicado'] }
      ]);
      setSubscription({
        status: 'inactive',
        start_date: null,
        membership_plans: { name: 'Suscripción Inactiva', price_ars: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    try {
      setLoading(true);
      const endpoint = paymentMethod === 'paypal' ? '/api/create-paypal-order' : '/api/create-preference';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planId: planId,
          userEmail: user.email
        })
      });
      
      if (!response.ok) throw new Error('Error al conectar con la pasarela de pago');
      
      const data = await response.json();
      if (data.init_point) {
        window.location.href = data.init_point;
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo iniciar el proceso de pago.",
      });
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Suscripción y Facturación</h1>
        <p className="text-slate-500">Gestiona tu plan actual, métodos de pago y descarga tus facturas.</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-48 bg-slate-100 animate-pulse rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-96 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-96 bg-slate-100 animate-pulse rounded-xl" />
            <div className="h-96 bg-slate-100 animate-pulse rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          {/* CURRENT PLAN OVERVIEW */}
          <Card className="border-indigo-100 shadow-md bg-gradient-to-br from-indigo-50/50 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Shield className="w-48 h-48" />
            </div>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-indigo-900 flex items-center gap-2">
                    Tu plan actual: <span className="font-extrabold">{subscription?.membership_plans?.name || 'Inicial'}</span>
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {subscription?.status === 'active' 
                      ? 'Tu suscripción está activa y al día.'
                      : 'No tenés una suscripción activa. Elegí un plan para acceder a tu panel.'}
                  </CardDescription>
                </div>
                <Badge variant="outline" className={cn("uppercase tracking-wider text-xs", subscription?.status === 'active' ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-red-100 text-red-700 border-red-200")}>
                  {subscription?.status === 'active' ? 'ACTIVO' : 'INACTIVO'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><CreditCard className="w-4 h-4"/> Precio del Plan</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {formatCurrency(subscription?.membership_plans?.price_ars || 0)} <span className="text-sm font-normal text-slate-500">/ mes</span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                  <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Próximo Cobro</div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">
                    {subscription?.next_billing_date ? formatDate(subscription.next_billing_date) : 'No aplica'}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-100 shadow-sm flex flex-col justify-center">
                  <Button variant="outline" className="w-full text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    Ver Historial de Facturas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AVAILABLE PLANS */}
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Mejorar mi Plan</h2>
                <p className="text-sm text-slate-500">Desbloquea más funcionalidades para llevar tu negocio al siguiente nivel.</p>
              </div>
            </div>
            <div className="mb-6 bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <Label className="text-slate-900 font-semibold mb-1 block">Método de pago preferido</Label>
                <p className="text-sm text-slate-500">Selecciona cómo deseas abonar tu plan</p>
              </div>
              <div className="w-64">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Selecciona cómo quieres pagar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mercadopago">MercadoPago (Pesos)</SelectItem>
                    <SelectItem value="paypal">PayPal (Dólares)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => {
                const isCurrent = subscription?.membership_plans?.name === plan.name;
                const isPopular = idx === 1; // Highlight the middle plan usually
                
                return (
                  <Card key={plan.id || idx} className={cn(
                    "relative flex flex-col transition-all duration-200 hover:shadow-lg",
                    isPopular ? "border-violet-500 shadow-md scale-[1.02]" : "border-slate-200",
                    isCurrent ? "bg-slate-50/50 opacity-80" : "bg-white"
                  )}>
                    {isPopular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Badge className="bg-violet-500 hover:bg-violet-600 px-3 py-0.5 text-xs shadow-sm uppercase tracking-wider">
                          <Zap className="w-3 h-3 mr-1 inline" /> Más Popular
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pt-8 pb-4 border-b border-slate-100">
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <div className="mt-4 flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-extrabold text-slate-900">{formatCurrency(plan.price_ars)}</span>
                        <span className="text-sm font-medium text-slate-500">/mes</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 pt-6">
                      <ul className="space-y-3">
                        {Array.isArray(plan.features) ? plan.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        )) : (
                          // Fallback if features is a string or undefined
                          <li className="flex items-start gap-3 text-sm text-slate-600">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Acceso a {plan.name}</span>
                          </li>
                        )}
                      </ul>
                    </CardContent>
                    
                    <CardFooter className="pt-4 pb-6">
                      <Button 
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrent}
                        variant={isPopular ? "default" : "outline"}
                        className={cn(
                          "w-full h-12 text-sm font-semibold",
                          isPopular && !isCurrent ? "bg-violet-600 hover:bg-violet-700" : ""
                        )}
                      >
                        {isCurrent ? "Tu Plan Actual" : "Elegir Plan"}
                        {!isCurrent && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BillingPage;
