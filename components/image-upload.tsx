'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface ImageUploadProps {
  file: File | null;
  previewUrl: string;
  onFileChange: (file: File | null) => void;
  onPreviewChange: (url: string) => void;
}

export default function ImageUpload({ file, previewUrl, onFileChange, onPreviewChange }: ImageUploadProps) {
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
      
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen.');
        return;
      }

      onFileChange(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      onPreviewChange(url);
    }
  }, [onFileChange, onPreviewChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-primary');
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-primary');
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB.');
        return;
      }
      
      if (!droppedFile.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen.');
        return;
      }

      onFileChange(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      onPreviewChange(url);
    }
  }, [onFileChange, onPreviewChange]);

  const clearFile = useCallback(() => {
    onFileChange(null);
    onPreviewChange('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [onFileChange, onPreviewChange, previewUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-blue-500" />
          Subir Imagen
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Label>Archivo de Imagen</Label>
          
          {previewUrl ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full max-h-80 object-cover rounded-lg shadow-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  Cambiar Imagen
                </Button>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{file.name}</span>
                    <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-8"
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium mb-2">Arrastra tu imagen aquí</p>
                <p className="text-sm text-muted-foreground mb-4">
                  o haz clic para navegar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF hasta 10MB
                </p>
              </motion.div>
            </div>
          )}

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </CardContent>
    </Card>
  );
}