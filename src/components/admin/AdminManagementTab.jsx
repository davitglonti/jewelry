import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, ShieldAlert, UserPlus, Trash2, CheckCircle2,
  AlertCircle, Lock, Power, RefreshCw, Mail
} from 'lucide-react';
import {
  SUPER_ADMIN_EMAIL,
  getAdminsList,
  addAdminAccount,
  removeAdminAccount,
  toggleAdminAccountStatus
} from '../../lib/adminAuth';
import { db } from '../../lib/firebase';

export default function AdminManagementTab({
  darkMode = true,
  currentUserEmail = '',
  isSuperAdmin = false
}) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const list = await getAdminsList(db);
      setAdmins(list);
    } catch (err) {
      console.error(err);
      showFeedback('error', 'ადმინისტრატორების სიის ჩატვირთვა ვერ მოხერხდა');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setActionLoading(true);
    try {
      await addAdminAccount(db, newEmail.trim(), currentUserEmail);
      showFeedback('success', `ადმინისტრატორი ${newEmail.trim()} წარმატებით დაემატა`);
      setNewEmail('');
      await loadAdmins();
    } catch (err) {
      showFeedback('error', err.message || 'დამატებისას დაფიქსირდა შეცდომა');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async (email) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ ${email}-ისთვის ადმინისტრატორის წვდომის წაშლა?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await removeAdminAccount(db, email);
      showFeedback('success', `ადმინისტრატორი ${email} წარმატებით წაიშალა`);
      await loadAdmins();
    } catch (err) {
      showFeedback('error', err.message || 'წაშლისას დაფიქსირდა შეცდომა');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (email, currentActive) => {
    setActionLoading(true);
    try {
      await toggleAdminAccountStatus(db, email, !currentActive);
      showFeedback('success', `სტატუსი განახლდა: ${email} ${!currentActive ? 'გააქტიურდა' : 'დეაქტივირდა'}`);
      await loadAdmins();
    } catch (err) {
      showFeedback('error', err.message || 'სტატუსის შეცვლისას დაფიქსირდა შეცდომა');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-medium">ადმინისტრატორების წვდომის მართვა</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400">
                RBAC Security
              </span>
            </div>
            <p className="text-xs opacity-65 mt-1 max-w-2xl leading-relaxed">
              აქედან შეგიძლიათ ადმინისტრატორის წვდომა მიანიჭოთ თქვენს თანამშრომლებს ან ნებისმიერ დროს ჩამოართვათ უფლება.
              მხოლოდ აქ მითითებულ ელფოსტებს ექნებათ ადმინ-პანელზე და Firestore-ის ბაზაზე ცვლილებების შეტანის უფლება.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={loading || actionLoading}
          className={`px-3.5 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all shrink-0 ${
            darkMode
              ? 'border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-300'
              : 'border-stone-200 bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          <span>განახლება</span>
        </button>
      </div>

      {/* Feedback Alert */}
      {feedback.message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs animate-fadeIn ${
            feedback.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          }`}
        >
          {feedback.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Add New Admin Section (Only Super Admin can add) */}
      {isSuperAdmin ? (
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <UserPlus className="w-4 h-4 text-amber-500" />
            <h4 className="font-serif text-base font-medium">ახალი ადმინისტრატორის დამატება</h4>
          </div>
          <p className="text-xs opacity-65">
            მიუთითეთ იმ პირის ელ-ფოსტა, ვისაც გსურთ მიანიჭოთ მაღაზიის ადმინისტრატორის სრული უფლებები:
          </p>

          <form onSubmit={handleAddAdmin} className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="მაგ: colleague@matare.store ან name@gmail.com"
                required
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border outline-none transition-all ${
                  darkMode
                    ? 'bg-stone-900/80 border-stone-700 text-white focus:border-amber-500'
                    : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                }`}
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading || !newEmail.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{actionLoading ? 'ინახება...' : 'ადმინის დამატება'}</span>
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-3">
          <Lock className="w-4 h-4 shrink-0" />
          <span>ადმინისტრატორების სიის რედაქტირება (დამატება/წაშლა) შეუძლია მხოლოდ მთავარ ადმინისტრატორს ({SUPER_ADMIN_EMAIL}).</span>
        </div>
      )}

      {/* Admins List Table / Cards */}
      <div
        className={`rounded-3xl border overflow-hidden ${
          darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className="p-5 border-b border-stone-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-medium">უფლებამოსილი ადმინისტრატორები</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {admins.length}
            </span>
          </div>
          <span className="text-[11px] opacity-60">
            მხოლოდ ეს ანგარიშები შეძლებენ /admin პანელზე წვდომას
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs opacity-60">იტვირთება ადმინისტრატორების სია...</div>
        ) : (
          <div className="divide-y divide-stone-500/10">
            {admins.map((adm) => {
              const isOwner = adm.isSuperAdmin || adm.email === SUPER_ADMIN_EMAIL.toLowerCase();
              const isCurrent = adm.email === (currentUserEmail || '').toLowerCase();

              return (
                <div
                  key={adm.email}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !adm.isActive ? 'opacity-60 bg-red-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isOwner
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black border-amber-400/50 shadow-md shadow-amber-500/20'
                          : adm.isActive
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-stone-800 text-stone-400 border-stone-700'
                      }`}
                    >
                      {adm.email.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm font-semibold truncate">{adm.email}</span>
                        {isOwner && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black">
                            Super Admin
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            თქვენ
                          </span>
                        )}
                        {!isOwner && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                              adm.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border-red-500/30'
                            }`}
                          >
                            {adm.isActive ? 'აქტიური' : 'შეჩერებული'}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] opacity-60 mt-0.5 flex-wrap">
                        <span>დამატებულია: {adm.addedAt ? new Date(adm.addedAt).toLocaleDateString('ka-GE') : 'სისტემური'}</span>
                        {adm.addedBy && <span>• დაამატა: {adm.addedBy}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Only Super Admin can modify other admins) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isOwner ? (
                      <span className="text-[11px] opacity-40 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-500/20">
                        <Lock className="w-3.5 h-3.5" />
                        უცვლელი მფლობელი
                      </span>
                    ) : isSuperAdmin ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(adm.email, adm.isActive)}
                          disabled={actionLoading}
                          title={adm.isActive ? 'წვდომის დროებით შეჩერება' : 'წვდომის აღდგენა'}
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                            adm.isActive
                              ? 'border-stone-800 bg-stone-900/60 text-stone-300 hover:text-amber-400 hover:border-amber-500/40'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{adm.isActive ? 'შეჩერება' : 'გააქტიურება'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemove(adm.email)}
                          disabled={actionLoading}
                          title="ადმინისტრატორის წაშლა"
                          className="p-2 rounded-xl border border-stone-800 bg-stone-900/60 text-stone-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
