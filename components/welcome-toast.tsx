'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes('welcome-toast=2')) {
      toast('🛍️ Welcome to Our Store', {
        id: 'welcome-toast',
        duration: Infinity,
        onDismiss: () => {
          document.cookie = 'welcome-toast=2; max-age=31536000; path=/';
        },
        description: (
          <>
           Your Health Your Wealth.Invest in your future Today{' '}
            <a
              href="https://lizmartnaturals.co.ke"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              Start Shopping Now
            </a>
            .
          </>
        )
      });
    }
  }, []);

  return null;
}
