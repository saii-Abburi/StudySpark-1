import toast from 'not-a-toast';
import 'not-a-toast/style.css';

/**
 * Reusable wrapper for not-a-toast
 * Applies the application's global dark/orange theme by default.
 */
export const customToast = {
  success: (message) => {
    return toast({
      message,
      iconType: 'success',
      background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)',
      color: '#4ade80', 
      border: '1px solid #059669',
      duration: 3500,
    });
  },

  error: (message) => {
    return toast({
      message,
      iconType: 'error',
      background: 'linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%)',
      color: '#fca5a5', 
      border: '1px solid #dc2626',
      duration: 4000,
    });
  },

  info: (message) => {
    return toast({
      message,
      iconType: 'info',
      background: '#1f2937', 
      color: '#60a5fa', // text-blue-400
      border: '1px solid #374151', 
      duration: 3500,
    });
  }
};
