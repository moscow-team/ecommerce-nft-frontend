'use client';

import { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { AlertTriangle, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from '@/hooks/useI18n';

export const NetworkChecker = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showModal, setShowModal] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (isConnected && chainId !== polygonAmoy.id) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [isConnected, chainId]);

  const handleSwitchNetwork = () => {
    switchChain({ chainId: polygonAmoy.id });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Wrong Network
          </DialogTitle>
          <DialogDescription>
            {t('error.network', 'Please switch to Polygon Amoy network to use this application.')}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 p-4 bg-orange-50 rounded-lg border border-orange-200">
            <Network className="h-4 w-4 text-orange-600" />
            <span className="text-sm text-orange-800">
              Current: {chainId} | Required: Polygon Amoy ({polygonAmoy.id})
            </span>
          </div>
          <Button onClick={handleSwitchNetwork} className="w-full">
            Switch to Polygon Amoy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};