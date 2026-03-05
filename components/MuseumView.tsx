
import React, { useState } from 'react';
import { ArrowLeft, Target, Zap, ShieldAlert, User, Info, Sparkles, Activity } from 'lucide-react';

interface Exhibit {
    id: string;
    title: string;
    description: string;
    image: string;
    profile: {
        psychotype: string;
        context: string;
        intensity: number;
        status: 'Архив' | 'Разбор' | 'Активен';
    };
    quote: string;
}

const EXHIBITS: Exhibit[] = [
    {
        id: '1',
        title: 'Тихая Тень',
        description: 'Ученица 8-го класса выронила смартфон под ноги учителю. В глазах паника, за которой скрывается нечто большее, чем просто страх за гаджет.',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80',
        quote: '«Это не моё... я просто... пожалуйста, не звоните отцу...»',
        profile: {
            psychotype: 'Сенситивный',
            context: 'Домашнее насилие',
            intensity: 4,
            status: 'Разбор'
        }
    },
    {
        id: '2',
        title: 'Гнев Эпилептоида',
        description: 'Посреди класса стоит подросток. Рюкзак одноклассницы выпотрошен. Он не чувствует вины, он чувствует «справедливость».',
        image: 'https://images.unsplash.com/photo-1528815197793-2412803c7344?w=800&q=80',
        quote: '«Она сама виновата. Справедливость восстановлена».',
        profile: {
            psychotype: 'Эпилептоидный',
            context: 'Агрессия и месть',
            intensity: 5,
            status: 'Разбор'
        }
    },
    {
        id: '3',
        title: 'Цифровой Побег',
        description: 'Синий свет экрана отражается в пустых глазах. Школа — это баг, который он хочет поскорее пропустить.',
        image: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=800&q=80',
        quote: '«Просто скипните этот диалог. У меня рейд через пять минут».',
        profile: {
            psychotype: 'Шизоидный',
            context: 'Игровая зависимость',
            intensity: 3,
            status: 'Архив'
        }
    },
    {
        id: '4',
        title: 'Жертва Сети',
        description: 'Ученица всё реже приходит в класс. Одноклассники знают, почему — анонимные «мемы» уже разошлись по всем чатам. Она пришла к психологу только потому, что пригрозили завучу.',
        image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80',
        quote: '«Зачем вы вмешались? Теперь будет только хуже...»',
        profile: {
            psychotype: 'Лабильный',
            context: 'Кибербуллинг',
            intensity: 4,
            status: 'Разбор'
        }
    },
    {
        id: '5',
        title: 'Призрак Класса',
        description: 'Его не видели в школе уже две недели. Когда его нашли в торговом центре и привели к учителю, он смотрел сквозь стены — как будто классная комната для него давно перестала существовать.',
        image: 'https://images.unsplash.com/photo-1519766304828-9a5d0a90af17?w=800&q=80',
        quote: '«Я не прогульщик. Я просто перестал туда ходить».',
        profile: {
            psychotype: 'Циклоидный',
            context: 'Отказ от учёбы',
            intensity: 3,
            status: 'Разбор'
        }
    },
    {
        id: '6',
        title: 'Рёбра Бабочки',
        description: 'Длинные рукава в жаркий день. Взгляд в пол. Школьный психолог оставил пометку: «суицидальные маркеры». Разговор неизбежен.',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80',
        quote: '«Со мной всё нормально. Просто холодно».',
        profile: {
            psychotype: 'Сенситивный',
            context: 'Селфхарм / СД-риск',
            intensity: 5,
            status: 'Разбор'
        }
    },
    {
        id: '7',
        title: 'Маска без Имени',
        description: 'Отличная учёба, вежливость, ни одного конфликта — и ни одного друга. Он задыхается у доски так, что класс в шоке. Он говорит, что просто «устал».',
        image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&q=80',
        quote: '«Я не паникую. Просто... мне нужна минута».',
        profile: {
            psychotype: 'Психастенический',
            context: 'Социальная тревога',
            intensity: 4,
            status: 'Архив'
        }
    }
];

interface Props {
    onBack: () => void;
}

const MuseumView: React.FC<Props> = ({ onBack }) => {
    const [selected, setSelected] = useState<Exhibit | null>(null);

    return (
        <div className="h-full bg-slate-950 flex flex-col font-sans text-slate-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent)] pointer-events-none"></div>
            
            {/* Цитата Г.К. */}
            <div className="absolute top-24 right-12 z-0 opacity-10 pointer-events-none text-right hidden lg:block">
                <p className="text-[12px] font-black uppercase tracking-[0.3em] leading-relaxed text-slate-400">
                    «Раньше было сложно,<br/>дальше будет трудно»<br/>
                    <span className="text-blue-500">— Г.К.</span>
                </p>
            </div>

            <header className="p-8 border-b border-white/5 flex items-center justify-between relative z-10 bg-slate-950/50 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter italic">ЯНУШ // <span className="text-blue-500">ЭКСПОЗИЦИЯ</span></h1>
                        <div className="flex items-center gap-2 text-[8px] text-blue-500/70 font-black tracking-[0.4em] uppercase">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping"></div>
                            ЕЩЁ НЕ ПАТОЛОГИЯ, НО УЖЕ НЕ НОРМА
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-8 relative z-10 no-scrollbar">
                <div className="mb-12">
                    <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Выставка акцентуаций им. А. Личко</h2>
                    <div className="h-px w-full bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
                    {EXHIBITS.map((ex) => (
                        <div 
                            key={ex.id} 
                            onClick={() => setSelected(ex)}
                            className="group glass rounded-[45px] overflow-hidden border-white/5 hover:border-blue-500/30 transition-all cursor-pointer bg-slate-900/40"
                        >
                            <div className="relative h-64 overflow-hidden bg-slate-900">
                                <img 
                                    src={ex.image} 
                                    alt={ex.title} 
                                    className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 blur-[1px] group-hover:blur-0" 
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Activity size={12} className="text-blue-500" />
                                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em]">Архив №{ex.id}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">{ex.title}</h3>
                                </div>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 italic">
                                    {ex.description}
                                </p>
                                <button className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black uppercase text-[9px] tracking-[0.2em] border border-white/5 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    Изучить профиль
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl glass rounded-[60px] border-blue-500/20 overflow-hidden flex flex-col md:flex-row relative shadow-2xl">
                        <button 
                            onClick={() => setSelected(null)}
                            className="absolute top-8 right-8 z-50 p-3 bg-black/50 text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-full md:w-1/2 h-80 md:h-auto relative bg-slate-900">
                            <img src={selected.image} className="w-full h-full object-cover grayscale opacity-60" />
                        </div>

                        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center space-y-8">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-blue-500">
                                    <Target size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em]">Клинический Разбор</span>
                                </div>
                                <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">{selected.title}</h2>
                            </div>

                            <div className="space-y-6">
                                <p className="text-slate-400 text-sm leading-relaxed italic">
                                    {selected.description}
                                </p>
                                <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl italic text-blue-400 text-sm">
                                    {selected.quote}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1">
                                            <User size={12}/> Тип акцентуации
                                        </span>
                                        <span className="text-xs font-bold text-white uppercase mt-1">{selected.profile.psychotype}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1">
                                            <ShieldAlert size={12}/> Состояние
                                        </span>
                                        <span className="text-[10px] font-black uppercase mt-1 text-blue-500">{selected.profile.status}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest flex items-center gap-1">
                                        <Zap size={12}/> Индекс тяжести
                                    </span>
                                    <div className="flex gap-1 mt-2">
                                        {[1,2,3,4,5].map(lv => (
                                            <div key={lv} className={`h-1.5 flex-1 rounded-full ${lv <= selected.profile.intensity ? 'bg-blue-500' : 'bg-slate-800'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[28px] font-black uppercase text-xs tracking-[0.3em] shadow-xl transition-all flex items-center justify-center gap-3 italic">
                                <Sparkles size={16} /> Запуск учебного сеанса
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const X: React.FC<{ size?: number, className?: string }> = ({ size = 20, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default MuseumView;
