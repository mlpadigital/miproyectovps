import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  RefreshCw, 
  MessageSquare,
  Instagram,
  Facebook,
  Mail,
  Smartphone,
  Wand2,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { askGroq } from '@/services/groqService';
import { cn } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TONES = [
  { id: 'persuasivo', label: 'Persuasivo', emoji: '🎯' },
  { id: 'profesional', label: 'Profesional', emoji: '💼' },
  { id: 'divertido', label: 'Divertido', emoji: '🎉' },
  { id: 'urgencia', label: 'Sentido de Urgencia', emoji: '⏰' },
];

const FORMATS = [
  { id: 'instagram', label: 'Instagram Post', icon: Instagram },
  { id: 'facebook', label: 'Facebook Ad', icon: Facebook },
  { id: 'whatsapp', label: 'WhatsApp Promo', icon: Smartphone },
  { id: 'email', label: 'Email Marketing', icon: Mail },
];

const AiCopywriterPage = () => {
  const { toast } = useToast();
  
  const [productDesc, setProductDesc] = useState('');
  const [selectedTone, setSelectedTone] = useState('persuasivo');
  const [selectedFormat, setSelectedFormat] = useState('instagram');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerate = async () => {
    if (!productDesc.trim()) {
      toast({
        title: "Campo requerido",
        description: "Por favor, escribe una breve descripción del producto.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setErrorMsg('');
    setGeneratedResult('');
    setCopied(false);

    try {
      const systemPrompt = `Eres un experto copywriter de marketing digital. Tu objetivo es escribir un texto altamente efectivo para ventas. 
El formato destino es: ${selectedFormat.toUpperCase()}.
El tono debe ser: ${selectedTone.toUpperCase()}.
Usa emojis adecuados si el formato lo permite (como en Instagram o WhatsApp). Estructura el texto con saltos de línea para que sea fácil de leer. No agregues introducciones tuyas, solo devuelve el texto final listo para copiar y pegar.`;

      const userPrompt = `Escribe un copy de marketing para este producto/servicio: ${productDesc}`;

      const result = await askGroq(userPrompt, systemPrompt);
      
      if (result && !result.includes('Error HTTP: 401') && !result.includes('Ocurrió un error')) {
        setGeneratedResult(result);
      } else {
        throw new Error(result || "Error desconocido");
      }
    } catch (error) {
      console.error("Error generando copy:", error);
      setErrorMsg("No pudimos conectar con la IA. Por favor, verifica que tu VITE_GROQ_API_KEY esté configurada correctamente en Supabase/Vercel o en tu archivo .env local.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    toast({
      title: "Copiado al portapapeles",
      description: "El texto está listo para usar.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-violet-500" />
            Asistente de Copys IA
          </h1>
          <p className="text-slate-500">Crea textos persuasivos para tus redes sociales y campañas de email al instante.</p>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Conexión IA</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Configuración del Mensaje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Product Info */}
              <div className="space-y-2">
                <Label htmlFor="product" className="text-slate-700">¿Qué estás vendiendo?</Label>
                <Textarea 
                  id="product"
                  placeholder="Ej: Zapatillas urbanas de cuero sintético blanco, súper cómodas, ideales para uso diario. Tenemos 20% de descuento este fin de semana."
                  className="min-h-[120px] resize-none"
                  value={productDesc}
                  onChange={(e) => setProductDesc(e.target.value)}
                />
              </div>

              {/* Format Selector */}
              <div className="space-y-3">
                <Label className="text-slate-700">Formato / Plataforma</Label>
                <div className="grid grid-cols-2 gap-2">
                  {FORMATS.map(format => {
                    const Icon = format.icon;
                    const isSelected = selectedFormat === format.id;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all",
                          isSelected 
                            ? "bg-violet-50 border-violet-200 text-violet-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isSelected ? "text-violet-600" : "text-slate-400")} />
                        {format.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Tone Selector */}
              <div className="space-y-3">
                <Label className="text-slate-700">Tono de voz</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map(tone => {
                    const isSelected = selectedTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        onClick={() => setSelectedTone(tone.id)}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all text-left",
                          isSelected 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-lg">{tone.emoji}</span>
                        {tone.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <Button 
                onClick={handleGenerate}
                disabled={isGenerating || !productDesc.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-md"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generando magia...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5 mr-2" />
                    Generar Copy
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* PANEL DERECHO: RESULTADO */}
        <div className="lg:col-span-7">
          <Card className={cn(
            "h-full min-h-[500px] shadow-sm border transition-all duration-300",
            generatedResult ? "border-violet-200 bg-white" : "border-slate-200 bg-slate-50/50"
          )}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 bg-white rounded-t-xl">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-400" />
                  Resultado Generado
                </CardTitle>
                <CardDescription>Tu texto listo para brillar</CardDescription>
              </div>
              {generatedResult && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopy}
                  className={cn("transition-colors", copied ? "bg-green-50 text-green-700 border-green-200" : "")}
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-violet-200 blur-xl rounded-full animate-pulse opacity-50" />
                    <Wand2 className="w-12 h-12 text-violet-500 animate-bounce relative z-10" />
                  </div>
                  <p className="text-sm font-medium animate-pulse">Escribiendo las mejores palabras para tu producto...</p>
                </div>
              ) : generatedResult ? (
                <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {generatedResult}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-400 space-y-4">
                  <Sparkles className="w-12 h-12 text-slate-200" />
                  <p className="text-sm font-medium text-center max-w-[250px]">
                    Completa los detalles de tu producto a la izquierda y presiona "Generar" para ver la magia.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default AiCopywriterPage;
