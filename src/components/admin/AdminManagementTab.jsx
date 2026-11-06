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
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg sm:text-xl font-medium">უფლებების მართვა (ადმინები & მოდერატორები)</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 border border-amber-500/30 text-amber-400">
                RBAC Security
              </span>
            </div>
            <p className="text-xs opacity-65 mt-1 max-w-2xl leading-relaxed">
              აქედან შეგიძლიათ მიანიჭოთ წვდომა **მოდერატორებს** (მხოლოდ პროდუქციის და ბლოგის მართვა) ან **ადმინისტრატორებს** (სრული წვდომა).
              საკმარისია მხოლოდ ელ-ფოსტის მითითება — თანამშრომელს მეილზე ავტომატურად გაეგზავნება მოწვევის ბმული, სადაც თვითონ დააყენებს საკუთარ პაროლს.
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

      {/* Successfully Sent Invitation Box */}
      {createdInvite && (
        <div className="p-6 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <h4 className="font-serif text-base font-semibold text-amber-400">
                მოწვევის წერილი გაგზავნილია!
              </h4>
            </div>
            <span className="text-[11px] opacity-60">
              {createdInvite.emailSent ? '✉️ წერილი მიუვიდა მეილზე' : '🔗 ბმული მზადაა გასაზიარებლად'}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs ${
            darkMode ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
          }`}>
            <div>
              <span className="opacity-50 block text-[10px] uppercase font-bold">თანამშრომლის ელ-ფოსტა</span>
              <span className="font-mono font-semibold text-stone-100">{createdInvite.email}</span>
            </div>
            <div>
              <span className="opacity-50 block text-[10px] uppercase font-bold">მინიჭებული როლი</span>
              <span className="font-semibold text-emerald-400">
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
            <span className="text-[11px] opacity-65">
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
            <UserPlus className="w-4 h-4 text-amber-500" />
            <h4 className="font-serif text-base font-medium">ახალი თანამშრომლის მოწვევა & უფლების მინიჭება</h4>
          </div>

          <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold opacity-60 block mb-2">
                აირჩიეთ წვდომის დონე (როლი):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('moderator')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    selectedRole === 'moderator'
                      ? 'border-amber-500/60 bg-amber-500/10 text-stone-100 shadow-sm'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${selectedRole === 'moderator' ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-400'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>მოდერატორი</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-normal">რეკომენდებული</span>
                    </div>
                    <p className="text-[11px] opacity-70 mt-1 leading-snug">
                      შეუძლია **მხოლოდ პროდუქციის** და **ბლოგის** დამატება/შეცვლა. არ აქვს წვდომა მომხმარებლების შეკვეთებზე, სტატისტიკასა და საიტის პარამეტრებზე.
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                    selectedRole === 'admin'
                      ? 'border-amber-500/60 bg-amber-500/10 text-stone-100 shadow-sm'
                      : darkMode
                      ? 'border-stone-800 bg-stone-900/40 text-stone-400 hover:border-stone-700'
                      : 'border-stone-200 bg-stone-50 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className={`p-2 rounded-xl mt-0.5 ${selectedRole === 'admin' ? 'bg-amber-500 text-black' : 'bg-stone-800 text-stone-400'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs">სრული ადმინისტრატორი</div>
                    <p className="text-[11px] opacity-70 mt-1 leading-snug">
                      სრული წვდომა ყველა ტაბზე: პროდუქცია, კატეგორიები, ბანერები, მომხმარებელთა მოთხოვნები, გაყიდვები, პარამეტრები.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Email Field Only */}
            <div>
              <label className="text-[11px] uppercase tracking-wider font-semibold opacity-60 block mb-1.5">
                თანამშრომლის ელ-ფოსტა:
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="მაგ: colleague@matare.store ან name@gmail.com"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-xs border outline-none transition-all ${
                    darkMode
                      ? 'bg-stone-900/80 border-stone-700 text-white focus:border-amber-500'
                      : 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-600'
                  }`}
                />
              </div>
              <p className="text-[11px] opacity-60 mt-1.5">
                მოწვევის გაგზავნისთანავე ამ ელ-ფოსტაზე გაიგზავნება წერილი უსაფრთხო ბმულით, სადაც თანამშრომელი თავად დააყენებს საკუთარ პაროლს.
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={actionLoading || !newEmail.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
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
        <div className="p-5 border-b border-stone-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-base font-medium">უფლებამოსილი ანგარიშები</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {admins.length}
            </span>
          </div>
          <span className="text-[11px] opacity-60">
            მხოლოდ ეს პირები შეძლებენ /admin პანელზე შესვლას
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs opacity-60">იტვირთება სია...</div>
        ) : (
          <div className="divide-y divide-stone-500/10">
            {admins.map((adm) => {
              const isOwner = adm.isSuperAdmin || adm.email === SUPER_ADMIN_EMAIL.toLowerCase();
              const isCurrent = adm.email === (currentUserEmail || '').toLowerCase();
              const isMod = adm.role === 'moderator';

              return (
                <div
                  key={adm.email}
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                    !adm.isActive ? 'opacity-50 bg-red-500/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border ${
                        isOwner
                          ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-black border-amber-400/50 shadow-md shadow-amber-500/20'
                          : isMod
                          ? 'bg-purple-500/15 text-purple-400 border-purple-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {adm.email.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs sm:text-sm font-semibold truncate">{adm.email}</span>

                        {isOwner ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-black">
                            Super Admin
                          </span>
                        ) : isMod ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-purple-500/15 text-purple-400 border border-purple-500/30">
                            მოდერატორი (კონტენტი)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            ადმინისტრატორი (სრული)
                          </span>
                        )}

                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            თქვენ
                          </span>
                        )}

                        {!isOwner && (
                          !adm.isActive ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                              შეჩერებული
                            </span>
                          ) : adm.status === 'pending' || !adm.hasJoined ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                              მოლოდინში (მოწვეული)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              აქტიური
                            </span>
                          )
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] opacity-60 mt-0.5 flex-wrap">
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
                      <span className="text-[11px] opacity-40 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-500/20">
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
                                : 'border-amber-500/50 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-black'
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
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border outline-none cursor-pointer transition-all ${
                            darkMode
                              ? 'bg-stone-900 border-stone-700 text-stone-200 hover:border-stone-600'
                              : 'bg-stone-100 border-stone-300 text-stone-800'
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
                          className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all ${
                            adm.isActive
                              ? 'border-stone-800 bg-stone-900/60 text-stone-300 hover:text-amber-400 hover:border-amber-500/40'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
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
