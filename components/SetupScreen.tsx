import React, { useState } from 'react';
import { TeacherProfile, StudentProfile } from '../types';
import { ChevronRight, User, Settings, LogOut, ArrowLeft, CheckCircle2, Activity, Target, CreditCard, Sparkles, X, Loader2, ShieldAlert, Users, BookOpen, Heart, Smartphone, Home, Brain, Shuffle } from 'lucide-react';
import { generateStudentName } from '../services/chaosEngine';
import { ScenarioCategory } from '../services/chaosEngine';
import { authService } from '../services/authService';
import { COMMERCIAL_CONFIG } from '../constants';

interface Props {
  onStart: (teacher: TeacherProfile, student: StudentProfile, category?: ScenarioCategory) => void;
  onOpenAdmin: () => void;
  onBack: () => void;
}

const SCENARIO_CATEGORIES: Array<{
  id: ScenarioCategory | 'random';
  label: string;
  sublabel: string;
  Icon: React.FC<{ size?: number; className?: string }>;
  color: string;
  bg: string;
  border: string;
}> = [
  { id: 'random',        label: 'Случайный',       sublabel: 'Сюрприз',          Icon: Shuffle,     color: 'text-slate-300',   bg: 'bg-slate-500/10',   border: 'border-slate-500/30' },
  { id: 'aggressive',    label: 'Агрессия',         sublabel: 'Грубость, драки',  Icon: ShieldAlert, color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30' },
  { id: 'bullying',      label: 'Буллинг',          sublabel: 'Травля, кибер',    Icon: Users,       color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/30' },
  { id: 'truancy',       label: 'Прогулы',          sublabel: 'Отказ от учёбы',   Icon: BookOpen,    color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30' },
  { id: 'suicide_risk',  label: 'Суицид-риск',      sublabel: 'Селфхарм, маркеры',Icon: Heart,       color: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/30' },
  { id: 'addiction',     label: 'Зависимости',      sublabel: 'Гаджеты, ПАВ',    Icon: Smartphone,  color: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30' },
  { id: 'family',        label: 'Семья',            sublabel: 'Конфликты, кризис',Icon: Home,        color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30' },
  { id: 'social_anxiety',label: 'Тревожность',      sublabel: 'Замкнутость, страх',Icon: Brain,      color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
];

const SetupScreen: React.FC<Props> = ({ onStart, onOpenAdmin, onBack }) => {
  const [teacherName, setTeacherName] = useState('Алексей Петрович');
  const [teacherGender, setTeacherGender] = useState<'male' | 'female'>('male');
  const [studentAge, setStudentAge] = useState(14);
  const [studentGender, setStudentGender] = useState<'male' | 'female'>('male');
  const [selectedCategory, setSelectedCategory] = useState<ScenarioCategory | 'random'>('random');
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const isPremium = authService.isPremium();
  const isAdmin = authService.isAdmin();

  const handleStart = () => {
    const randomName = generateStudentName(studentGender);
    onStart(
      { name: teacherName, gender: teacherGender },
      { name: randomName, age: studentAge, gender: studentGender },
      selectedCategory === 'random' ? undefined : selectedCategory
    );
  };

  const processPayment = async () => {
      setIsProcessingPayment(true);
      
      // Логика перехода на реальную оплату
      // В будущем: window.location.href = `${COMMERCIAL_CONFIG.PAYMENT_PROVIDER_URL}?user=${authService.getCurrentUser()?.id}`;
      
      await new Promise(r => setTimeout(r, 2000));
      
      await authService.upgradeToPremium(COMMERCIAL_CONFIG.SUBSCRIPTION_DAYS);
      setIsProcessingPayment(false);
      setShowPayment(false);
      window.location.reload(); 
  };

  return (
    <div className="h-full bg-slate-950 flex flex-col items-center p-6 overflow-y-auto no-scrollbar relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(37,99,235,0.1),transparent)] pointer-events-none"></div>
      
      <div className="w-full max-w-lg mt-4 mb-12 flex flex-col space-y-10 relative z-10">
        
        <div className="flex justify-between items-center">
            <button onClick={onBack} className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5">
                <ArrowLeft size={20} />
            </button>
            <div className="text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">ПОДГОТОВКА</h1>
                <p className="text-blue-500 text-[9px] font-black uppercase tracking-[0.4em]">Параметры Сеанса</p>
            </div>
            <div className="flex gap-2">
                {isAdmin && (
                    <button onClick={onOpenAdmin} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-blue-500 transition-all">
                        <Settings size={20} />
                    </button>
                )}
                <button onClick={() => authService.logout()} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                    <LogOut size={20} />
                </button>
            </div>
        </div>

        {isPremium ? (
             <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-[40px] relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-emerald-500/20 rounded-2xl">
                        <CheckCircle2 size={24} className="text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-[10px] uppercase tracking-[0.2em]">Полный Допуск Активен</h4>
                        <p className="text-emerald-500/80 text-[9px] font-bold mt-1 tracking-widest uppercase">Все 11 психотипов разблокированы</p>
                    </div>
                </div>
            </div>
        ) : (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 p-8 rounded-[40px] shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                        <Activity size={24} className="text-white" />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-xs uppercase italic tracking-widest">Пробная версия</h4>
                        <p className="text-blue-100 text-[9px] font-bold opacity-80 mt-1 uppercase">Заблокировано: 9 акцентуаций</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowPayment(true)}
                    className="w-full py-4 bg-white text-blue-600 rounded-[20px] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles size={14} /> КУПИТЬ ПОЛНЫЙ ДОСТУП
                </button>
            </div>
        )}

        <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] ml-2">
                <User size={14} /> Профиль Педагога
            </div>
            <div className="glass p-8 rounded-[40px] space-y-8 border-white/5">
                <div className="space-y-6">
                    <div>
                       <label className="block text-[10px] text-slate-500 font-black uppercase mb-3 tracking-widest">Фамилия Имя Отчество</label>
                       <input 
                         type="text" 
                         value={teacherName}
                         onChange={e => setTeacherName(e.target.value)}
                         className="w-full bg-slate-900/80 border border-white/10 rounded-2xl p-5 text-white outline-none focus:border-blue-500/50 font-bold italic"
                       />
                    </div>
                    <div className="flex gap-3">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g}
                                onClick={() => setTeacherGender(g as any)}
                                className={`flex-1 py-5 rounded-[22px] text-[10px] font-black uppercase transition-all border ${teacherGender === g ? 'bg-blue-600 border-blue-400 text-white shadow-xl' : 'bg-white/5 text-slate-500 border-white/5'}`}
                            >
                                {g === 'male' ? 'МУЖЧИНА' : 'ЖЕНЩИНА'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-3 text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] ml-2">
                <Target size={14} /> Параметры Ученика
            </div>
            <div className="glass p-8 rounded-[40px] space-y-10 border-white/5">
                <div className="space-y-8">
                    <div className="flex gap-3">
                        {['male', 'female'].map((g) => (
                            <button
                                key={g}
                                onClick={() => setStudentGender(g as any)}
                                className={`flex-1 py-5 rounded-[22px] text-[10px] font-black uppercase transition-all border ${studentGender === g ? 'bg-purple-600 border-purple-400 text-white shadow-xl' : 'bg-white/5 text-slate-500 border-white/5'}`}
                            >
                                {g === 'male' ? 'ЮНОША' : 'ДЕВУШКА'}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end mb-2">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-1">Возраст</label>
                            <span className="text-3xl font-black text-white italic">{studentAge}</span>
                        </div>
                        <input 
                            type="range" min="12" max="17" step="1"
                            value={studentAge}
                            onChange={e => setStudentAge(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-900 rounded-full appearance-none accent-purple-500"
                        />
                    </div>
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center gap-3 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em] ml-2">
                <Activity size={14} /> Тема Сеанса
            </div>
            <div className="glass p-6 rounded-[40px] border-white/5">
                <div className="grid grid-cols-2 gap-3">
                    {SCENARIO_CATEGORIES.map(({ id, label, sublabel, Icon, color, bg, border }) => (
                        <button
                            key={id}
                            onClick={() => setSelectedCategory(id as ScenarioCategory | 'random')}
                            className={`flex items-center gap-3 p-4 rounded-[22px] text-left transition-all border ${
                                selectedCategory === id
                                    ? `${bg} ${border} ${color}`
                                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/15'
                            }`}
                        >
                            <Icon size={18} className={selectedCategory === id ? color : 'text-slate-600'} />
                            <div>
                                <div className={`text-[10px] font-black uppercase leading-none ${selectedCategory === id ? color : 'text-slate-400'}`}>{label}</div>
                                <div className="text-[8px] text-slate-600 mt-0.5">{sublabel}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <button 
            onClick={handleStart}
            className="w-full py-7 bg-white text-slate-950 rounded-[40px] font-black text-xl hover:bg-blue-400 transition-all active:scale-95 shadow-xl flex items-center justify-center gap-4 italic uppercase tracking-widest"
        >
            НАЧАТЬ СЕАНС <ChevronRight size={28} />
        </button>

      </div>

      {showPayment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="w-full max-w-md glass rounded-[50px] p-10 space-y-8 border-blue-500/30 shadow-2xl relative">
                  {!isProcessingPayment && (
                      <button onClick={() => setShowPayment(false)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
                  )}
                  <div className="text-center space-y-4">
                      <div className="inline-flex p-4 bg-blue-600/20 rounded-[32px] text-blue-400">
                          <CreditCard size={48} />
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">ОПЛАТА ДОСТУПА</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Переход в защищенный платежный шлюз</p>
                  </div>
                  
                  <div className="space-y-4 bg-white/5 p-8 rounded-[40px] border border-white/5 text-center">
                      <div className="text-white font-black text-4xl mb-2">{COMMERCIAL_CONFIG.PRICE_RUB} ₽</div>
                      <div className="text-[9px] text-slate-500 uppercase tracking-widest">Единоразовый платеж за {COMMERCIAL_CONFIG.SUBSCRIPTION_DAYS} дней</div>
                  </div>

                  <button 
                    disabled={isProcessingPayment}
                    onClick={processPayment}
                    className="w-full py-6 bg-blue-600 text-white rounded-[28px] font-black uppercase tracking-[0.4em] text-xs shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
                  >
                    {isProcessingPayment ? <Loader2 className="animate-spin" size={20} /> : 'ПЕРЕЙТИ К ОПЛАТЕ'}
                  </button>
                  
                  <div className="space-y-2">
                      <p className="text-[7px] text-center text-slate-700 uppercase tracking-[0.2em]">Платежи защищены по стандарту PCI DSS</p>
                      <p className="text-[7px] text-center text-slate-800 uppercase tracking-[0.1em]">После оплаты вы будете автоматически перенаправлены обратно</p>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default SetupScreen;
