'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useWalletClient } from 'wagmi';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useIPFS } from '@/hooks/useIPFS';
import { useMarketplace } from '@/hooks/useMarketplace';
import api from '@/lib/axios';
import { UploadProgress } from '@/types';
import { ethers } from 'ethers';
import { CONTRACTS, ERC20_ABI, ERC721_ABI } from '@/lib/contracts';

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected, } = useAccount();
  const { uploadFile, uploadMetadata, uploading } = useIPFS();
  const { data: walletClient } = useWalletClient();
  const { listNFT } = useMarketplace();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    ipfs: false,
    mint: false,
    list: false,
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      setFile(droppedFile);
      const url = URL.createObjectURL(droppedFile);
      setPreviewUrl(url);
    }
  }, []);

  const handleCreate = async () => {
    if (!isConnected || !address) {
      toast.error('Por favor conecta tu billetera');
      return;
    }

    if (!file || !name || !description || !price) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsCreating(true);
    setProgress({ ipfs: false, mint: false, list: false });

    try {
      // Step 1: Upload to IPFS
      toast.info('Subiendo a IPFS...');
      // const imageUrl = await uploadFile(file);

      const metadata = {
        name: "NFT de prueba",
        description: "Este es un NFT de prueba mockeado",
        image: "ipfs://QmFakeHash123456789", // 👈 o una URL a IPFS gateway como https://ipfs.io/ipfs/Qm...
        attributes: []
      };


      // const metadataUrl = await uploadMetadata(metadata);
      setProgress(prev => ({ ...prev, ipfs: true }));
      toast.success('✅ Subido a IPFS');

      // Step 2: Mint NFT
      toast.info('Creando NFT...');


      if (!walletClient) {
        toast.error("No se pudo obtener el signer");
        return;
      }

      const provider = new ethers.BrowserProvider(walletClient.transport);
      const signer = await provider.getSigner();

      const nftContract = new ethers.Contract(CONTRACTS.NFT_ADDRESS, ERC721_ABI, signer);
      const tx = await nftContract.mint(address, metadata.image);
      const receipt = await tx.wait();
      const parsedLogs = receipt.logs
        .map((log: any) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .filter(Boolean);

      const tokenId = parsedLogs.find((log: any) => log?.name === "NFTMinted")?.args?.tokenId?.toString();
      console.log("✅ tokenId generado:", tokenId);


      setProgress(prev => ({ ...prev, mint: true }));
      toast.success('NFT creado exitosamente!');

      // Step 3: List NFT
      toast.info('Listando NFT para la venta...');
      await listNFT(tokenId, price);
      setProgress(prev => ({ ...prev, list: true }));
      toast.success('NFT listado exitosamente!');

      // Redirect after success
      setTimeout(() => {
        router.push('/my-nfts');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating NFT:', error);
      toast.error(error.message || 'Error al crear NFT');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Card>
          <CardContent className="p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Conecta tu Billetera</h2>
            <p className="text-muted-foreground mb-6">
              Necesitas conectar tu billetera para crear y acuñar NFTs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Crear NFT
          </h1>
          <p className="text-muted-foreground">
            Sube tu obra de arte y crea un NFT único
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>Subir Imagen</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('file-input')?.click();
                      }}
                    >
                      Cambiar Imagen
                    </Button>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg mb-2">Arrastra tu imagen aquí</p>
                    <p className="text-sm text-muted-foreground">
                      o haz clic para navegar (PNG, JPG, GIF hasta 10MB)
                    </p>
                  </div>
                )}
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* NFT Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  placeholder="Ingresa el nombre del NFT"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  placeholder="Describe tu NFT"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio (DIP)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.0"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
            </div>

            {/* Progress Indicators */}
            {isCreating && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">Progreso de Creación</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {progress.ipfs ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isCreating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={progress.ipfs ? 'text-green-600' : ''}>
                      Subir a IPFS
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {progress.mint ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : progress.ipfs && isCreating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={progress.mint ? 'text-green-600' : ''}>
                      Crear NFT
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {progress.list ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : progress.mint && isCreating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    <span className={progress.list ? 'text-green-600' : ''}>
                      Listar para Venta
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreate}
              disabled={!file || !name || !description || !price || isCreating || uploading}
              className="w-full"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Creando NFT...
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Crear y Listar NFT
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}