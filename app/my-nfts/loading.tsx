import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function MyNFTsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size={48} />
    </div>
  );
}