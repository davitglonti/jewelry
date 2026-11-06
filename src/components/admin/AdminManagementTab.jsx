// src/components/admin/AdminManagementTab.jsx
import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserPlus, Trash2, CheckCircle2,
  AlertCircle, Lock, Power, RefreshCw, Mail, Copy, Check, Users, Send, ExternalLink
} from 'lucide-react';
import {
  SUPER_ADMIN_EMAIL,
  getAdminsList,
  createAdminAccountApi,
  resendAdminInviteApi,
  removeAdminAccount,
  toggleAdminAccountStatus,
  updateAdminRole
} from '../../lib/adminAuth';
import { db } from '../../lib/firebase';

export default function AdminManagementTab({
  darkMode = true,
  currentUser = null,
  currentUserEmail = '',
  isSuperAdmin = false
}) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('moderator'); // 'moderator' | 'admin'
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [createdInvite, setCreatedInvite] = useState(null);
  const [copied, setCopied] = useState(false);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 6000);
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

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    setActionLoading(true);
    setCreatedInvite(null);

    try {
      const res = await createAdminAccountApi(currentUser, {
        email: newEmail.trim(),
        role: selectedRole,
        origin: typeof window !== 'undefined' ? window.location.origin : ''
      });

      setCreatedInvite({
        email: res.email,
        role: res.role,
        inviteLink: res.inviteLink,
        emailSent: res.emailSent
      });

      showFeedback(
        'success',
        res.emailSent
          ? `მოწვევის წერილი წარმატებით გაეგზავნა ${res.email}-ს (${res.role === 'moderator' ? 'მოდერატორი' : 'ადმინისტრატორი'})!`
          : `უფლება წარმატებით მიენიჭა ${res.email}-ს (${res.role === 'moderator' ? 'მოდერატორი' : 'ადმინისტრატორი'})!`
      );
      setNewEmail('');
      await loadAdmins();
    } catch (err) {
      showFeedback('error', err.message || 'მოწვევის გაგზავნისას დაფიქსირდა შეცდომა');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendInvite = async (email, role) => {
    setActionLoading(true);
    try {
      const res = await resendAdminInviteApi(currentUser, {
        email,
        role,
        origin: typeof window !== 'undefined' ? window.location.origin : ''
      });
      showFeedback(
        'success',
        res.emailSent
          ? `ახალი მოწვევის წერილი წარმატებით გაეგზავნა ${email}-ს!`
          : `მოწვევის ბმული განახლდა ${email}-სთვის!`
      );
    } catch (err) {
      showFeedback('error', err.message || 'მოწვევის ხელახლა გაგზავნა ვერ მოხერხდა');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyInviteLink = () => {
    if (!createdInvite || !createdInvite.inviteLink) return;
    const roleLabel = createdInvite.role === 'moderator'
      ? 'მოდერატორი (პროდუქცია & ბლოგი)'
      : 'სრული ადმინისტრატორი';

    const text = `✨ matare.store — მოწვევა სამუშაო პანელზე

მოგესალმებით! თქვენ მოწვეული ხართ «მატარე»-ს ადმინისტრაციულ სისტემაში (${roleLabel}).
გთხოვთ გადახვიდეთ ამ ბმულზე თქვენი პირადი პაროლის დასაყენებლად:
🔗 ${createdInvite.inviteLink}

პაროლის დაყენების შემდეგ შესვლა შეგიძლიათ: https://www.matare.store/admin`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRemove = async (email) => {
    if (!window.confirm(`დარწმუნებული ხართ, რომ გსურთ ${email}-ისთვის წვდომის წაშლა?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await removeAdminAccount(db, email);
      showFeedback('success', `მომხმარებელი ${email} წარმატებით წაიშალა`);
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

  const handleChangeRole = async (email, newRole) => {
    setActionLoading(true);
    try {
      await updateAdminRole(db, email, newRole);
      showFeedback('success', `როლი შეიცვალა: ${email} -> ${newRole === 'moderator' ? 'მოდერატორი' : 'ადმინისტრატორი'}`);
      await loadAdmins();
    } catch (err) {
      showFeedback('error', err.message || 'როლის შეცვლისას დაფიქსირდა შეცდომა');
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
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
            darkMode ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' : 'bg-amber-50 border-amber-300 text-amber-600 shadow-xs'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`font-serif text-lg sm:text-xl font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
                უფლებების მართვა (ადმინები & მოდერატორები)
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                darkMode ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400' : 'bg-amber-100 border border-amber-300 text-amber-900'
              }`}>
                RBAC Security
              </span>
            </div>
            <p className={`text-xs mt-1 max-w-2xl leading-relaxed ${
              darkMode ? 'text-stone-400 opacity-80' : 'text-stone-600 font-medium'
            }`}>
              აქედან შეგიძლიათ მიანიჭოთ წვდომა **მოდერატორებს** (მხოლოდ პროდუქციის და ბლოგის მართვა) ან **ადმინისტრატორებს** (სრული წვდომა).
              საკმარისია მხოლოდ ელ-ფოსტის მითითება — თანამშრომელს მეილზე ავტომატურად გაეგზავნება მოწვევის ბმული, სადაც თვითონ დააყენებს საკუთარ პაროლს.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAdmins}
          disabled={loading || actionLoading}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 transition-all shrink-0 ${
            darkMode
              ? 'border-stone-800 bg-stone-900/60 hover:bg-stone-800 text-stone-300'
              : 'border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 shadow-xs'
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

      {/* Successfully Sent Invitation Box */}
      {createdInvite && (
        <div className={`p-6 rounded-3xl border space-y-4 animate-fadeIn ${
          darkMode
            ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent'
            : 'border-amber-400 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 shadow-md shadow-amber-500/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${
                darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
              }`}>
                <Check className="w-4 h-4" />
              </div>
              <h4 className={`font-serif text-base font-bold ${darkMode ? 'text-amber-400' : 'text-amber-900'}`}>
                მოწვევის წერილი გაგზავნილია!
              </h4>
            </div>
            <span className={`text-[11px] font-medium ${darkMode ? 'text-stone-300 opacity-70' : 'text-stone-600'}`}>
              {createdInvite.emailSent ? '✉️ წერილი მიუვიდა მეილზე' : '🔗 ბმული მზადაა გასაზიარებლად'}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${
            darkMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-amber-200 shadow-xs'
          }`}>
            <div>
              <span className={`block text-[10px] uppercase font-bold ${darkMode ? 'text-stone-400 opacity-60' : 'text-stone-500'}`}>თანამშრომლის ელ-ფოსტა</span>
              <span className={`font-mono font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900 font-bold'}`}>{createdInvite.email}</span>
            </div>
            <div>
              <span className={`block text-[10px] uppercase font-bold ${darkMode ? 'text-stone-400 opacity-60' : 'text-stone-500'}`}>მინიჭებული როლი</span>
              <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
                {createdInvite.role === 'moderator' ? 'მოდერატორი (კონტენტი)' : 'სრული ადმინი'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'დაკოპირდა WhatsApp-ისთვის!' : 'მოწვევის ბმულის კოპირება (WhatsApp / Messenger) 📋'}</span>
            </button>
            <span className={`text-[11px] ${darkMode ? 'opacity-65 text-stone-300' : 'text-stone-600 font-medium'}`}>
              თანამშრომელი ამ ბმულზე გადასვლით მომენტალურად დააყენებს საკუთარ პირად პაროლს და შემოვა სისტემაში.
            </span>
          </div>
        </div>
      )}

      {/* Create New Account / Invite Section (Super Admin only) */}
      {isSuperAdmin ? (
        <div
          className={`p-6 rounded-3xl border space-y-5 ${
            darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <UserPlus className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
            <h4 className={`font-serif text-base font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              ახალი თანამშრომლის მოწვევა & უფლების მინიჭება
            </h4>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className={`text-[11px] uppercase tracking-wider font-semibold block mb-2 ${
                darkMode ? 'text-stone-400 opacity-70' : 'text-stone-700 font-bold'
              }`}>
                აირჩიეთ წვდომის დონე (როლი):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('moderator')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    selectedRole === 'moderator'
                      ? darkMode
                        ? 'border-amber-500/70 bg-amber-500/15 text-stone-100 shadow-sm'
                        : 'border-amber-500 bg-amber-50/90 text-stone-950 ring-2 ring-amber-400/50 shadow-sm'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50 shadow-xs'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    selectedRole === 'moderator'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : darkMode
                      ? 'bg-stone-800 text-stone-400'
                      : 'bg-stone-100 border border-stone-200 text-stone-600'
                  }`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span className={selectedRole === 'moderator' && !darkMode ? 'text-stone-950 font-bold' : ''}>მოდერატორი</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        darkMode
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-amber-100 border border-amber-300 text-amber-900 font-semibold'
                      }`}>
                        რეკომენდებული
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${
                      darkMode ? 'text-stone-300 opacity-80' : 'text-stone-600'
                    }`}>
                      შეუძლია <strong className={darkMode ? 'text-amber-400' : 'text-stone-900 font-bold'}>მხოლოდ პროდუქციის</strong> და <strong className={darkMode ? 'text-amber-400' : 'text-stone-900 font-bold'}>ბლოგის</strong> დამატება/შეცვლა. არ აქვს წვდომა მომხმარებლების შეკვეთებზე, სტატისტიკასა და საიტის პარამეტრებზე.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    selectedRole === 'admin'
                      ? darkMode
                        ? 'border-amber-500/70 bg-amber-500/15 text-stone-100 shadow-sm'
                        : 'border-amber-500 bg-amber-50/90 text-stone-950 ring-2 ring-amber-400/50 shadow-sm'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                      : 'border-stone-300 bg-white text-stone-700 hover:border-stone-400 hover:bg-stone-50 shadow-xs'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    selectedRole === 'admin'
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                      : darkMode
                      ? 'bg-stone-800 text-stone-400'
                      : 'bg-stone-100 border border-stone-200 text-stone-600'
                  }`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`font-semibold text-xs ${
                      selectedRole === 'admin' && !darkMode ? 'text-stone-950 font-bold' : ''
                    }`}>
                      სრული ადმინისტრატორი
                    </div>
                    <p className={`text-[11px] mt-1 leading-snug ${
                      darkMode ? 'text-stone-300 opacity-80' : 'text-stone-600'
                    }`}>
                      სრული წვდომა ყველა ტაბზე: პროდუქცია, კატეგორიები, ბანერები, მომხმარებელთა მოთხოვნები, გაყიდვები, პარამეტრები.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Field Only */}
            <div>
              <label className={`text-[11px] uppercase tracking-wider font-semibold block mb-1.5 ${
                darkMode ? 'text-stone-400 opacity-70' : 'text-stone-700 font-bold'
              }`}>
                თანამშრომლის ელ-ფოსტა:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="მაგ: colleague@matare.store ან name@gmail.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900/80 border-stone-700 text-white placeholder-stone-500 focus:border-amber-500'
                      : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:ring-1 focus:ring-amber-500 shadow-xs'
                  }`}
                />
              </div>
              <p className={`text-[11px] mt-1.5 ${
                darkMode ? 'text-stone-400 opacity-70' : 'text-stone-600 font-medium'
              }`}>
                მოწვევის გაგზავნისთანავე ამ ელ-ფოსტაზე გაიგზავნება წერილი უსაფრთხო ბმულით, სადაც თანამშრომელი თავად დააყენებს საკუთარ პაროლს.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={actionLoading || !newEmail.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/25 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{actionLoading ? 'იგზავნება მოწვევა...' : 'უფლების მინიჭება და მოწვევის გაგზავნა'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-xs flex items-center gap-3">
          <Lock className="w-4 h-4 shrink-0" />
          <span>თანამშრომლების ანგარიშების მართვა (შექმნა/წაშლა) შეუძლია მხოლოდ მთავარ ადმინისტრატორს ({SUPER_ADMIN_EMAIL}).</span>
        </div>
      )}

      {/* List of Authorized Users */}
      <div
        className={`rounded-3xl border overflow-hidden ${
          darkMode ? 'bg-[#121110] border-stone-800' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        <div className={`p-5 border-b flex items-center justify-between ${
          darkMode ? 'border-stone-800/80 bg-stone-900/30' : 'border-stone-200 bg-stone-50/70'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`font-serif text-base font-semibold ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              უფლებამოსილი ანგარიშები
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              darkMode ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}>
              {admins.length}
            </span>
          </div>
          <span className={`text-[11px] ${darkMode ? 'text-stone-400 opacity-70' : 'text-stone-600 font-medium'}`}>
            მხოლოდ ეს პირები შეძლებენ /admin პანელზე შესვლას
          </span>
        </div>

        {loading ? (
          <div className={`py-12 text-center text-xs ${darkMode ? 'text-stone-400 opacity-60' : 'text-stone-600 font-medium'}`}>
            იტვირთება სია...
          </div>
        ) : (
          <div className={darkMode ? 'divide-y divide-stone-800/80' : 'divide-y divide-stone-200'}>
            {admins.map((adm) => {
              const isOwner = adm.isSuperAdmin || adm.email === SUPER_ADMIN_EMAIL.toLowerCase();
              const isCurrent = adm.email === (currentUserEmail || '').toLowerCase();
              const isMod = adm.role === 'moderator';

              return (
                <div
                  key={adm.email}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !adm.isActive
                      ? darkMode ? 'opacity-50 bg-red-500/5' : 'opacity-60 bg-red-50/50'
                      : darkMode ? 'hover:bg-stone-900/30' : 'hover:bg-stone-50/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isOwner
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black border-amber-400/50 shadow-md shadow-amber-500/20'
                          : isMod
                          ? darkMode
                            ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                            : 'bg-purple-100 text-purple-900 border-purple-300'
                          : darkMode
                          ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      {adm.email.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`font-mono text-xs sm:text-sm font-semibold truncate ${
                          darkMode ? 'text-stone-100' : 'text-stone-900 font-bold'
                        }`}>
                          {adm.email}
                        </span>

                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black shadow-xs">
                            Super Admin
                          </span>
                        ) : isMod ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                            darkMode
                              ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                              : 'bg-purple-100 text-purple-900 border-purple-300'
                          }`}>
                            მოდერატორი (კონტენტი)
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${
                            darkMode
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}>
                            ადმინისტრატორი (სრული)
                          </span>
                        )}

                        {isCurrent && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            darkMode
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            თქვენ
                          </span>
                        )}

                        {!isOwner && (
                          !adm.isActive ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 ${
                              darkMode
                                ? 'bg-red-500/10 text-red-400 border-red-500/30'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                              შეჩერებული
                            </span>
                          ) : adm.status === 'pending' || !adm.hasJoined ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1.5 animate-pulse ${
                              darkMode
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              მოლოდინში (მოწვეული)
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 ${
                              darkMode
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              აქტიური
                            </span>
                          )
                        )}
                      </div>

                      <div className={`flex items-center gap-3 text-[11px] mt-1 flex-wrap ${
                        darkMode ? 'text-stone-400 opacity-70' : 'text-stone-600 font-medium'
                      }`}>
                        <span>
                          {adm.hasJoined || adm.status === 'active'
                            ? `დამატებულია: ${adm.addedAt ? new Date(adm.addedAt).toLocaleDateString('ka-GE') : 'სისტემური'}`
                            : `მოწვეულია: ${adm.invitedAt || adm.addedAt ? new Date(adm.invitedAt || adm.addedAt).toLocaleDateString('ka-GE') : ''} • ელოდება შემოერთებას`}
                        </span>
                        {adm.addedBy && <span>• დაამატა: {adm.addedBy}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Only Super Admin can modify) */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {isOwner ? (
                      <span className={`text-[11px] flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
                        darkMode ? 'border-stone-800 bg-stone-900/40 text-stone-400' : 'border-stone-300 bg-stone-100 text-stone-600 font-medium'
                      }`}>
                        <Lock className="w-3.5 h-3.5" />
                        უცვლელი მფლობელი
                      </span>
                    ) : isSuperAdmin ? (
                      <>
                        {/* Resend invite button ONLY when user is pending / not joined yet */}
                        {(!adm.hasJoined || adm.status === 'pending') && (
                          <button
                            type="button"
                            onClick={() => handleResendInvite(adm.email, adm.role)}
                            disabled={actionLoading}
                            title="მოწვევის წერილის ხელახლა გაგზავნა მეილზე"
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                              darkMode
                                ? 'border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500 hover:text-black'
                                : 'border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-500 hover:text-black font-bold'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline text-[11px]">ხელახლა გაგზავნა</span>
                          </button>
                        )}

                        {/* Role switcher */}
                        <select
                          value={adm.role}
                          onChange={(e) => handleChangeRole(adm.email, e.target.value)}
                          disabled={actionLoading}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border outline-none cursor-pointer transition-all shadow-xs ${
                            darkMode
                              ? 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-600'
                              : 'bg-white border-stone-300 text-stone-900 hover:border-stone-400'
                          }`}
                        >
                          <option value="moderator">მოდერატორი</option>
                          <option value="admin">სრული ადმინი</option>
                        </select>

                        {/* Toggle Active status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(adm.email, adm.isActive)}
                          disabled={actionLoading}
                          title={adm.isActive ? 'წვდომის დროებით შეჩერება' : 'წვდომის აღდგენა'}
                          className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs ${
                            adm.isActive
                              ? darkMode
                                ? 'border-stone-800 bg-stone-900/60 text-stone-300 hover:text-amber-400 hover:border-amber-500/40'
                                : 'border-stone-300 bg-stone-100 text-stone-800 hover:border-stone-400 hover:bg-stone-200'
                              : darkMode
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'border-emerald-300 bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">{adm.isActive ? 'შეჩერება' : 'გააქტიურება'}</span>
                        </button>

                        {/* Delete account */}
                        <button
                          type="button"
                          onClick={() => handleRemove(adm.email)}
                          disabled={actionLoading}
                          title="ანგარიშის წაშლა"
                          className={`p-2 rounded-xl border transition-all shadow-xs ${
                            darkMode
                              ? 'border-stone-800 bg-stone-900/60 text-stone-400 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10'
                              : 'border-stone-300 bg-stone-100 text-stone-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50'
                          }`}
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
