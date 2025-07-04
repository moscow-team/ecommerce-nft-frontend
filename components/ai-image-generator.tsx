'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { aiImageService } from '@/lib/ai-image-service';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, RefreshCw, Download, Eye, Settings } from 'lucide-react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string, file: File) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
}

const imageStyles = [
  { value: 'realistic', label: 'Realista' },
  { value: 'artistic', label: 'Artístico' },
  { value: 'anime', label: 'Anime' },
  { value: 'abstract', label: 'Abstracto' },
  { value: 'digital-art', label: 'Arte Digital' },
  { value: 'oil-painting', label: 'Pintura al Óleo' },
  { value: 'watercolor', label: 'Acuarela' },
  { value: 'cyberpunk', label: 'Cyberpunk' },
];

const aspectRatios = [
  { value: '1:1', label: 'Cuadrado (1:1)' },
  { value: '16:9', label: 'Panorámico (16:9)' },
  { value: '9:16', label: 'Vertical (9:16)' },
  { value: '4:3', label: 'Clásico (4:3)' },
];

export default function AIImageGenerator({ onImageGenerated, isGenerating, setIsGenerating }: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted, ugly');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [steps, setSteps] = useState([30]);
  const [guidance, setGuidance] = useState([7.5]);
  const [generatedImages, setGeneratedImages] = useState<{ url: string; blob: Blob }[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateImage = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error('Por favor ingresa un prompt');
      return;
    }

    // Check if API key is configured
    if (!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
      toast.error('API key de Hugging Face no configurada. Usando imágenes de demostración.');

      // Fallback to demo images
      const demoImages = [
        'https://images.pexels.com/photos/1568607/pexels-photo-1568607.jpeg?auto=compress&cs=tinysrgb&w=512',
        'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=512',
        'https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&w=512',
        'https://images.pexels.com/photos/1183992/pexels-photo-1183992.jpeg?auto=compress&cs=tinysrgb&w=512',
      ];

      setIsGenerating(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const demoImageData = await Promise.all(
        demoImages.map(async (url) => {
          const response = await fetch(url);
          const blob = await response.blob();
          return { url, blob };
        })
      );

      setGeneratedImages(demoImageData);
      setIsGenerating(false);
      toast.success('¡Imágenes de demostración cargadas!');
      return;
    }

    setIsGenerating(true);
    setGeneratedImages([]);
    setSelectedImage('');

    try {
      toast.info('Generando imágenes con IA...');

      const blobs = await aiImageService.generateMultipleImages({
        prompt,
        negativePrompt,
        style: selectedStyle,
        aspectRatio: selectedRatio,
        steps: steps[0],
        guidance: guidance[0]
      }, 4);

      const imageData = await Promise.all(
        blobs.map(async (blob) => {
          const url = await aiImageService.blobToDataURL(blob);
          return { url, blob };
        })
      );

      setGeneratedImages(imageData);
      toast.success('¡Imágenes generadas exitosamente!');
    } catch (error: any) {
      console.error('Error generating image:', error);
      toast.error(error.message || 'Error al generar la imagen');
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, negativePrompt, selectedStyle, selectedRatio, steps, guidance, setIsGenerating]);

  const selectImage = useCallback(async (imageData: { url: string; blob: Blob }) => {
    setSelectedImage(imageData.url);

    try {
      const file = aiImageService.blobToFile(imageData.blob, 'ai-generated-image.png');
      onImageGenerated(imageData.url, file);
      toast.success('Imagen seleccionada para tu NFT');
    } catch (error) {
      console.error('Error selecting image:', error);
      toast.error('Error al seleccionar la imagen');
    }
  }, [onImageGenerated]);

  const downloadImage = useCallback(async (imageData: { url: string; blob: Blob }) => {
    try {
      const url = URL.createObjectURL(imageData.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-generated-image.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Imagen descargada');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Error al descargar la imagen');
    }
  }, []);

  const suggestedPrompts = [
    'Un dragón majestuoso volando sobre montañas nevadas',
    'Ciudad futurista con luces de neón al atardecer',
    'Bosque mágico con criaturas fantásticas',
    'Retrato de un guerrero cyberpunk',
    'Paisaje alienígena con dos soles',
    'Robot humanoide en un jardín zen',
    'Castillo flotante en las nubes',
    'Océano de cristal con ballenas luminosas'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Generador de Imágenes IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* API Key Warning */}
          {!process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <span className="text-sm font-medium">⚠️ Modo Demostración</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Para usar IA real, configura tu API key de Hugging Face en las variables de entorno.
              </p>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt Principal</Label>
            <Textarea
              id="prompt"
              placeholder="Describe la imagen que quieres generar..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              maxLength={150}
              className="resize-none"
            />
          </div>

          {/* Suggested Prompts */}
          <div className="space-y-2">
            <Label>Prompts Sugeridos</Label>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Style and Ratio Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Estilo de Arte</Label>
              <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un estilo" />
                </SelectTrigger>
                <SelectContent>
                  {imageStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Proporción</Label>
              <Select value={selectedRatio} onValueChange={setSelectedRatio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona proporción" />
                </SelectTrigger>
                <SelectContent>
                  {aspectRatios.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value} disabled={true}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {/*
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
              >
              <Settings className="h-4 w-4" />
              Configuración Avanzada
            </Button>
                  

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="space-y-2">
                  <Label htmlFor="negative-prompt">Prompt Negativo</Label>
                  <Input
                    id="negative-prompt"
                    placeholder="Qué NO quieres en la imagen..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pasos de Inferencia: {steps[0]}</Label>
                    <Slider
                      value={steps}
                      onValueChange={setSteps}
                      max={50}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Escala de Guía: {guidance[0]}</Label>
                    <Slider
                      value={guidance}
                      onValueChange={setGuidance}
                      max={20}
                      min={1}
                      step={0.5}
                      className="w-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>
          */}

          {/* Generate Button */}
          <Button
            onClick={generateImage}
            disabled={!prompt.trim() || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Generando Imágenes...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Generar Imágenes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Imágenes Generadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((imageData, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative group"
                >
                  <img
                    src={imageData.url}
                    alt={`Generated ${index + 1}`}
                    className={`w-full h-48 object-cover rounded-lg cursor-pointer transition-all duration-200 ${selectedImage === imageData.url
                        ? 'ring-4 ring-purple-500 ring-opacity-50'
                        : 'hover:scale-105'
                      }`}
                    onClick={() => selectImage(imageData)}
                  />

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          selectImage(imageData);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadImage(imageData);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedImage === imageData.url && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {generatedImages.length > 0 && (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={generateImage}
                  disabled={isGenerating}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generar Nuevas Imágenes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}