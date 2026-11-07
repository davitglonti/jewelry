// src/lib/userSync.js
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * სინქრონიზებს ავტორიზებული მომხმარებლის პროფილს Firestore-ის /users კოლექციაში.
 * იძახება რეგისტრაციისას, Google-ით შესვლისას და ჩვეულებრივი შესვლისას.
 * უსაფრთხოა: გახვეულია try/catch-ში და არ აფერხებს მომხმარებლის ავტორიზაციის პროცესს.
 *
 * @param {object} currentUser - Firebase Auth User ობიექტი
 * @param {object} options - დამატებითი პარამეტრები (displayName, provider, isNewUser)
 */
export async function syncUserProfileToFirestore(currentUser, options = {}) {
  if (!currentUser || !currentUser.uid) return;

  try {
    if (!db) return;

    const uid = currentUser.uid;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    const email = currentUser.email ? currentUser.email.toLowerCase().trim() : '';
    const displayName = options.displayName || currentUser.displayName || '';
    const photoURL = currentUser.photoURL || '';
    const provider = options.provider || (
      currentUser.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'password'
    );

    if (!userSnap.exists() || options.isNewUser) {
      // ახალი მომხმარებლის ბარათის შექმნა
      await setDoc(
        userRef,
        {
          uid,
          email,
          displayName,
          photoURL,
          provider,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          ordersCount: 0,
        },
        { merge: true }
      );
    } else {
      // არსებული მომხმარებლის ბოლო შესვლის დროის და პროფილის განახლება
      const updates = {
        lastLoginAt: serverTimestamp(),
      };
      if (displayName && !userSnap.data()?.displayName) updates.displayName = displayName;
      if (photoURL && !userSnap.data()?.photoURL) updates.photoURL = photoURL;
      if (email && !userSnap.data()?.email) updates.email = email;

      await updateDoc(userRef, updates);
    }
  } catch (err) {
    // ჩუმი ლოგი, რათა ქსელის ხარვეზმა არ დაბლოკოს UI
    console.debug('User profile sync skipped/failed:', err?.message || err);
  }
}
