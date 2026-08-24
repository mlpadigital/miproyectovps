import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvwigepphqybmjscdynw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyNTA2NDYsImV4cCI6MjA3OTgyNjY0Nn0.aLZAKAbESsJJGn4zJ7S5WICB-I8-z14FwIaedcu4UuI';

const getDomain = () => {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') return '';
  
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `domain=.${parts.slice(-2).join('.')};`;
  }
  return '';
};

const cookieStorage = {
  getItem: (key) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  },
  setItem: (key, value) => {
    if (typeof document === 'undefined') return;
    const domain = getDomain();
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${key}=${encodeURIComponent(value)}; ${domain} path=/; expires=${expires.toUTCString()}; SameSite=Lax; Secure`;
  },
  removeItem: (key) => {
    if (typeof document === 'undefined') return;
    const domain = getDomain();
    document.cookie = `${key}=; ${domain} path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax; Secure`;
  }
};

const customSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: cookieStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52d2lnZXBwaHF5Ym1qc2NkeW53Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDI1MDY0NiwiZXhwIjoyMDc5ODI2NjQ2fQ.DvYvf-OWxCUY1C31c_a9zI-__1cCh_9poOas4C_3ZCU';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

export default customSupabaseClient;

export { 
    customSupabaseClient,
    customSupabaseClient as supabase,
    supabaseAdmin
};
