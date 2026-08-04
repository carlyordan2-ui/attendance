import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  const bgStyles = {
    success: 'bg-emerald-900/95 border-emerald-700 text-emerald-100 shadow-emerald-900/20',
    error: 'bg-rose-900/95 border-rose-700 text-rose-100 shadow-rose-900/20',
    info: 'bg-indigo-900/95 border-indigo-700 text-indigo-100 shadow-indigo-900/20'
  }[toastMessage.type];

  const Icon = {
    success: CheckCircle2,
    error: AlertTriangle,
    info: Info
  }[toastMessage.type];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-slide-up">
      <div className={`flex items-start space-x-3 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md ${bgStyles}`}>
        <Icon className="h-5 w-5 mt-0.5 shrink-0" />
        <div className="text-sm font-medium pr-2">
          {toastMessage.text}
        </div>
      </div>
    </div>
  );
};
