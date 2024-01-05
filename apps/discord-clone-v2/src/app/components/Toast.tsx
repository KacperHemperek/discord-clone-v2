import { CheckCircle, Info, XCircle } from 'lucide-react';
import React from 'react';

export type ToastVariant = 'error' | 'success' | 'info';

export default function DCToast({
  message,
  variant,
}: {
  variant: ToastVariant;
  message: string;
}) {
  const size = 20;

  const icons: Record<ToastVariant, React.ReactNode> = {
    error: <XCircle size={size} className='text-dc-red-500' />,
    info: <Info size={size} className='text-sky-500' />,
    success: <CheckCircle size={size} className='text-dc-green-500' />,
  };

  return (
    <div className='bg-dc-neutral-950 rounded-md shadow-md flex gap-2 p-4 max-w-xs w-full'>
      {icons[variant]}
      <div className='flex flex-col gap-2'>
        <h1 className='capitalize'>{variant}</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}
