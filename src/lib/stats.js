// src/lib/stats.js
import { db, auth } from './firebase';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';

/**
 * ამოწმებს, უნდა დაიბლოკოს თუ არა ნახვის აღრიცხვა (ადმინის ან ბოტების შემთხვევაში).
 */
function shouldSkipTracking() {
  if (typeof window === 'undefined') return true;

  // 1. ბოტების, ავტომატური ხელსაწყოებისა და ვებ-კრაულერების ფილტრაცია
  if (window.navigator?.webdriver) return true;
  const ua = window.navigator?.userAgent || '';
  if (/bot|crawler|spider|crawling|lighthouse|googlebot|bingbot|yandex/i.test(ua)) {
    return true;
  }

  // 2. ადმინისტრატორის შემოწმება (ადმინის ტესტირება სტატისტიკას არ გააფუჭებს)
  try {
    if (window.location.pathname.startsWith('/admin')) return true;
    if (localStorage.getItem('isAdmin') === 'true' || sessionStorage.getItem('isAdmin') === 'true') {
      return true;
    }
    const currentEmail = auth?.currentUser?.email?.toLowerCase();
    if (currentEmail === 'datiglonti@gmail.com') {
      return true;
    }
  } catch (e) {
    // storage წვდომის შეცდომის უგულებელყოფა
  }

  return false;
}

/**
 * ნივთის ნახვის აღრიცხვა (Views & Unique Views).
 * - sessionStorage: ამოწმებს, ამ სესიაში უკვე ნახა თუ არა. თუ ნახა, არაფერს ითვლის.
 * - localStorage: ამოწმებს, ამ ბრაუზერმა ოდესმე ნახა თუ არა. თუ არა, uniqueViews +1.
 * - setDoc + merge + increment: ყველაფერი ერთ ატომურ ჩაწერაში, რომელიც დოკუმენტს თავად შექმნის.
 * - UI-ს არ აფერხებს: ჩაწერა ფონზეა და გახვეულია try/catch-ში.
 *
 * @param {string|number} productId - ნივთის ID ან SKU
 */
export async function trackProductView(productId) {
  if (!productId) return;

  try {
    if (shouldSkipTracking()) return;

    const idStr = String(productId).trim();
    if (!idStr) return;

    // მომხმარებლის ან სტუმრის იდენტიფიკატორი (ანგარიშების სწორად გასამიჯნად)
    const currentUid = auth?.currentUser?.uid;
    let visitorId = currentUid ? `user_${currentUid}` : null;
    if (!visitorId) {
      let guestId = localStorage.getItem('matare_visitor_id');
      if (!guestId) {
        guestId = 'g_' + Math.random().toString(36).substring(2, 10);
        localStorage.setItem('matare_visitor_id', guestId);
      }
      visitorId = guestId;
    }

    const sessionKey = `matare_view_session_${idStr}_${visitorId}`;
    const localKey = `matare_view_ever_${idStr}_${visitorId}`;

    // 1. სესიის შემოწმება: თუ ამ სესიაში უკვე ნახა ამ მომხმარებელმა, არაფერს ვთვლით
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }

    // 2. უნიკალური ვიზიტორის შემოწმება ამ კონკრეტულ ნივთზე
    const hasViewedEver = localStorage.getItem(localKey);
    const isUnique = !hasViewedEver;

    if (!db) return;

    const statRef = doc(db, 'productStats', idStr);

    // 3. ერთადერთი ატომური ჩაწერა (merge + increment)
    await setDoc(
      statRef,
      {
        views: increment(1),
        uniqueViews: increment(isUnique ? 1 : 0),
        lastViewedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 4. მარკირება სესიაში და ლოკალურად
    sessionStorage.setItem(sessionKey, '1');
    if (isUnique) {
      localStorage.setItem(localKey, '1');
    }
  } catch (err) {
    // UI-ს დაცვა: ჩუმი დაფიქსირება, რათა მომხმარებლის ინტერფეისს არ შეეხოს
    console.debug('Product view tracking skipped/failed:', err?.message || err);
  }
}
