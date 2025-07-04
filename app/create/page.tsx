'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIImageGenerator from '@/components/ai-image-generator';
import ImageUpload from '@/components/image-upload';
import { motion } from 'framer-motion';
import { CheckCircle, Image as ImageIcon, Loader2, Upload, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { CONTRACTS, ERC721_ABI } from '@/lib/contracts';
import { ethers } from 'ethers';
import { useAccount, useWalletClient } from 'wagmi';
import { useIPFS } from '@/hooks/useIPFS';
import { useMarketplace } from '@/hooks/useMarketplace';

interface UploadProgress {
  ipfs: boolean;
  mint: boolean;
  list: boolean;
}

export default function CreateNFTPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { uploadFile, uploadMetadata, uploading } = useIPFS();
  const { listNFT } = useMarketplace();
  const { data: walletClient } = useWalletClient();
  const [activeTab, setActiveTab] = useState('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<UploadProgress>({
    ipfs: false,
    mint: false,
    list: false,
  });

  const handleImageGenerated = (imageUrl: string, generatedFile: File) => {
    setFile(generatedFile);
    setPreviewUrl(imageUrl);
    toast.success('Imagen generada y seleccionada');
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
  };

  const handlePreviewChange = (url: string) => {
    setPreviewUrl(url);
  };

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
      const imageUrl = await uploadFile(file);
      const metadataUrl = await uploadMetadata({
        name,
        description,
        image: imageUrl,
      });

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
      const tx = await nftContract.mint(address, metadataUrl);

      const receipt = await tx.wait();

      // Parsear logs para obtener el tokenId desde el evento
      const parsedLogs = receipt.logs
        .map((log: any) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .filter((log: any) => log?.name === "NFTMinted");

      if (parsedLogs.length === 0) {
        throw new Error("No se pudo obtener el tokenId del evento");
      }

      const tokenId = parsedLogs[0].args.tokenId.toString();
      console.log("✅ tokenId generado:", tokenId);


      setProgress(prev => ({ ...prev, mint: true }));
      toast.success('NFT creado exitosamente!');

      // Step 3: Approve NFT
      toast.info('Aprobando NFT para el Marketplace...');
      const approveTx = await nftContract.approve(CONTRACTS.MARKET_ADDRESS, tokenId);
      await approveTx.wait(); // 🔥 espera que la aprobación se mine
      toast.success('✅ Aprobación completada');

      // Step 4: List NFT
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

  if (!isConnected || !address) {
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
    <div className="max-w-4xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Crear NFT
          </h1>
          <p className="text-muted-foreground text-lg">
            Sube tu obra de arte o genera una imagen con IA para crear un NFT único
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Subir Imagen
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Generar con IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <ImageUpload
              file={file}
              previewUrl={previewUrl}
              onFileChange={handleFileChange}
              onPreviewChange={handlePreviewChange}
            />
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <AIImageGenerator
              onImageGenerated={handleImageGenerated}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </TabsContent>
        </Tabs>

        {/* NFT Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Detalles del NFT</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Progress Indicators */}
            {isCreating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border"
              >
                <h3 className="font-semibold text-lg">Progreso de Creación</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {progress.ipfs ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : isCreating ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                    )}
                    <div className="flex-1">
                      <span className={`font-medium ${progress.ipfs ? 'text-green-600' : ''}`}>
                        Subir a IPFS
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Almacenando imagen y metadatos de forma descentralizada
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {progress.mint ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : progress.ipfs && isCreating ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                    )}
                    <div className="flex-1">
                      <span className={`font-medium ${progress.mint ? 'text-green-600' : ''}`}>
                        Crear NFT
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Acuñando tu NFT en la blockchain
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {progress.list ? (
                      <CheckCircle className="h-6 w-6 text-green-500" />
                    ) : progress.mint && isCreating ? (
                      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    ) : (
                      <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                    )}
                    <div className="flex-1">
                      <span className={`font-medium ${progress.list ? 'text-green-600' : ''}`}>
                        Listar para Venta
                      </span>
                      <p className="text-sm text-muted-foreground">
                        Poniendo tu NFT disponible en el marketplace
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <Button
              onClick={handleCreate}
              disabled={!file || !name || !description || !price || isCreating || uploading || isGenerating}
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