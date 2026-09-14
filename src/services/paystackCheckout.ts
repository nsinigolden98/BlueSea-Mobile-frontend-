import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

/**
 * Opens the Paystack checkout authorization URL inside an in-app browser overlay
 * when running within a native Capacitor environment (Android/iOS).
 *
 * Resolves when the checkout session closes/finishes, returning control
 * back to the native app context.
 */
export async function openMobilePaystackCheckout(authorizationUrl: string): Promise<void> {
  if (!authorizationUrl) {
    throw new Error('Authorization URL is required.');
  }

  // Fallback to standard web redirect if not running on native platform
  if (!Capacitor.isNativePlatform()) {
    window.location.href = authorizationUrl;
    return;
  }

  return new Promise<void>((resolve) => {
    let finishedListener: any = null;

    const cleanup = async () => {
      if (finishedListener) {
        try {
          await finishedListener.remove();
        } catch (e) {
          console.error('Error removing browser listener:', e);
        }
      }
    };

    const finishCheckout = async () => {
      await cleanup();
      resolve();
    };

    const openCheckout = async () => {
      try {
        finishedListener = await Browser.addListener('browserFinished', async () => {
          await finishCheckout();
        });

        await Browser.open({
          url: authorizationUrl,
          presentationStyle: 'popover',
        });
      } catch (error) {
        console.error('Error opening native Paystack checkout:', error);
        await cleanup();
        // Fallback if native browser overlay fails
        window.location.href = authorizationUrl;
        resolve();
      }
    };

    void openCheckout();
  });
}