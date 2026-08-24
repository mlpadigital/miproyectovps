import React, { useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import DynamicStore from '@/components/DynamicStore';

// Pages
import LandingPage from '@/pages/LandingPage';
import StoresDirectory from '@/pages/public/StoresDirectory';
import Login from '@/pages/Login';

// Builder Pages
import StoreBuilder from '@/pages/builder/StoreBuilder';
import TemplateSelector from '@/pages/builder/TemplateSelector';
import ThemeEditor from '@/pages/builder/ThemeEditor';

// Dashboard Components
import SharedLayout from '@/components/dashboard/SharedLayout';
import DashboardSelector from '@/pages/dashboards/DashboardSelector';
import ProductManagement from '@/pages/dashboard/ProductManagement';
import MassPriceIncrease from '@/pages/dashboard/MassPriceIncrease';
import DiscountsPage from '@/pages/dashboard/DiscountsPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import InventoryPage from '@/pages/dashboard/InventoryPage';
import DigitalProductsPage from '@/pages/dashboard/DigitalProductsPage';
import AnalyticsPage from '@/pages/dashboard/AnalyticsPage';
import NotificationsPage from '@/pages/dashboard/NotificationsPage';
import SeoSettingsPage from '@/pages/dashboard/SeoSettingsPage';
import AppearancePage from '@/pages/dashboard/AppearancePage';
import AiGeneratorPage from '@/pages/dashboard/AiGeneratorPage';
import AiBackgroundRemoverPage from '@/pages/dashboard/AiBackgroundRemoverPage';
import SupportPage from '@/pages/dashboard/SupportPage';
import AiCopywriterPage from '@/pages/dashboard/AiCopywriterPage';
import OrdersPage from '@/pages/dashboard/OrdersPage';
import ClientsPage from '@/pages/dashboard/ClientsPage';
import BillingPage from '@/pages/dashboard/BillingPage';
import AdminPanel from '@/pages/admin/AdminPanel';
import ProvidersSearchPage from '@/pages/dashboard/ProvidersSearchPage';

function App() {
  // 1. Extraer el subdominio o el dominio personalizado de la URL actual
  const { subdomain, customDomain, isPreview, previewStoreId } = useMemo(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // Check for preview/store/subdomain mode in URL params
    const searchParams = new URLSearchParams(window.location.search);
    const paramSubdomain = searchParams.get('subdomain');
    const previewStoreId = searchParams.get('store');
    const isPreview = searchParams.get('preview') === 'true' || Boolean(previewStoreId) || Boolean(paramSubdomain);

    const isIpOrLocal = hostname.includes('localhost') || hostname.includes('127.0.0.1') || /^\d+\.\d+\.\d+\.\d+$/.test(hostname);

    // Soporte para subdominios en entorno local o IP directa
    if (isIpOrLocal) {
      if (paramSubdomain) {
        return { subdomain: paramSubdomain, customDomain: null, isPreview, previewStoreId };
      }
      if (parts.length > 1 && parts[0] !== 'localhost' && !/^\d+$/.test(parts[0])) {
        return { subdomain: parts[0], customDomain: null, isPreview, previewStoreId };
      }
      return { subdomain: null, customDomain: null, isPreview, previewStoreId };
    }

    // Es el dominio principal (subdominio.mlpadigital.com)
    if (hostname.endsWith('mlpadigital.com')) {
      if (paramSubdomain) {
        return { subdomain: paramSubdomain, customDomain: null, isPreview, previewStoreId };
      }
      if (parts.length > 2) {
        const sub = parts[0].toLowerCase();
        if (!['www', 'app', 'mlpadigital'].includes(sub)) {
          return { subdomain: sub, customDomain: null, isPreview, previewStoreId };
        }
      }
      return { subdomain: null, customDomain: null, isPreview, previewStoreId };
    }

    if (paramSubdomain) {
      return { subdomain: paramSubdomain, customDomain: null, isPreview, previewStoreId };
    }

    // Es un dominio personalizado completamente distinto (ej. mitienda.com o www.mitienda.com)
    const cleanDomain = hostname.replace(/^www\./, '');
    return { subdomain: null, customDomain: cleanDomain, isPreview, previewStoreId };
  }, []);

  // 2. Si se detectó un subdominio o dominio de cliente, mostramos la tienda
  if (subdomain || customDomain || isPreview) {
    return <DynamicStore subdomain={subdomain} customDomain={customDomain} isPreview={isPreview} previewStoreId={previewStoreId} />;
  }

  // 3. Plataforma principal
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/tiendas" element={<StoresDirectory />} />
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Builder Routes - Pantalla Completa */}
        <Route path="/builder" element={<StoreBuilder />} />
        <Route path="/builder/templates" element={<TemplateSelector />} />

        {/* Store Design & Editor Routes - Pantalla Completa */}
        <Route path="/dashboard/templates" element={<TemplateSelector />} />
        <Route path="/dashboard/theme-editor" element={<ThemeEditor />} />

        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<SharedLayout />}>
          {/* El selector determina automáticamente la vista según el plan */}
          <Route index element={<DashboardSelector />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/mass-increase" element={<MassPriceIncrease />} />
          <Route path="digital-products" element={<DigitalProductsPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="discounts" element={<DiscountsPage />} />
          <Route path="providers-search" element={<ProvidersSearchPage />} />

          {/* 🤖 RUTAS DE HERRAMIENTAS IA */}
          <Route path="ai-generator" element={<AiGeneratorPage />} />
          <Route path="ai-background-remover" element={<AiBackgroundRemoverPage />} />
          <Route path="support" element={<SupportPage />} />
          <Route path="ai-copywriter" element={<AiCopywriterPage />} />

          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="seo-settings" element={<SeoSettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="appearance" element={<AppearancePage />} />
          <Route path="design" element={<Navigate to="appearance" replace />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminPanel />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;