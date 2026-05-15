/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Shield, 
  Lock, 
  Unlock, 
  Send, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  MessageSquare,
  AlertTriangle,
  ArrowLeftRight, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Globe,
  ChevronRight,
  Zap,
  Cpu,
  Coins,
  Layers,
  Share2,
  Box,
  Diamond,
  Hexagon
} from 'lucide-react';

// --- Types ---
interface Transaction {
  id: string;
  amount: string;
  network: string;
  receiver: string;
  status: 'Waiting' | 'Locked' | 'Released' | 'Withdrawn';
  date: string;
}

const NETWORK_ADDRESSES: Record<string, string> = {
  'TRC20': 'TB2dJgWC36YPkCUWqUrxs5XbdpvhKS7nYK',
  'BEP20': '0x41d7D2cBE8d16C2afe5Ef8117d43b007170A060f',
  'ERC20': '0x41d7D2cBE8d16C2afe5Ef8117d43b007170A060f',
  'Polygon': '0x41d7D2cBE8d16C2afe5Ef8117d43b007170A060f',
  'Solana': 'FQqSR6WzG6Eu8ZDB9EY5osZYHTqmAn2jUZhZkPZYVP1o',
  'BASE': '0x41d7D2cBE8d16C2afe5Ef8117d43b007170A060f'
};

const NETWORK_WARNINGS: Record<string, string> = {
  'TRC20': 'تنبيه: أرسل فقط USDT (TRC20) إلى هذا العنوان. إرسال أي عملة أخرى أو عبر شبكة مختلفة سيؤدي إلى فقدان أموالك نهائياً.',
  'BEP20': 'تنبيه: أرسل فقط USDT (BEP20) إلى هذا العنوان. إرسال أي عملة أخرى أو عبر شبكة مختلفة سيؤدي إلى فقدان أموالك نهائياً.',
  'ERC20': 'تنبيه: أرسل فقط USDT (ERC20) إلى هذا العنوان. إرسال أي عملة أخرى أو عبر شبكة مختلفة سيؤدي إلى فقدان أموالك نهائياً.',
  'Polygon': 'تنبيه: أرسل فقط USDT (Polygon) إلى هذا العنوان. إرسال أي عملة أخرى أو عبر شبكة مختلفة سيؤدي إلى فقدان أموالك نهائياً.',
  'Solana': 'تنبيه: أرسل فقط USDT (Solana) إلى هذا العنوان. إرسال أي عملة أخرى أو عبر شبكة مختلفة سيؤدي إلى فقدان أموالك نهائياً.',
  'BASE': 'تنبيه: أرسل فقط USDT (BASE) إلى هذا العنوان. إرسال أي عملة أخرى أو عبر شبكة مختلفة سيؤدي إلى فقدان أموالك نهائياً.'
};

const isValidWalletAddress = (address: string, network: string): { valid: boolean; message?: string } => {
  if (!address || address.trim().length === 0) {
    return { valid: false, message: 'يرجى إدخال عنوان المحفظة' };
  }

  const trimmed = address.trim();

  switch (network) {
    case 'TRC20':
      if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmed)) {
        return { valid: false, message: 'عنوان TRC20 غير صالح (يبدأ بـ T و34 خانة).' };
      }
      break;
    case 'ERC20':
    case 'BEP20':
    case 'Polygon':
    case 'BASE':
      if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
        return { valid: false, message: 'عنوان الشبكة غير صالح (يبدأ بـ 0x و42 خانة).' };
      }
      break;
    case 'Solana':
      if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
        return { valid: false, message: 'عنوان Solana غير صالح.' };
      }
      break;
  }

  return { valid: true };
};

const openSupportChat = () => {
  window.dispatchEvent(new CustomEvent('openSupportChat'));
};

// --- Components ---

const Navbar = ({ isLoggedIn, setIsLoggedIn }: { isLoggedIn: boolean, setIsLoggedIn: (v: boolean) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = isLoggedIn ? [
    { name: 'لوحة التحكم', path: '/dashboard', icon: LayoutDashboard },
    { name: 'إنشاء صفقة', path: '/create-escrow', icon: PlusCircle },
    { name: 'الدعم الفني', path: '#support', icon: MessageSquare },
  ] : [
    { name: 'الرئيسية', path: '/', icon: Globe },
    { name: 'الدعم الفني', path: '#support', icon: MessageSquare },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-dark-bg/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-linear-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Shield className="text-black" size={24} />
            </div>
            <span className="text-2xl font-bold tracking-tight">
              شيكلي <span className="text-primary tracking-widest text-sm align-top">SHEKLY</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.path === '#support' ? (
                <button 
                  key={link.name}
                  onClick={openSupportChat}
                  className="text-sm font-medium transition-colors hover:text-primary text-white/70"
                >
                  {link.name}
                </button>
              ) : (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-white/70'}`}
                >
                  {link.name}
                </Link>
              )
            ))}
            {isLoggedIn ? (
              <button 
                onClick={() => { setIsLoggedIn(false); setIsOpen(false); }}
                className="flex items-center gap-2 text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
              >
                <LogOut size={18} />
                <span>تسجيل الخروج</span>
              </button>
            ) : (
              <Link to="/login" className="btn-primary py-2 px-6 text-sm">
                ابدأ الآن
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white/80 p-2">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-dark-card border-b border-white/10 px-4 pt-2 pb-6 flex flex-col gap-4"
          >
            {navLinks.map((link) => (
              link.path === '#support' ? (
                <button 
                  key={link.name}
                  onClick={() => { openSupportChat(); setIsOpen(false); }}
                  className="flex items-center gap-3 text-lg py-2 border-b border-white/5"
                >
                  <link.icon size={20} className="text-primary" />
                  <span>{link.name}</span>
                </button>
              ) : (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 text-lg py-2 border-b border-white/5"
                >
                  <link.icon size={20} className="text-primary" />
                  <span>{link.name}</span>
                </Link>
              )
            ))}
            {isLoggedIn ? (
              <button 
                onClick={() => { setIsLoggedIn(false); setIsOpen(false); }}
                className="flex items-center gap-3 text-lg py-2 text-red-400"
              >
                <LogOut size={20} />
                <span>تسجيل الخروج</span>
              </button>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="btn-primary mt-4">
                ابدأ الآن
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

// --- Pages ---

const HomePage = () => {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[140px] rounded-full" />
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-bold mb-8 border border-primary/20 shadow-[0_0_20px_rgba(0,212,170,0.1)]"
          >
            <Shield size={16} />
            <span>نظام الوساطة الرقمي المعتمد 2026</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-8 leading-tight tracking-tighter"
          >
            حقّك محفوظ <br/> بضمان <span className="text-primary italic">شـيـكـلي</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-white/50 mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            المنصة الأولى التي تمنح <span className="text-white font-bold text-shadow-sm">المودع</span> تحكماً كاملاً 100% في أمواله. تجميد آمن، استرجاع فوري، وتحرير بضغطة زر.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link to="/login" className="btn-primary px-12 py-5 text-xl font-bold rounded-2xl shadow-2xl hover:scale-105 transition-transform">
              ابدأ صفقـتك الآمنة
            </Link>
            <button 
              onClick={() => document.getElementById('security-info')?.scrollIntoView({ behavior: 'smooth' })} 
              className="px-12 py-5 rounded-2xl bg-white/5 border border-white/10 text-xl font-bold hover:bg-white/10 transition-colors"
            >
              لماذا نحن؟
            </button>
          </motion.div>
        </div>
      </section>

      {/* Trust Stats Bar */}
      <section className="py-16 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { label: 'إجمالي المبالغ المؤمنة', value: '$84M+' },
              { label: 'عمليات ناجحة', value: '150K+' },
              { label: 'معدل استرداد فوري', value: '100%' },
              { label: 'زمن التأكيد', value: '0.1s' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <p className="text-4xl md:text-5xl font-black text-primary mb-2 tabular-nums tracking-tighter">{stat.value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture Section */}
      <section id="security-info" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="flex-1 space-y-10 order-2 lg:order-1">
              <div className="inline-block px-4 py-1 bg-primary/10 rounded-full text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
                Infrastructure Security
              </div>
              <h2 className="text-4xl md:text-5xl font-bold leading-tight">بنية تحتية مصممة <br/> لعدم الثقة (Zero Trust)</h2>
              <div className="space-y-8">
                {[
                  { title: "التحكم اللامركزي للمودع", desc: "أنت المودع؟ أنت المدير. يمكنك طلب استرجاع أموالك فوراً وبدون الحاجة لموافقة أي طرف طالما لم يتم التحرير." },
                  { title: "محافظ باردة مؤمنة", desc: "يتم حفظ الأصول في محافظ باردة (Cold Storage) غير متصلة بالإنترنت لضمان أقصى درجات الحماية من الاختراق." },
                  { title: "خوارزميات التجميد الذكي", desc: "نستخدم منطقاً برمجياً يضمن تجميد المبلغ فور وصوله لشبكتنا، مما يمنع أي تلاعب بشري بالعملية." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-14 h-14 shrink-0 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-colors">
                      <Shield size={28} />
                    </div>
                    <div className="text-right">
                      <h4 className="text-xl font-bold mb-2">{item.title}</h4>
                      <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 relative">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 className="aspect-square bg-gradient-to-tr from-zinc-900 to-black rounded-[40px] border border-white/5 flex items-center justify-center p-8 shadow-2xl relative z-10 overflow-hidden"
               >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  <div className="relative text-center">
                    <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                       <Lock className="text-primary" size={64} />
                    </div>
                    <p className="text-2xl font-black mb-2">100% SECURE</p>
                    <p className="text-xs text-white/30 tracking-widest uppercase">Verified by Sheekly Security</p>
                  </div>
               </motion.div>
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-[100px] rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section id="how-it-works" className="py-24 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">بساطة في 3 خطوات</h2>
            <p className="text-white/50 max-w-2xl mx-auto mb-6">تحكم كامل في أموالك. المودع له الحرية التامة في استعادة أمواله (الانسحاب) في أي وقت طالما لم يتم التحرير.</p>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'إرسال الأموال', desc: 'قم بإيداع المبلغ في المحفظة الوسيطة الآمنة.', icon: Send },
              { title: 'التحكم والتجميد', desc: 'يتم قفل المبلغ، ولكن يمكنك سحبه في أي وقت إذا لزم الأمر.', icon: Lock },
              { title: 'التحرير النهائي', desc: 'بمجرد استلامك لطلبك، يمكنك تحرير الأموال للمستلم بضغطة زر.', icon: Unlock },
            ].map((step, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="glass-card p-10 text-center"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <step.icon className="text-primary" size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-white/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Networks */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-4 tracking-wider">الشبكات المدعومة</h2>
            <p className="text-white/40 mb-6 font-medium">نحن ندعم أوسع نطاق من الشبكات لضمان حرية التحويل</p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full" />
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'TRC20', label: 'TRON Network', icon: Zap, color: '#ff0013', desc: 'رسوم منخفضة' },
              { name: 'ERC20', label: 'Ethereum', icon: Cpu, color: '#627eea', desc: 'الأمان العالي' },
              { name: 'BEP20', label: 'BSC Chain', icon: Coins, color: '#f3ba2f', desc: 'السرعة الفائقة' },
              { name: 'Polygon', label: 'Polygon', icon: Layers, color: '#8247e5', desc: 'تكلفة زهيدة' },
              { name: 'Solana', label: 'Solana', icon: Share2, color: '#14f195', desc: 'الأداء الأقوى' },
              { name: 'BASE', label: 'Base Layer', icon: Box, color: '#0052ff', desc: 'شبكة حديثة' },
            ].map((network, index) => (
              <motion.div 
                key={network.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, backgroundColor: 'rgba(0, 212, 170, 0.05)', borderColor: 'rgba(0, 212, 170, 0.3)' }}
                className="glass-card p-6 flex flex-col items-center justify-center gap-4 group transition-all cursor-default border-white/5"
              >
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundColor: `${network.color}20` }}
                >
                  <network.icon 
                    style={{ color: network.color }} 
                    size={32} 
                  />
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold group-hover:text-primary transition-colors">{network.name}</div>
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{network.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 flex flex-wrap justify-center gap-6 opacity-30 select-none grayscale hover:grayscale-0 transition-all">
            {['USDT', 'USDC', 'DAI', 'BUSD'].map(coin => (
              <span key={coin} className="text-lg font-bold tracking-widest px-4 py-2 border border-white/20 rounded-lg">{coin}</span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const LoginPage = ({ setIsLoggedIn }: { setIsLoggedIn: (v: boolean) => void }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass-card p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">تسجيل الدخول</h2>
            <p className="text-white/50">أهلاً بك مجدداً في شيكلي</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 block px-1">البريد الإلكتروني</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                placeholder="ex@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70 block px-1">كلمة المرور</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-primary w-full py-4 text-lg">
              دخول
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-white/40">
            ليس لديك حساب؟ <Link to="#" className="text-primary hover:underline">سجل الآن</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = ({ transactions, setTransactions }: { 
  transactions: Transaction[], 
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
}) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [actionType, setActionType] = useState<'withdraw' | 'release' | null>(null);
  const [customWallet, setCustomWallet] = useState('');
  const [customNetwork, setCustomNetwork] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openActionModal = (tx: Transaction, type: 'withdraw' | 'release') => {
    setSelectedTx(tx);
    setActionType(type);
    setCustomNetwork(tx.network);
    // If it's a release and we already have a receiver, pre-fill it. Otherwise clear it.
    setCustomWallet(type === 'release' && tx.receiver !== 'None' ? tx.receiver : '');
    setError(null);
  };

  const closeModal = () => {
    setSelectedTx(null);
    setActionType(null);
    setCustomWallet('');
    setCustomNetwork('');
    setError(null);
  };

  const handleAction = (status: 'Released' | 'Withdrawn') => {
    if (!selectedTx) return;
    
    // Explicitly check current state values
    const validation = isValidWalletAddress(customWallet, customNetwork);
    if (!validation.valid) {
      setError(validation.message || 'بيانات المحفظة غير صحيحة');
      return;
    }

    const updated = transactions.map(tx => 
      tx.id === selectedTx.id ? { ...tx, status, receiver: customWallet.trim(), network: customNetwork } : tx
    );
    
    setTransactions(updated);
    closeModal();
  };

  const totalBalance = transactions.reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0);
  const lockedBalance = transactions.filter(tx => tx.status === 'Locked').reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-20">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-8 flex items-center gap-6">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Wallet className="text-primary" size={28} />
          </div>
          <div>
            <p className="text-white/40 text-sm mb-1">الرصيد الكلي</p>
            <h3 className="text-3xl font-bold tracking-tight">{totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-primary">USDT</span></h3>
          </div>
        </div>
        <div className="glass-card p-8 flex items-center gap-6">
          <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
            <Lock className="text-secondary" size={28} />
          </div>
          <div>
            <p className="text-white/40 text-sm mb-1">الرصيد المجمد</p>
            <h3 className="text-3xl font-bold tracking-tight">{lockedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm text-secondary">USDT</span></h3>
          </div>
        </div>
        <div className="glass-card p-8 flex items-center gap-6">
          <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center">
            <ArrowLeftRight className="text-white/60" size={28} />
          </div>
          <div>
            <p className="text-white/40 text-sm mb-1">عدد الصفقات</p>
            <h3 className="text-3xl font-bold tracking-tight">{transactions.length} <span className="text-sm text-white/40">صفقة</span></h3>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="glass-card overflow-hidden">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">إدارة الصفقات</h2>
          <Link to="/create-escrow" className="btn-primary py-2 px-6 text-sm">
            <PlusCircle size={18} />
            <span>إنشاء صفقة جديدة</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right" id="transactions-table">
            <thead>
              <tr className="bg-white/2">
                <th className="px-8 py-5 text-sm font-medium text-white/40">المبلغ</th>
                <th className="px-8 py-5 text-sm font-medium text-white/40">الشبكة</th>
                <th className="px-8 py-5 text-sm font-medium text-white/40">المستلم</th>
                <th className="px-8 py-5 text-sm font-medium text-white/40">الحالة</th>
                <th className="px-8 py-5 text-sm font-medium text-white/40">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-8 py-5 font-bold">{tx.amount} USDT</td>
                  <td className="px-8 py-5 text-white/60">{tx.network}</td>
                  <td className="px-8 py-5 text-sm font-mono text-white/40">
                    {tx.receiver === 'None' ? 'لم يحدد بعد' : `${tx.receiver.slice(0, 10)}...`}
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === 'Released' ? 'bg-primary/20 text-primary' : 
                      tx.status === 'Withdrawn' ? 'bg-red-500/20 text-red-400' :
                      tx.status === 'Locked' ? 'bg-secondary/20 text-secondary' : 
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {tx.status === 'Released' ? 'تم التحرير' : 
                       tx.status === 'Withdrawn' ? 'تم الانسحاب' :
                       tx.status === 'Locked' ? 'مجمدة' : 'بانتظار الإيداع'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    {(tx.status === 'Locked' || tx.status === 'Waiting') && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openActionModal(tx, 'release')}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs hover:bg-primary hover:text-black transition-all"
                        >
                          تحرير
                        </button>
                        <button 
                          onClick={() => openActionModal(tx, 'withdraw')}
                          className="px-3 py-1 bg-white/5 text-white/60 rounded-lg text-xs hover:bg-white/10 transition-all font-medium"
                        >
                          انسحاب
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Engine & Support - Enhanced */}
      <div className="mt-12 grid lg:grid-cols-12 gap-8">
        {/* Security Log */}
        <div className="lg:col-span-8 glass-card p-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -translate-y-16 translate-x-16 group-hover:bg-primary/10 transition-colors" />
           
           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Shield size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-bold">مركز الأمان والنشاط</h3>
                    <p className="text-xs text-white/30 uppercase tracking-widest font-bold">Real-time Security Monitoring</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-green-500/5 border border-green-500/20 rounded-full">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                 <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">تشفير E2EE نشط</span>
              </div>
           </div>
           
           <div className="space-y-4">
              {[
                { time: '14:22:05', event: 'تم مزامنة المحفظة المركزية مع عقد TRON الذكي بكفاءة 100%', type: 'success' },
                { time: '13:45:12', event: 'تم تدقيق بروتوكول تحرير الأموال v2.4 ونقل الأصول للمحفظة الباردة', type: 'shield' },
                { time: '12:10:00', event: 'عملية سحب ناجحة للمستخدم #3928 بقيمة 1,220 USDT', type: 'tx' },
                { time: 'أمس', event: 'تحديث شهادات الأمان السنوية وتفعيل طبقة التحقق المزدوجة', type: 'system' }
              ].map((log, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white/[0.01] hover:bg-white/[0.03] rounded-2xl border border-white/5 transition-all group/item">
                   <div className="flex items-center gap-5">
                      <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-primary shadow-[0_0_10px_rgba(0,212,170,1)]' : 'bg-white/10'}`} />
                      <div>
                        <p className="text-sm text-white/80 font-medium">{log.event}</p>
                        <p className="text-[9px] text-white/20 mt-1 uppercase tracking-tighter">Event ID: SEC-{Math.floor(Math.random()*10000)}</p>
                      </div>
                   </div>
                   <div className="text-left font-mono text-[10px] text-white/30 bg-white/5 px-2 py-1 rounded">
                      {log.time}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Support Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-10 flex flex-col items-center text-center relative overflow-hidden group h-full justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="text-primary" size={40} />
             </div>
             <h3 className="text-2xl font-bold mb-4">الدعم الفني المباشر</h3>
             <p className="text-white/40 text-sm mb-10 leading-relaxed font-arabic">
                هل لديك استفسار حول عملية تجميد أو تحرير؟ خبراء الأمان لدينا متواجدون لمساعدتك لحظياً.
             </p>
             <button 
               onClick={openSupportChat}
               className="w-full btn-secondary py-5 text-lg font-bold flex items-center justify-center gap-3 group/btn"
             >
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                تحدث مع خبير الآن
             </button>
             
             <div className="mt-8 pt-8 border-t border-white/5 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                   <span>تحديث أمان</span>
                   <span>V.2026.04</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <AnimatePresence>
        {selectedTx && actionType && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-8 w-full max-w-lg relative"
            >
               <button onClick={closeModal} className="absolute top-4 left-4 text-white/40 hover:text-white">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-bold mb-2">
                {actionType === 'withdraw' ? 'طلب انسحاب' : 'تحرير الأموال للمستلم'}
              </h2>
              <p className="text-white/50 text-sm mb-6">
                {actionType === 'withdraw' ? 'سيتم إعادة الأموال إلى محفظتك الخاصة.' : 'سيتم إرسال الأموال فوراً إلى المستلم.'}
              </p>

              <div className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center"
                  >
                    {error}
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 block">الشبكة المراد {actionType === 'withdraw' ? 'الانسحاب' : 'التحرير'} إليها</label>
                  <select 
                     value={customNetwork}
                     onChange={(e) => { setCustomNetwork(e.target.value); setError(null); }}
                     className={`w-full bg-zinc-900 border rounded-xl px-4 py-3 outline-none transition-colors text-white ${error && customNetwork === '' ? 'border-red-500/50' : 'border-white/10 focus:border-primary'}`}
                  >
                     {Object.keys(NETWORK_ADDRESSES).map(n => <option key={n} value={n} className="bg-zinc-900">{n}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70 block">رابط المحفظة (Wallet Address)</label>
                  <input 
                    type="text" 
                    value={customWallet}
                    onChange={(e) => { setCustomWallet(e.target.value); setError(null); }}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 outline-none transition-colors font-mono ${error ? 'border-red-500/50' : 'border-white/10 focus:border-primary'}`}
                    placeholder="أدخل عنوان المحفظة هنا..."
                  />
                  <p className="text-[10px] text-red-500 mt-2 font-medium">تأكد من صحة العنوان والشبكة لتجنب فقدان الأصول.</p>
                </div>

                <button 
                  onClick={() => handleAction(actionType === 'withdraw' ? 'Withdrawn' : 'Released')}
                  className={`w-full py-4 rounded-xl font-bold transition-all ${
                    actionType === 'withdraw' ? 'bg-white hover:bg-white/90 text-black' : 'btn-primary'
                  }`}
                >
                  تأكيد العملية
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CreateEscrow = ({ addTransaction }: { addTransaction: (tx: any) => void }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    network: 'TRC20'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Simulate process
    setTimeout(() => {
      addTransaction({
        id: Math.random().toString(36).substr(2, 9),
        amount: '0.00', // Amount starts at 0 until deposit is detected
        network: formData.network,
        receiver: 'None',
        status: 'Waiting',
        date: new Date().toLocaleDateString('ar-EG')
      });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-32 pb-20">
      <div className="glass-card overflow-hidden">
        <div className="p-8 md:p-12">
          <div className="mb-10 text-center lg:text-right">
            <h2 className="text-3xl font-bold mb-4">إنشاء صفقة (المودع)</h2>
            <p className="text-white/50 leading-relaxed max-w-xl">
              المودع لديه <span className="text-primary font-bold">الحرية المطلقة</span> في التحكم بأمواله. يمكنك سحبها في أي وقت طالما لم تضغط على "تحرير" للمستلم.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form Side - Now Order 1 */}
            <form onSubmit={handleSubmit} className="space-y-8 order-1">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                  {error}
                </div>
              )}
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-white/70 block px-1">الخطوة 1: اختر الشبكة للإيداع</label>
                  <select 
                    value={formData.network}
                    onChange={(e) => { setFormData({...formData, network: e.target.value}); setError(null); }}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-4 outline-none focus:border-primary transition-colors text-white font-bold"
                  >
                    <option value="TRC20" className="bg-zinc-900">TRC20 (Tron)</option>
                    <option value="BEP20" className="bg-zinc-900">BEP20 (Binance)</option>
                    <option value="ERC20" className="bg-zinc-900">ERC20 (Ethereum)</option>
                    <option value="Polygon" className="bg-zinc-900">Polygon</option>
                    <option value="Solana" className="bg-zinc-900">Solana (SOL)</option>
                    <option value="BASE" className="bg-zinc-900">BASE</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary w-full py-5 text-xl font-bold"
              >
                {isSubmitting ? 'جاري بدء الصفقة...' : 'تأكيد الشبكة وبدء الصفقة'}
              </button>
            </form>

            {/* Live Deposit Info - Now Order 2 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/40 rounded-3xl p-8 border border-white/5 flex flex-col items-center justify-center text-center order-2"
            >
              <div className="w-full mb-8">
                <p className="text-primary font-bold mb-4 flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]">
                  <CheckCircle2 size={16} />
                  عنوان الإيداع لشبكة {formData.network}
                </p>
                <div className="p-4 bg-white rounded-2xl inline-block shadow-[0_0_30px_rgba(0,212,170,0.1)]">
                  <QRCodeSVG 
                    value={NETWORK_ADDRESSES[formData.network]} 
                    size={160}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="mt-4 text-[11px] text-white/50 leading-relaxed max-w-[240px] mx-auto font-medium">
                  لإتمام الإيداع، قم بإرسال عملات <span className="text-primary font-bold">USDT</span> فقط إلى العنوان الموضح أدناه أو استخدم تطبيق المحفظة لتصوير رمز QR مباشرة.
                </p>
              </div>

              <div className="w-full space-y-6">
                <div className="relative group">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 font-mono text-sm break-all text-primary/90 font-bold">
                    {NETWORK_ADDRESSES[formData.network]}
                  </div>
                  <button 
                    onClick={() => {
                       navigator.clipboard.writeText(NETWORK_ADDRESSES[formData.network]);
                       alert('تم نسخ العنوان');
                    }}
                    className="mt-2 text-xs text-white/30 hover:text-primary transition-colors underline"
                  >
                    نسخ العنوان
                  </button>
                </div>

                <div className="p-4 bg-red-400/5 border border-red-400/20 rounded-xl text-right">
                  <p className="text-red-400 text-[11px] leading-relaxed font-bold">
                    ⚠️ {NETWORK_WARNINGS[formData.network]}
                  </p>
                </div>

                <div className="flex items-center gap-3 justify-center text-xs text-white/40 bg-white/5 p-3 rounded-xl border border-white/5">
                  <Clock size={16} className="text-yellow-500" />
                  <span>تحديث تلقائي متاح بمجرد الإيداع</span>
                </div>

                {/* Security Guarantee Box */}
                <div className="mt-8 p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="text-primary" size={20} />
                    <p className="text-sm font-bold text-primary">ضمان شيكلي للأمان</p>
                  </div>
                  <ul className="text-[10px] text-white/50 space-y-2 text-right">
                    <li>• يتم تشفير جميع العناوين والبيانات بنظام AES-256</li>
                    <li>• الأموال مؤمنة في محافظ باردة (Escrow Infrastructure)</li>
                    <li>• دعم فني متاح 24/7 لحل أي نزاعات برمجية</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Support Chat Component ---
const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'مرحباً بك في مركز دعم شيكلي. كيف يمكننا مساعدتك اليوم؟', sender: 'support', time: 'الآن' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openSupportChat', handleOpenChat);
    return () => window.removeEventListener('openSupportChat', handleOpenChat);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { id: Date.now(), text: inputText, sender: 'user', time: 'الآن' };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    
    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        'شكراً لتواصلك معنا. فريقنا الفني يقوم بمراجعة استفسارك الآن.',
        'نحن هنا لضمان أمان صفقتك. هل لديك رقم الصفقة المعنية؟',
        'يمكنك دائماً سحب أموالك قبل عملية التحرير بضغطة زر من لوحة التحكم.',
        'نحن ندعم شبكات TRC20 و BEP20 بشكل أساسي لسرعة التنفيذ.'
      ];
      const randomResponse = { 
        id: Date.now() + 1, 
        text: responses[Math.floor(Math.random() * responses.length)], 
        sender: 'support', 
        time: 'الآن' 
      };
      setMessages(prev => [...prev, randomResponse]);
    }, 2000);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 left-8 w-16 h-16 bg-primary rounded-2xl shadow-[0_10px_30px_rgba(0,212,170,0.4)] flex items-center justify-center z-[100] group"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full" />
        <MessageSquare className="text-black group-hover:rotate-12 transition-transform" size={28} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8, x: -50 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
            exit={{ opacity: 0, y: 100, scale: 0.8, x: -50 }}
            className="fixed bottom-28 left-8 w-[350px] md:w-[380px] h-[550px] bg-zinc-950 border border-white/10 rounded-[32px] shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-900 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Shield className="text-primary" size={20} />
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-zinc-900 rounded-full animate-pulse" />
                </div>
                <div className="text-right">
                  <h4 className="font-bold text-sm">دعم شيكلي</h4>
                  <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">متصل الآن</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center justify-center text-white/40 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              {messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed text-right ${
                    msg.sender === 'user' 
                      ? 'bg-primary text-black font-bold rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-white/80 rounded-tl-none'
                  }`}>
                    {msg.text}
                    <p className={`text-[8px] mt-2 ${msg.sender === 'user' ? 'text-black/40' : 'text-white/20'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-zinc-900 border-t border-white/5 flex gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary transition-colors text-right"
              />
              <button 
                type="submit"
                className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black hover:scale-105 transition-transform"
              >
                <Send size={20} className="rotate-180" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const addTransaction = (tx: Transaction) => {
    setTransactions([tx, ...transactions]);
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark-bg selection:bg-primary/20">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
            <Route 
              path="/dashboard" 
              element={isLoggedIn ? <Dashboard transactions={transactions} setTransactions={setTransactions} /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} 
            />
            <Route 
              path="/create-escrow" 
              element={isLoggedIn ? <CreateEscrow addTransaction={addTransaction} /> : <LoginPage setIsLoggedIn={setIsLoggedIn} />} 
            />
          </Routes>
        </main>

        <SupportChat />

        <footer className="py-20 border-t border-white/5 bg-black/60 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,212,170,0.3)]">
                     <Shield className="text-black" size={24} />
                  </div>
                  <span className="text-2xl font-black tracking-tighter">شـيـكـلي</span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed max-w-sm mb-8">
                  المنصة الرائدة في المنطقة للوساطة الرقمية وتأمين التعاملات بين الأفراد والشركات. نعمل لضمان حقوق الجميع عبر تقنيات التشفير المتقدمة.
                </p>
                <div className="flex gap-4">
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                      <Share2 size={20} className="text-white/60" />
                   </div>
                   <div className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-primary/50 transition-colors cursor-pointer">
                      <Zap size={20} className="text-white/60" />
                   </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-white font-bold mb-6">روابط سريعة</h4>
                <ul className="space-y-4 text-sm text-white/40">
                  <li><Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
                  <li><Link to="/dashboard" className="hover:text-primary transition-colors">لوحة التحكم</Link></li>
                  <li><Link to="/create-escrow" className="hover:text-primary transition-colors">إنشاء صفقة</Link></li>
                  <li><a href="#" className="hover:text-primary transition-colors">الأسئلة الشائعة</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-bold mb-6">الأمان والقانون</h4>
                <ul className="space-y-4 text-sm text-white/40">
                  <li><a href="#" className="hover:text-primary transition-colors">سياسة الخصوصية</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">شروط الاستخدام</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">معايير الامتثال</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">بلاغات الأمان</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <p className="text-white/20 text-xs font-medium">© 2026 شيكلي. جميع الحقوق محفوظة.</p>
              <div className="flex items-center gap-8 grayscale opacity-20 hover:grayscale-0 hover:opacity-50 transition-all duration-700">
                 <span className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-1 rounded">SSL Secure</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-1 rounded">256-bit AES</span>
                 <span className="text-[10px] font-bold uppercase tracking-widest border border-white/20 px-2 py-1 rounded">Verified Escrow</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
