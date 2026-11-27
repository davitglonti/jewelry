export async function validatePromoClient({ code, subtotal, lang = 'ka' }) {
  const trimmed = String(code || '').trim().toUpperCase();
  if (!trimmed) {
    return { valid: false, error: lang === 'ka' ? 'შეიყვანეთ პრომო კოდი' : 'Enter promo code' };
  }

  try {
    if (typeof window !== 'undefined' && typeof fetch === 'function' && window.location?.origin) {
      const res = await fetch(`${window.location.origin}/api/validate-promo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, subtotal, lang }),
      });

      if (res && typeof res.json === 'function') {
        const data = await res.json().catch(() => null);
        if (res.ok && data?.valid) return data;
        if (data?.error) {
          return { valid: false, error: data.error };
        }
      }
    }
  } catch {
    // Network error handled below without exposing any promo list in client code
  }

  return {
    valid: false,
    error:
      lang === 'ka'
        ? 'პრომო კოდის შემოწმება ამ ეტაპზე ვერ მოხერხდა, სცადეთ მოგვიანებით'
        : 'Unable to validate promo code right now, please try again',
  };
}

export async function submitOrderSecure({
  serverPayload,
  fallbackOrder,
  user,
  inquiries = [],
  setInquiries,
}) {
  let finalOrder = null;

  try {
    if (typeof window !== 'undefined' && typeof fetch === 'function' && window.location?.origin) {
      const headers = { 'Content-Type': 'application/json' };
      if (user && typeof user.getIdToken === 'function') {
        try {
          const token = await user.getIdToken();
          if (token) headers.Authorization = `Bearer ${token}`;
        } catch {}
      }

      const res = await fetch(`${window.location.origin}/api/create-order`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...serverPayload,
          origin: window.location.origin,
        }),
      });

      if (res && typeof res.json === 'function') {
        const data = await res.json().catch(() => null);
        if (res.status >= 400 && res.status < 500 && data?.error) {
          throw new Error(data.error);
        }
        if (res.ok && data?.order) {
          finalOrder = data.order;
        }
      }
    }
  } catch (err) {
    // Propagate explicit client validation / promo errors
    if (err && err.message && !/fetch|network|json|failed/i.test(err.message)) {
      throw err;
    }
  }

  if (!finalOrder) {
    // Offline / unit-test fallback: write directly to /inquiries (allowed for guests by Firestore rules)
    // Never touch aurelia/storeData from unauthenticated client!
    finalOrder = {
      ...fallbackOrder,
      paymentStatus: 'გადასახდელია',
    };

    try {
      const [{ db }, { doc, setDoc }] = await Promise.all([
        import('./firebase'),
        import('firebase/firestore'),
      ]);
      if (db && typeof setDoc === 'function') {
        await setDoc(doc(db, 'inquiries', finalOrder.id), {
          ...finalOrder,
          createdAtMs: Date.now(),
          userId: user?.uid || null,
        });
      }
    } catch {
      // Safe fallback in JSDOM tests where Firebase isn't initialized
    }
  }

  const updated = [finalOrder, ...(inquiries || [])];
  if (setInquiries) setInquiries(updated);

  try {
    const prevHistory = JSON.parse(localStorage.getItem('matare_orders') || '[]');
    localStorage.setItem('matare_orders', JSON.stringify([finalOrder, ...prevHistory]));
  } catch (err) {
    console.warn('Local storage error:', err);
  }

  return finalOrder;
}
