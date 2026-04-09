# MLPA Digital - Memoria del Proyecto

Este archivo sirve como base de conocimiento para la IA y los desarrolladores sobre el estado, arquitectura y objetivos del proyecto.

## 🚀 Descripción General
MLPA Digital es una plataforma de e-commerce multi-tenant (SaaS) que permite a los usuarios crear sus propias tiendas online de forma automática, gestionadas a través de un panel central y potenciadas por automatizaciones de IA y redes sociales.

## 🛠️ Stack Tecnológico
- **Frontend Principal**: React (Vite, Tailwind CSS) - Ubicado en `master_store_local`.
- **Backend Panel**: Node.js / Express - Ubicado en `panel/`. Gestiona servicios del VPS y subdominios.
- **Base de Datos & Auth**: Supabase (PostgreSQL).
- **Automatización**: n8n (flujos de trabajo, integraciones de IA).
- **Infraestructura**: VPS Linux (Ubuntu), Nginx (Proxy Inverso), Docker (para n8n/servicios).
- **Microservicios**: FastAPI (Python) para servicios específicos como `buscar-api`.

## 📦 Componentes Clave
1. **Panel VPS (`panel/`)**: Interfaz administrativa para monitorear el estado del servidor (Nginx, UFW, Node) y gestionar la creación/eliminación de subdominios para las tiendas.
2. **Master Store (`master_store_local/`)**: El núcleo de la funcionalidad de la tienda, incluyendo catálogo, carrito, SEO y configuraciones de apariencia.
3. **n8n Workflows**: Automatización de sincronización de stock, generación de contenido con IA (Gemini/Grok) y alertas de sistema.

## 🔗 Integraciones Principales
- **Meta (Facebook/WhatsApp)**: Sincronización de catálogo en tiempo real, WhatsApp Shopping y FBE (Facebook Business Extension).
- **Mercado Pago**: Procesamiento de pagos para las tiendas.
- **Google Search Console**: Automatización de indexación mediante Sitemap dinámico y Google Indexing API.

## ✅ Hitos Recientes
- **Sincronización con WhatsApp**: Integración completa del catálogo de Meta.
- **SEO Automático**: Descubrimiento e indexación de subdominios en tiempo real.
- **Personalización**: Mejoras en el selector de tipografía y temas visuales.
- **IA en Ventas**: Flujos de n8n para asistentes virtuales y generación de contenido.
- **Corrección de Acceso**: Solución al problema de registros NULL en descargas de recursos.

## 🎯 Próximos Pasos & Mejoras
- Refinar la automatización de backups y logs.
- Implementar transiciones y micro-animaciones premium en el frontend.
- Optimización de carga y performance del panel administrativo.

---
*Última actualización: 9 de abril de 2026*
