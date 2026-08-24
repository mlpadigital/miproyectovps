
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Zap, Loader2, Lock, User, ArrowRight, Store, Globe, Check, CreditCard, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, loading } = useSupabaseAuth();
  const { toast } = useToast();

  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subdomainTouched, setSubdomainTouched] = useState(false);
  const [subdomainError, setSubdomainError] = useState(null);
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mercadopago');
  const [isRedirectingToPayment, setIsRedirectingToPayment] = useState(false);

  // Plans state
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [currency, setCurrency] = useState('usd');

  // Login State - PREFILLED FOR DEMO
  const [loginData, setLoginData] = useState({
    identifier: 'ejemplodeemail@gmail.com',
    password: 'unacontraseña'
  });

  // Registration State
  const [regData, setRegData] = useState({
    fullName: '',
    email: '',
    storeName: '',
    subdomain: '',
    phone: '',
    address: '',
    country: '',
    password: '',
    planId: '',
    billingCycle: 'monthly'
  });

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('membership_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_usd', { ascending: true });

        if (error) throw error;
        if (data) setPlans(data);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  // Auto-generate subdomain from store name
  useEffect(() => {
    if (!subdomainTouched && regData.storeName) {
      const generated = regData.storeName
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove anything that isn't alphanumeric, space, or hyphen
        .replace(/\s+/g, '-')         // Spaces to hyphens
        .replace(/-+/g, '-')          // Multiple hyphens to single
        .replace(/^-+|-+$/g, '');     // Trim hyphens from start/end

      setRegData(prev => ({ ...prev, subdomain: generated }));
    }
  }, [regData.storeName, subdomainTouched]);

  // Check subdomain availability debounce
  useEffect(() => {
    const checkAvailability = async () => {
      if (!regData.subdomain || regData.subdomain.length < 3) {
        setSubdomainError(null);
        return;
      }

      setIsCheckingSubdomain(true);
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('id')
          .eq('subdomain', regData.subdomain)
          .limit(1).maybeSingle();

        if (error) throw error;

        if (data) {
          setSubdomainError("Este subdominio ya está en uso. Por favor elige otro.");
        } else {
          setSubdomainError(null);
        }
      } catch (err) {
        console.error("Error checking subdomain:", err);
      } finally {
        setIsCheckingSubdomain(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (!isLogin && regData.subdomain) {
        checkAvailability();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [regData.subdomain, isLogin]);


  // Redirect if logged in
  if (user && !loading && !isRedirectingToPayment) {
    // Redirect to the dashboard router which handles plan-based redirection
    return <Navigate to="/dashboard" replace />;
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signIn(loginData.identifier, loginData.password);
      if (error) throw error;

      navigate('/dashboard');
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: "Credenciales inválidas o error de conexión.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setIsRedirectingToPayment(true);

    try {
      // 1. Client-side Validation
      console.log("Submitting Registration Data:", regData); // Debug log

      if (!regData.email || !regData.password || !regData.storeName || !regData.planId) {
        throw new Error("Por favor completa todos los campos requeridos, incluyendo la selección del plan.");
      }

      // UUID Validation for Plan ID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(regData.planId)) {
        console.error("Invalid Plan ID format:", regData.planId);
        throw new Error(`Error interno: ID del plan inválido (${regData.planId}). Por favor recarga la página.`);
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(regData.email.trim())) {
        throw new Error("El formato del correo electrónico no es válido.");
      }

      if (regData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres.");
      }

      if (!regData.country) {
        throw new Error("Por favor selecciona un país.");
      }

      if (subdomainError) {
        throw new Error("El subdominio seleccionado no está disponible.");
      }

      // 2. Create User & Store Record (via DB Trigger)
      // Ensure plan_id is passed as a valid UUID string, not empty string
      const planIdToSend = regData.planId && regData.planId.trim() !== '' ? regData.planId : null;

      const { error } = await signUp(regData.email, regData.password, {
        data: {
          full_name: regData.fullName,
          phone: regData.phone,
          address: regData.address,
          country: regData.country,
          store_name: regData.storeName,
          subdomain: regData.subdomain,
          plan_id: planIdToSend,
          billing_cycle: regData.billingCycle
        }
      });

      if (error) throw error;

      // 3. Trigger Hostinger Subdomain Creation
      if (regData.subdomain) {
        try {
          console.log("Attempting to register subdomain on Hostinger:", regData.subdomain);
          await supabase.functions.invoke('create-subdomain', {
            body: { subdomain: regData.subdomain }
          });
        } catch (subError) {
          console.warn("Error invoking subdomain function:", subError);
        }
      }

      // 4. Redirigir a MercadoPago o PayPal
      try {
          const endpoint = paymentMethod === 'paypal' ? '/api/create-paypal-order' : '/api/create-preference';
          const response = await fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  userId: user?.id || (await supabase.auth.getUser()).data.user?.id,
                  planId: planIdToSend,
                  userEmail: regData.email,
                  billingCycle: regData.billingCycle
              })
          });
          
          if (!response.ok) throw new Error('Error al generar el link de pago');
          
          const data = await response.json();
          if (data.init_point) {
              window.location.href = data.init_point;
              return;
          }
      } catch (mpError) {
          console.error("Error procesando el pago:", mpError);
          // Si falla, los mandamos al dashboard para que paguen desde ahí
          toast({
            title: "Cuenta creada",
            description: "No se pudo iniciar el pago. Serás redirigido para intentarlo nuevamente.",
          });
          setIsRedirectingToPayment(false);
          setTimeout(() => navigate('/dashboard/billing'), 2000);
      }

    } catch (error) {
      console.error(error);
      setIsRedirectingToPayment(false);
      toast({
        variant: "destructive",
        title: "Error de registro",
        description: error.message || "Hubo un problema al crear tu cuenta.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePrice = (plan) => {
    let basePrice = 0;
    if (currency === 'ars') basePrice = plan.price_ars;
    else if (currency === 'eur') basePrice = plan.price_eur;
    else basePrice = plan.price_usd;

    if (regData.billingCycle === 'monthly') return basePrice;
    if (regData.billingCycle === 'quarterly') return basePrice * 3;
    if (regData.billingCycle === 'annual') return basePrice * 12;
    return basePrice;
  };

  const formatPrice = (price) => {
    if (currency === 'ars') return `$${new Intl.NumberFormat('es-AR').format(price)} ARS`;
    if (currency === 'eur') return `€${new Intl.NumberFormat('de-DE').format(price)} EUR`;
    return `$${new Intl.NumberFormat('en-US').format(price)} USD`;
  };

  const countries = [
    "Argentina", "Bolivia", "Brasil", "Chile", "Colombia",
    "Costa Rica", "Ecuador", "España", "Estados Unidos",
    "México", "Panamá", "Paraguay", "Perú", "Uruguay", "Otro"
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-y-auto">
      {/* Background Effects */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 rounded-full blur-[100px]"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full ${isLogin ? 'max-w-md' : 'max-w-5xl'} bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 transition-all duration-500 my-10`}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white text-center">
            {isLogin ? 'Bienvenido de nuevo' : 'Configura tu cuenta'}
          </h1>
          <p className="text-gray-400 text-sm text-center mt-2">
            {isLogin
              ? 'Ingresa tus credenciales para acceder al panel.'
              : 'Completa tu perfil y selecciona tu plan ideal.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-slate-950/50 rounded-lg mb-8 max-w-xs mx-auto">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Registrarse
          </button>
        </div>

        <AnimatePresence mode="wait">
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLoginSubmit}
              className="space-y-6 max-w-md mx-auto"
            >
              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="login-identifier">Email o Usuario</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="login-identifier"
                    type="text"
                    placeholder="tu@email.com"
                    value={loginData.identifier}
                    onChange={(e) => setLoginData({ ...loginData, identifier: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white pl-10 focus:ring-violet-500 focus:border-violet-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300" htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="login-password"
                    type={showLoginPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="bg-slate-950 border-slate-800 text-white pl-10 pr-10 focus:ring-violet-500 focus:border-violet-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium py-2.5 h-auto"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar al Panel'}
              </Button>

              <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded text-xs text-amber-200/80 text-center">
                <p>Credenciales de demostración precargadas para prueba inmediata.</p>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleRegisterSubmit}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              <div className="space-y-6">
                <div className="space-y-6 bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <User className="w-4 h-4 text-amber-400" /> Información Personal
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Nombre Completo</Label>
                        <Input
                          placeholder="Juan Pérez"
                          value={regData.fullName}
                          onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                          className="bg-slate-950 border-slate-800 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Email</Label>
                        <Input
                          type="email"
                          placeholder="juan@ejemplo.com"
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          className="bg-slate-950 border-slate-800 text-white"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300">Teléfono</Label>
                          <Input
                            type="tel"
                            placeholder="+54..."
                            value={regData.phone}
                            onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-white"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300">País</Label>
                          <Select
                            value={regData.country}
                            onValueChange={(val) => setRegData({ ...regData, country: val })}
                          >
                            <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                              <SelectValue placeholder="País" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-800 max-h-60">
                              {countries.map((c) => (
                                <SelectItem
                                  key={c}
                                  value={c}
                                  className="text-slate-200 focus:bg-slate-800 focus:text-white cursor-pointer"
                                >
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Dirección</Label>
                        <Input
                          placeholder="Calle 123"
                          value={regData.address}
                          onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                          className="bg-slate-950 border-slate-800 text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="pt-2">
                    <h3 className="text-white font-medium mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                      <Store className="w-4 h-4 text-violet-400" /> Detalles de la Tienda
                    </h3>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label className="text-gray-300">Nombre de la Tienda</Label>
                        <Input
                          placeholder="Mi Tienda"
                          value={regData.storeName}
                          onChange={(e) => setRegData({ ...regData, storeName: e.target.value })}
                          className="bg-slate-950 border-slate-800 text-white"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Subdominio</Label>
                        <div className="flex">
                          <div className="relative flex-1">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <Input
                              placeholder="mi-tienda"
                              value={regData.subdomain}
                              onChange={(e) => {
                                setRegData({ ...regData, subdomain: e.target.value });
                                setSubdomainTouched(true);
                              }}
                              className={`bg-slate-950 border-slate-800 text-white pl-10 rounded-r-none border-r-0 ${subdomainError ? 'border-red-500 focus:ring-red-500' : ''}`}
                              required
                            />
                          </div>
                          <div className="bg-slate-800 border border-slate-800 text-gray-400 flex items-center px-3 rounded-r-md text-sm">
                            .mlpadigital.com
                          </div>
                        </div>

                        {isCheckingSubdomain && (
                          <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> Verificando disponibilidad...
                          </p>
                        )}

                        {subdomainError ? (
                          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {subdomainError}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 mt-1">
                            Solo letras, números y guiones. Se usará para crear tu tienda en {regData.subdomain || '...'}.mlpadigital.com
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300">Contraseña</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <Input
                            type={showRegPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={regData.password}
                            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-white pl-10 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 focus:outline-none"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {regData.password && regData.password.length < 6 && (
                          <p className="text-xs text-red-400 mt-1">
                            La contraseña debe tener al menos 6 caracteres
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Selection Column */}
              <div className="space-y-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> Selecciona tu Plan
                </h3>

                {/* Frequency & Currency Controls */}
                <div className="flex flex-wrap gap-4 justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-md">
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, billingCycle: 'monthly' })}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${regData.billingCycle === 'monthly' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Mensual
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, billingCycle: 'quarterly' })}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${regData.billingCycle === 'quarterly' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Trimestral
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegData({ ...regData, billingCycle: 'annual' })}
                      className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${regData.billingCycle === 'annual' ? 'bg-slate-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                    >
                      Anual
                    </button>
                  </div>

                  <div className="flex gap-1 bg-slate-950 p-1 rounded-md">
                    {['usd', 'ars', 'eur'].map(cur => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setCurrency(cur)}
                        className={`px-3 py-1 text-xs font-medium rounded-sm uppercase transition-colors ${currency === cur ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {loadingPlans ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                    </div>
                  ) : (
                    plans.map((plan) => {
                      const isSelected = regData.planId === plan.id;
                      const price = calculatePrice(plan);

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setRegData({ ...regData, planId: plan.id })}
                          className={`cursor-pointer relative p-5 rounded-xl border transition-all duration-200 ${isSelected ? 'bg-violet-900/20 border-violet-500 ring-1 ring-violet-500' : 'bg-slate-900/40 border-slate-800 hover:border-slate-600'}`}
                        >
                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                          </div>

                          <div className="mb-4">
                            <span className="text-2xl font-bold text-white">{formatPrice(price)}</span>
                            <span className="text-xs text-gray-400 ml-1">
                              {regData.billingCycle === 'monthly' ? '/mes' : regData.billingCycle === 'quarterly' ? '/trimestre' : '/año'}
                            </span>
                          </div>

                          {plan.features && (
                            <ul className="space-y-2 mb-2">
                              {(typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features).slice(0, 4).map((feature, idx) => (
                                <li key={idx} className="flex items-center text-xs text-gray-400">
                                  <Check className="w-3 h-3 text-emerald-500 mr-2 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>

                <div className="pt-2 px-1">
                    <Label className="text-white mb-2 block">Método de Pago</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue placeholder="Selecciona cómo quieres pagar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mercadopago">MercadoPago (Pesos)</SelectItem>
                        <SelectItem value="paypal">PayPal (Dólares)</SelectItem>
                      </SelectContent>
                    </Select>
                </div>

                <div className="pt-4 sticky bottom-0 bg-slate-900/80 backdrop-blur-sm p-4 border-t border-slate-800 -mx-4 -mb-4 rounded-b-xl">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium py-3 h-auto text-lg shadow-lg shadow-orange-500/20"
                    disabled={isLoading || !!subdomainError}
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Completar Registro'}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-3">
                    Al registrarte aceptas nuestros Términos de Servicio y Política de Privacidad.
                  </p>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Footer Info */}
      <div className="absolute bottom-4 text-center text-xs text-gray-600 w-full pointer-events-none z-0">
        <p>&copy; 2024 MlpaDigital Enterprise.</p>
      </div>
    </div>
  );
};

export default Login;
