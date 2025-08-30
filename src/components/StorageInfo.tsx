import React from 'react';
import { Clock, Server, HardDrive, AlertCircle } from 'lucide-react';

interface StorageInfoProps {
  job: {
    fileSize?: number;
    expiresAt?: Date;
    storageType?: string;
  };
  userPlan: 'free' | 'pro' | 'team';
}

const StorageInfo: React.FC<StorageInfoProps> = ({ job, userPlan }) => {
  const formatFileSize = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStorageInfo = () => {
    if (!job.fileSize) return null;
    
    const isLargeFile = job.fileSize > 100 * 1024 * 1024; // 100MB
    const expiresIn = job.expiresAt ? Math.ceil((job.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60)) : 0;
    
    if (isLargeFile && userPlan === 'free') {
      return {
        type: 'upgrade-required',
        message: 'Large file generation requires Pro plan',
        icon: AlertCircle,
        color: 'text-amber-600 bg-amber-50'
      };
    }
    
    if (job.fileSize < 100 * 1024 * 1024) {
      return {
        type: 'browser-memory',
        message: `Stored in browser memory • Available until page refresh`,
        icon: HardDrive,
        color: 'text-blue-600 bg-blue-50'
      };
    }
    
    return {
      type: 'cloud-storage',
      message: `Stored in cloud • Expires in ${expiresIn} hours`,
      icon: Server,
      color: 'text-green-600 bg-green-50'
    };
  };

  const storageInfo = getStorageInfo();
  if (!storageInfo) return null;

  const Icon = storageInfo.icon;

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${storageInfo.color}`}>
      <Icon className="w-4 h-4" />
      <span>{storageInfo.message}</span>
    </div>
  );
};

export default StorageInfo;