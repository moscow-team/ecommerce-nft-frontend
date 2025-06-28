'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
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
import { useI18n } from '@/hooks/useI18n';
import api from '@/lib/axios';
import { UploadProgress } from '@/types';

export default function CreatePage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { uploadFile, uploadMetadata, uploading } = useIPFS();
  const { listNFT } = useMarketplace();
  const { t } = useI18n();

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
      toast.error('Please connect your wallet');
      return;
    }

    if (!file || !name || !description || !price) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsCreating(true);
    setProgress({ ipfs: false, mint: false, list: false });

    try {
      // Step 1: Upload to IPFS
      toast.info('Uploading to IPFS...');
      const imageUrl = await uploadFile(file);
      
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: []
      };
      
      const metadataUrl = await uploadMetadata(metadata);
      setProgress(prev => ({ ...prev, ipfs: true }));
      toast.success('✅ Uploaded to IPFS');

      // Step 2: Mint NFT
      toast.info('Minting NFT...');
      const mintResponse = await api.post('/api/nfts/mint', {
        to: address,
        tokenURI: metadataUrl,
      });
      
      const tokenId = mintResponse.data.tokenId;
      setProgress(prev => ({ ...prev, mint: true }));
      toast.success(t('success.minted'));

      // Step 3: List NFT
      toast.info('Listing NFT for sale...');
      await listNFT(tokenId, price);
      setProgress(prev => ({ ...prev, list: true }));
      toast.success(t('success.listed'));

      // Redirect after success
      setTimeout(() => {
        router.push('/my-nfts');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating NFT:', error);
      toast.error(error.message || 'Failed to create NFT');
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
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-6">
              You need to connect your wallet to create and mint NFTs.
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
            {t('create.title', 'Create NFT')}
          </h1>
          <p className="text-muted-foreground">
            Upload your artwork and create a unique NFT
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>NFT Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>{t('create.upload', 'Upload Image')}</Label>
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
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <div className="py-8">
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-lg mb-2">Drop your image here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse (PNG, JPG, GIF up to 10MB)
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
                <Label htmlFor="name">{t('create.name', 'Name')}</Label>
                <Input
                  id="name"
                  placeholder="Enter NFT name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t('create.description', 'Description')}</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your NFT"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">{t('create.price', 'Price (DIP)')}</Label>
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
                <h3 className="font-semibold">Creation Progress</h3>
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
                      Upload to IPFS
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
                      Mint NFT
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
                      List for Sale
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
                  Creating NFT...
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5 mr-2" />
                  {t('create.mint', 'Mint & List NFT')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}