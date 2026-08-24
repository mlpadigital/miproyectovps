
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap, ShoppingBag, Globe, TrendingUp, ArrowRight, Menu, X, Code2, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl text-white tracking-tight">Mlpa<span className="text-amber-400">Digital</span></span>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Características</a>
              <a href="#pricing" className="text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Precios</a>
              <a href="#testimonials" className="text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Testimonios</a>
              <a href="/tiendas" className="text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-md text-sm font-medium">Directorio</a>
              <Button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 shadow-lg shadow-violet-500/25"
              >
                Empezar
              </Button>
            </div>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-slate-900 border-b border-white/10"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#features" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-base font-medium">Características</a>
            <a href="#pricing" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-base font-medium">Precios</a>
            <a href="#testimonials" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-base font-medium">Testimonios</a>
            <a href="/tiendas" onClick={() => setIsOpen(false)} className="text-gray-300 hover:text-amber-400 block px-3 py-2 rounded-md text-base font-medium">Directorio</a>
            <div className="px-3 py-2">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0"
              >
                Empezar
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-violet-900/50 border border-violet-500/30 text-violet-300 text-sm font-medium mb-6 backdrop-blur-sm">
            Lanza tu negocio hoy
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            Escala tu Negocio con <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500">
              Ambición Global
            </span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 mb-10 leading-relaxed">
            La plataforma todo en uno para gestionar clientes, automatizar suscripciones y expandir tu tienda digital por todo el mundo. Únete a miles de emprendedores.
          </p>

          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={() => navigate('/login')}
              className="text-lg px-10 py-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-xl shadow-orange-500/20 rounded-full"
            >
              Empezar a crear la magia <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Features = () => {
  const features = [
    {
      icon: <Globe className="w-6 h-6 text-amber-400" />,
      title: "Alcance Global",
      description: "Acepta pagos en múltiples monedas, incluyendo USD, EUR y ARS. Expande tu mercado sin fronteras."
    },
    {
      icon: <ShoppingBag className="w-6 h-6 text-violet-400" />,
      title: "Gestión de Tiendas",
      description: "Crea y gestiona múltiples tiendas digitales con subdominios y temas personalizados en segundos."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-orange-400" />,
      title: "Análisis Avanzado",
      description: "Información en tiempo real sobre tus ingresos, crecimiento de clientes y tasas de abandono de suscripciones."
    }
  ];

  return (
    <section id="features" className="py-24 bg-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Todo lo que necesitas para tener éxito</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Potentes herramientas diseñadas para ayudarte a construir, gestionar y hacer crecer tu negocio desde un único panel.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-violet-500/50 transition-all hover:bg-slate-800 group"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Básica",
      price: { ars: "7.000", usd: "7", eur: "7" },
      features: ["1 Tienda online con pasarela de pagos", "Clientes ilimitados", "Análisis Básico", "Soporte por WhatsApp", "Panel Administrativo", "Notificaciones por correo"],
      color: "border-slate-700",
      buttonVariant: "outline"
    },
    {
      name: "E-Learning",
      price: { ars: "15.000", usd: "15", eur: "15" },
      features: ["1 Tienda de E-Learning diferente", "Alumnos ilimitados", "Análisis Avanzado", "Soporte Prioritario", "Herramientas IA"],
      color: "border-amber-500/50 shadow-amber-900/20",
      popular: true,
      buttonVariant: "default"
    },
    {
      name: "Mayorista",
      price: { ars: "-", usd: "-", eur: "-" },
      features: ["¡Próximamente!"],
      color: "border-violet-500/50 shadow-violet-900/20",
      buttonVariant: "outline",
      disabled: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-950 relative">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Precios simples y transparentes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Elige el plan que se adapte a tu etapa de crecimiento. Sin tarifas ocultas.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl bg-slate-900/80 backdrop-blur-xl border p-8 flex flex-col ${plan.color} ${plan.popular ? 'shadow-2xl scale-105 z-10' : 'hover:border-slate-600'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Más Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">${plan.price.usd}</span>
                  <span className="text-gray-400">/mes</span>
                </div>
                <div className="text-sm text-gray-500 mt-2 space-y-1">
                  <p>🇦🇷 ARS {plan.price.ars}</p>
                  <p>🇪🇺 EUR {plan.price.eur}</p>
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center text-gray-300">
                    <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => navigate('/login', { state: { selectedPlanName: plan.name } })}
                className={`w-full ${plan.popular ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0' : 'bg-transparent border-slate-600 text-white hover:bg-slate-800 hover:text-white'}`}
                variant={plan.popular ? "default" : "outline"}
                disabled={plan.disabled}
              >
                {plan.disabled ? "Próximamente" : `Elegir ${plan.name}`}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const defaultTestimonials = [
      { name: "Alex Morgan", role: "Emprendedor Digital", content: "Esta plataforma transformó completamente la forma en que gestiono mi tienda digital. El soporte multidivisa es un cambio de juego para mis clientes internacionales." },
      { name: "Sofia Lima", role: "Creadora de Cursos", content: "El constructor de E-Learning es tan intuitivo que pude lanzar mi academia en menos de 48 horas. Simplemente brillante." },
      { name: "Martín Díaz", role: "Vendedor Mayorista", content: "Las herramientas de análisis avanzadas me permitieron optimizar mi inventario y duplicar las ventas este mes. Recomiendo totalmente la plataforma." }
    ];

    fetch('https://mlpadigital.com/api/testimonials')
      .then(async res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          return defaultTestimonials;
        }
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        } else {
          setTestimonials(defaultTestimonials);
        }
      })
      .catch(err => {
        console.warn('Using default testimonials:', err.message);
        setTestimonials(defaultTestimonials);
      });
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16">Con la confianza de creadores de todo el mundo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testim, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700"
            >
              <div className="flex gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-300 mb-6 italic">"{testim.content}"</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                  {testim.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{testim.name}</h4>
                  <p className="text-sm text-gray-500">{testim.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const CreatorSection = () => {
  return (
    <section className="py-24 bg-slate-950 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

            {/* Image Side */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative w-full md:w-1/3 max-w-sm flex-shrink-0"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] md:aspect-square shadow-2xl">
                  <img
                    src="https://horizons-cdn.hostinger.com/a79bde4a-fbde-4001-b559-679418d1bf2f/86e4d95403c2b6c0c5e0bb1bc4da1f2b.jpg"
                    alt="Martin - Creador de MlpaDigital"
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-6 -right-6 bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3">
                  <div className="bg-amber-500/20 p-2 rounded-lg">
                    <Code2 className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Experiencia</p>
                    <p className="text-white font-bold">+10 Años</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Content Side */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-sm font-medium mb-6">
                  <Heart className="w-4 h-4 fill-current" />
                  <span>Hecho con pasión</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-white mb-2">Martin</h2>
                <p className="text-xl text-amber-400 font-medium mb-6">Creador de MlpaDigital</p>

                <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                  <p>
                    "Con más de 10 años codificando como full stack, junto a Gaby de Luz Papel y Acción, decidimos empezar un nuevo rumbo ayudando a los emprendedores a crear sus propias tiendas."
                  </p>
                  <p className="text-gray-400 text-base">
                    Nuestra misión es democratizar el comercio electrónico, brindando herramientas poderosas pero accesibles para que cualquiera pueda convertir su pasión en un negocio global.
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-sm text-gray-300">
                    🚀 Full Stack Dev
                  </div>
                  <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-sm text-gray-300">
                    💡 Emprendedor
                  </div>
                  <div className="px-4 py-2 bg-slate-800 rounded-lg border border-slate-700 text-sm text-gray-300">
                    🌍 Visionario
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">Mlpa<span className="text-amber-400">Digital</span></span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Empoderando a los negocios para crecer más allá de las fronteras con herramientas potentes y pagos globales.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Producto</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#features" className="hover:text-amber-400 transition-colors">Características</a></li>
              <li><a href="#pricing" className="hover:text-amber-400 transition-colors">Precios</a></li>
              <li><a href="/tiendas" className="hover:text-amber-400 transition-colors">Directorio de Tiendas</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Compañía</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-amber-400 transition-colors">Sobre Nosotros</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-amber-400 transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} MlpaDigital. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
            <a href="#" className="hover:text-white transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FloatingWhatsApp = () => {
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    fetch('https://mlpadigital.com/api/support-settings')
      .then(async res => {
        if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
          return null;
        }
        return res.json();
      })
      .then(data => {
        if (data && data.whatsapp_contacts && data.whatsapp_contacts.length > 0) {
          setPhoneNumber(data.whatsapp_contacts[0].number.replace(/[^0-9]/g, ''));
        } else {
          setPhoneNumber("5491123456789");
        }
      })
      .catch(() => {
        setPhoneNumber("5491123456789");
      });
  }, []);

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg shadow-green-500/30 transition-transform hover:scale-110 flex items-center justify-center"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
};

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 font-sans selection:bg-amber-500/30 relative">
      <Helmet>
        <title>MlpaDigital - Escala tu Negocio Globalmente</title>
        <meta name="description" content="Plataforma todo en uno para gestión de clientes, creación de tiendas y pagos globales." />
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <CreatorSection />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
};

export default LandingPage;
