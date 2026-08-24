import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Bell, 
  History, 
  Settings, 
  Plus, 
  Edit2, 
  Send, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Variable
} from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// --- Configuration Constants ---

const TRIGGER_TYPES = {
  new_order: {
    label: 'Nuevo Pedido Confirmado',
    description: 'Se envía al cliente cuando completa una compra.',
    defaultSubject: 'Confirmación de pedido #{{order_id}}',
    defaultBody: 'Hola {{customer_name}},\n\nGracias por tu compra en {{store_name}}.\nTu pedido #{{order_id}} ha sido confirmado por un total de {{total_amount}}.\n\nSaludos,\nEl equipo de {{store_name}}',
    variables: ['{{customer_name}}', '{{order_id}}', '{{total_amount}}', '{{store_name}}'],
    recipient: 'customer'
  },
  low_stock: {
    label: 'Alerta de Stock Bajo',
    description: 'Se envía al administrador cuando un producto alcanza el stock mínimo.',
    defaultSubject: 'Alerta: Stock bajo para {{product_name}}',
    defaultBody: 'Atención,\n\nEl producto {{product_name}} tiene pocas unidades disponibles ({{current_stock}} restantes).\nEs recomendable reponer stock pronto.\n\nPanel de Administración',
    variables: ['{{product_name}}', '{{current_stock}}', '{{store_name}}'],
    recipient: 'admin'
  },
  welcome_customer: {
    label: 'Bienvenida Nuevo Cliente',
    description: 'Se envía al cliente cuando se registra una cuenta nueva.',
    defaultSubject: '¡Bienvenido a {{store_name}}!',
    defaultBody: 'Hola {{customer_name}},\n\nEstamos muy felices de que te hayas unido a {{store_name}}. Explora nuestro catálogo y descubre las mejores ofertas.\n\n¡Esperamos verte pronto!',
    variables: ['{{customer_name}}', '{{store_name}}'],
    recipient: 'customer'
  },
  abandoned_cart: {
    label: 'Recuperación de Carrito',
    description: 'Se envía si el cliente deja productos en el carrito sin comprar.',
    defaultSubject: '¿Olvidaste algo en {{store_name}}?',
    defaultBody: 'Hola {{customer_name}},\n\nNotamos que dejaste algunos productos en tu carrito. ¡No te los pierdas! Completa tu compra aquí: {{checkout_url}}\n\nSaludos.',
    variables: ['{{customer_name}}', '{{checkout_url}}', '{{store_name}}'],
    recipient: 'customer'
  }
};

// --- Components ---

const VariablePill = ({ variable, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(variable)}
    className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium hover:bg-slate-200 transition-colors border border-slate-200"
  >
    <Variable className="w-3 h-3 mr-1 text-violet-500" />
    {variable}
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    sent: "bg-green-100 text-green-700 border-green-200",
    failed: "bg-red-100 text-red-700 border-red-200",
    queued: "bg-amber-100 text-amber-700 border-amber-200"
  };
  
  const labels = {
    sent: "Enviado",
    failed: "Fallido",
    queued: "En Cola"
  };

  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1 w-fit", styles[status] || styles.queued)}>
      {status === 'sent' && <CheckCircle2 className="w-3 h-3" />}
      {status === 'failed' && <XCircle className="w-3 h-3" />}
      {status === 'queued' && <Clock className="w-3 h-3" />}
      {labels[status] || status}
    </span>
  );
};

const NotificationsPage = () => {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [storeId, setStoreId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("automation");
  
  // Data State
  const [templates, setTemplates] = useState([]);
  const [logs, setLogs] = useState([]);
  
  // Editor State
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null); // null means creating new or selecting existing
  const [editForm, setEditForm] = useState({ subject: '', body: '', isActive: true });

  // Test Email State
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .limit(1).single();

      if (storeError) throw storeError;
      setStoreId(storeData.id);

      // Fetch Templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('store_id', storeData.id);

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Fetch Logs
      const { data: logsData, error: logsError } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logsError) throw logsError;
      setLogs(logsData || []);

    } catch (error) {
      console.error('Error loading notification data:', error);
      toast({
        variant: "destructive",
        title: "Error de carga",
        description: "No se pudieron cargar las configuraciones de notificaciones.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (triggerKey) => {
    const existing = templates.find(t => t.trigger_event === triggerKey);
    const defaultConfig = TRIGGER_TYPES[triggerKey];

    if (existing) {
      setCurrentTemplate(existing);
      setEditForm({
        subject: existing.subject_template,
        body: existing.body_template,
        isActive: existing.is_active
      });
    } else {
      // Prepare a "virtual" template for a trigger that hasn't been saved to DB yet
      setCurrentTemplate({
        trigger_event: triggerKey,
        name: defaultConfig.label,
        recipient_type: defaultConfig.recipient,
        is_virtual: true // Flag to know it's new
      });
      setEditForm({
        subject: defaultConfig.defaultSubject,
        body: defaultConfig.defaultBody,
        isActive: true
      });
    }
    setIsEditing(true);
  };

  const handleSaveTemplate = async () => {
    try {
      const payload = {
        store_id: storeId,
        name: currentTemplate.name || TRIGGER_TYPES[currentTemplate.trigger_event].label,
        trigger_event: currentTemplate.trigger_event,
        subject_template: editForm.subject,
        body_template: editForm.body,
        recipient_type: currentTemplate.recipient_type || TRIGGER_TYPES[currentTemplate.trigger_event].recipient,
        is_active: editForm.isActive
      };

      let error;
      if (currentTemplate.is_virtual) {
        const { data, error: insertError } = await supabase
          .from('notification_templates')
          .insert([payload])
          .select()
          .limit(1).single();
        error = insertError;
        if (data) {
          setTemplates(prev => [...prev, data]);
        }
      } else {
        const { data, error: updateError } = await supabase
          .from('notification_templates')
          .update(payload)
          .eq('id', currentTemplate.id)
          .select()
          .limit(1).single();
        error = updateError;
        if (data) {
          setTemplates(prev => prev.map(t => t.id === data.id ? data : t));
        }
      }

      if (error) throw error;

      toast({
        title: "Plantilla guardada",
        description: "La configuración de la notificación ha sido actualizada.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la plantilla.",
      });
    }
  };

  const handleToggleActive = async (template, newValue) => {
     // If virtual, we need to create it first or just ignore? 
     // UX decision: If user toggles a non-existent template, we create it with defaults.
     if (!template.id) {
       // Find defaults
       const triggerKey = Object.keys(TRIGGER_TYPES).find(key => TRIGGER_TYPES[key].label === template.name || key === template.trigger_event); // Fallback lookup
       if (!triggerKey) return;
       
       const defaultConfig = TRIGGER_TYPES[triggerKey];
       const payload = {
         store_id: storeId,
         name: defaultConfig.label,
         trigger_event: triggerKey,
         subject_template: defaultConfig.defaultSubject,
         body_template: defaultConfig.defaultBody,
         recipient_type: defaultConfig.recipient,
         is_active: newValue
       };
       
       const { data, error } = await supabase.from('notification_templates').insert([payload]).select().limit(1).single();
       if (!error && data) {
         setTemplates(prev => [...prev, data]);
         toast({ title: newValue ? "Notificación activada" : "Notificación desactivada" });
       }
     } else {
       const { error } = await supabase
         .from('notification_templates')
         .update({ is_active: newValue })
         .eq('id', template.id);
         
       if (!error) {
         setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, is_active: newValue } : t));
         toast({ title: newValue ? "Notificación activada" : "Notificación desactivada" });
       }
     }
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({ variant: "destructive", title: "Email requerido", description: "Por favor ingresa un email destinatario." });
      return;
    }

    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 1000));

      const logEntry = {
        store_id: storeId,
        recipient: testEmail,
        subject: `[PRUEBA] ${editForm.subject}`,
        status: 'sent',
        trigger_event: currentTemplate.trigger_event,
        error_message: null
      };

      const { data, error } = await supabase.from('notification_logs').insert([logEntry]).select().limit(1).single();
      
      if (error) throw error;

      setLogs(prev => [data, ...prev]);
      setIsTestDialogOpen(false);
      setTestEmail('');
      toast({
        title: "Email de prueba enviado",
        description: `Se ha enviado un simulacro a ${testEmail}`,
      });

    } catch (error) {
      console.error('Error sending test:', error);
      toast({ variant: "destructive", title: "Error", description: "Falló el envío de prueba." });
    }
  };

  const insertVariable = (variableName, field) => {
    if (field === 'subject') {
      setEditForm(prev => ({ ...prev, subject: prev.subject + ' ' + variableName }));
    } else {
      setEditForm(prev => ({ ...prev, body: prev.body + ' ' + variableName }));
    }
  };

  // Combine predefined types with existing DB templates to render the list
  const combinedTemplates = Object.entries(TRIGGER_TYPES).map(([key, config]) => {
    const dbTemplate = templates.find(t => t.trigger_event === key);
    return {
      trigger_event: key,
      ...config,
      ...(dbTemplate || { is_active: false, id: null }) // Merge DB state if exists
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notificaciones por Email</h1>
          <p className="text-slate-500">Gestiona las plantillas y automatizaciones de correo para tu tienda.</p>
        </div>
        {/* <Button>
          <Plus className="w-4 h-4 mr-2" /> Nueva Automatización
        </Button> */}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="automation">Automatizaciones</TabsTrigger>
          <TabsTrigger value="history">Historial de Envíos</TabsTrigger>
        </TabsList>

        <TabsContent value="automation" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {combinedTemplates.map((template) => (
              <Card key={template.trigger_event} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-lg", 
                        template.is_active ? "bg-violet-100 text-violet-600" : "bg-slate-100 text-slate-500"
                      )}>
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{template.label}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          Destinatario: {template.recipient === 'admin' ? 'Administrador' : 'Cliente'}
                        </CardDescription>
                      </div>
                    </div>
                    <Switch 
                      checked={!!template.is_active}
                      onCheckedChange={(val) => handleToggleActive(template, val)}
                    />
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-slate-500 pb-3">
                  {template.description}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-2 border-slate-200 hover:bg-slate-50 text-slate-700"
                    onClick={() => handleOpenEdit(template.trigger_event)}
                  >
                    <Edit2 className="w-3 h-3 mr-2" /> Configurar Plantilla
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Registro de Notificaciones</CardTitle>
              <CardDescription>Últimos 20 correos enviados desde tu tienda.</CardDescription>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No hay registros de correos enviados aún.</p>
                </div>
              ) : (
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">Fecha</th>
                        <th className="px-6 py-3">Evento</th>
                        <th className="px-6 py-3">Destinatario</th>
                        <th className="px-6 py-3">Asunto</th>
                        <th className="px-6 py-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="bg-white border-b hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="capitalize">
                              {TRIGGER_TYPES[log.trigger_event]?.label || log.trigger_event}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">{log.recipient}</td>
                          <td className="px-6 py-4 truncate max-w-[200px]">{log.subject}</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={log.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Sheet */}
      <Sheet open={isEditing} onOpenChange={setIsEditing}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Editar Plantilla: {currentTemplate?.name || TRIGGER_TYPES[currentTemplate?.trigger_event]?.label}</SheetTitle>
            <SheetDescription>
              Personaliza el asunto y contenido del correo. Usa las variables disponibles para insertar datos dinámicos.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={editForm.isActive}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, isActive: checked }))}
                />
                <span className="text-sm text-slate-600">
                  {editForm.isActive ? "Notificación Activa" : "Notificación Pausada"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asunto del Correo</label>
              <Input 
                value={editForm.subject}
                onChange={(e) => setEditForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Ej: Gracias por tu compra"
              />
              <div className="flex flex-wrap gap-2 mt-1">
                {TRIGGER_TYPES[currentTemplate?.trigger_event]?.variables.map(v => (
                  <VariablePill key={v} variable={v} onClick={(val) => insertVariable(val, 'subject')} />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contenido del Mensaje</label>
              <Textarea 
                value={editForm.body}
                onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Escribe el cuerpo del correo aquí..."
                className="min-h-[250px] font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2 mt-1">
                {TRIGGER_TYPES[currentTemplate?.trigger_event]?.variables.map(v => (
                  <VariablePill key={v} variable={v} onClick={(val) => insertVariable(val, 'body')} />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Nota: Este editor soporta texto plano. Para diseños HTML avanzados, contacta a soporte.
              </p>
            </div>
          </div>

          <SheetFooter className="flex-col sm:flex-row gap-3 sm:justify-between items-center">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsTestDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Send className="w-4 h-4 mr-2" /> Probar Envío
            </Button>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none">Cancelar</Button>
              <Button onClick={handleSaveTemplate} className="flex-1 sm:flex-none bg-violet-600 hover:bg-violet-700">Guardar Cambios</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Test Email Dialog */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Prueba</DialogTitle>
            <DialogDescription>
              Ingresa una dirección de correo para recibir una vista previa de esta plantilla.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="tu@email.com" 
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTestDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSendTest} className="bg-violet-600">Enviar Ahora</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default NotificationsPage;