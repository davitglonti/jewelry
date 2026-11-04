import React, { useState } from 'react';
import { Lock, AlertCircle, ShieldAlert } from 'lucide-react';
import { checkUserIsAdmin } from '../../lib/adminAuth';
import { db } from '../../lib/firebase';

export default function AdminLoginView({ darkMode = true, auth, signInWithEmailAndPassword }) {
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!auth) {
      setLoginError('Firebase Auth არ არის აქტიური!');
      return;
    }

    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        adminEmail.trim(),
        adminPassword.trim()
      );

      // გადავამოწმოთ, ნამდვილად აქვს თუ არა ამ მომხმარებელს ადმინისტრატორის უფლებები
      const adminCheck = await checkUserIsAdmin(userCred.user, db);
      if (!adminCheck.isAdmin) {
        // თუ ჩვეულებრივი მომხმარებელია, დაუყოვნებლივ გამოვლოგოთ
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        setLoginError(`წვდომა შეზღუდულია: ანგარიშს (${userCred.user.email}) არ გააჩნია ადმინისტრატორის უფლებები!`);
        setLoading(false);
        return;
      }

      setLoginError('');
    } catch (err) {
      console.error('Firebase Login Error:', err.code, err.message);
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setLoginError('არასწორი ელ-ფოსტა ან პაროლი!');
      } else if (err.code === 'auth/invalid-email') {
        setLoginError('ელ-ფოსტის ფორმატი არასწორია!');
      } else {
        setLoginError(`შეცდომა: ${err.code || err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`p-10 max-w-md mx-auto mt-16 rounded-3xl border text-center space-y-5 ${
        darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-lg'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center mx-auto">
        <Lock className="w-6 h-6" />
      </div>
      <h3 className="font-serif text-2xl">ადმინისტრატორის ავტორიზაცია</h3>
      <p className="text-xs opacity-65">შეიყვანეთ ადმინისტრატორის ელ-ფოსტა და პაროლი</p>

      <form onSubmit={handleLogin} className="space-y-3">
        <input
          type="email"
          value={adminEmail}
          onChange={(e) => setAdminEmail(e.target.value)}
          placeholder="ადმინის ელფოსტა"
          required
          disabled={loading}
          className={`w-full px-4 py-3 rounded-xl text-xs border outline-none ${
            darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-100 border-stone-300 text-stone-900'
          }`}
        />
        <input
          type="password"
          value={adminPassword}
          onChange={(e) => setAdminPassword(e.target.value)}
          placeholder="პაროლი..."
          required
          disabled={loading}
          className={`w-full px-4 py-3 rounded-xl text-xs border outline-none ${
            darkMode ? 'bg-stone-900 border-stone-700 text-white' : 'bg-stone-100 border-stone-300 text-stone-900'
          }`}
        />
        {loginError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 text-left">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{loginError}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-amber-500 text-black font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? 'მოწმდება...' : 'შესვლა'}
        </button>
      </form>
    </div>
  );
}
