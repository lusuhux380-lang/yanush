import { TeacherProfile, StudentProfile, Accentuation, ContextModule, ActiveSession } from '../types';
import { DEFAULT_ACCENTUATIONS, DEFAULT_CONTEXT_MODULES } from '../constants';
import { ACCESS_LIMITS } from './authService';

const AVATAR_DB = {
    male: {
        neutral: ["1503443207934-14cc8059e28b", "1485230405346-71acb9518d9c", "1542596594-649edbc13630"],
        dark: ["1519766304828-9a5d0a90af17", "1602341612423-3b691d575225", "1508341591423-4347099e1f19"],
        bright: ["1519345182560-3f2917c472ef", "1480455624313-e29b44bbfde1", "1513956589380-bad6acb9b9d4"],
        tough: ["1528815197793-2412803c7344", "1513258509042-88748d3db392", "1463453091185-61582044d556"]
    },
    female: {
        neutral: ["1517841905240-472988babdf9", "1529626455594-4ff0802cfb7e", "1438761681033-6461ffad8d80"],
        dark: ["1555437877-66a7b686377e", "1534528741775-53994a69daeb", "1506794778202-cad84cf45f1d"],
        bright: ["1524504388940-b1c1722653e1", "1516575334481-f85287c2c81d", "1494790108377-be9c29b29330"],
        tough: ["1541260894-3b2e53a554a9", "1515159550328-86ee283eb971", "1520184422263-d7a8d052a23e"]
    }
};

/**
 * Склонение имен для родительного падежа (кого? чего?)
 */
const declineNameGenitive = (name: string, gender: 'male' | 'female'): string => {
    const n = name.trim();
    if (gender === 'male') {
        if (n === 'Дмитрий') return 'Дмитрия';
        if (n === 'Матвей') return 'Матвея';
        if (n === 'Илья') return 'Ильи';
        if (n === 'Никита') return 'Никиты';
        if (n === 'Глеб') return 'Глеба';
        if (n === 'Артем' || n === 'Артём') return 'Артёма';
        
        // Если заканчивается на согласную (кроме й)
        const vowels = ['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я', 'й'];
        if (!vowels.includes(n.slice(-1).toLowerCase())) {
            return n + 'а';
        }
    } else {
        if (n.endsWith('ия')) return n.slice(0, -2) + 'ии';
        if (n.endsWith('я')) return n.slice(0, -1) + 'и';
        if (n.endsWith('а')) {
            const preLast = n.slice(-2, -1).toLowerCase();
            if (['г', 'к', 'х', 'ж', 'ч', 'ш', 'щ'].includes(preLast)) return n.slice(0, -1) + 'и';
            return n.slice(0, -1) + 'ы';
        }
    }
    return n;
};

export const resolveGenderTokens = (text: string, student: StudentProfile): string => {
    let resolved = text;
    
    // 1. Имена (сначала родительный, потом обычный)
    resolved = resolved.replace(/{name_gen}/g, declineNameGenitive(student.name, student.gender));
    resolved = resolved.replace(/{name}/g, student.name.trim());

    // 2. Сложные токены {муж|жен} или {муж|жен|множ}
    const genderRegex = /\{([^{}|]*)\|([^{}|]*)\}/g;
    while (genderRegex.test(resolved)) {
        resolved = resolved.replace(genderRegex, (_, m, f) => {
            return student.gender === 'male' ? m : f;
        });
    }

    return resolved;
};

const getStudentAvatar = (gender: 'male' | 'female', accentId: string): string => {
    let vibe: 'neutral' | 'dark' | 'bright' | 'tough' = 'neutral';
    if (['acc_hyperthymic', 'acc_hysteroid'].includes(accentId)) vibe = 'bright';
    else if (['acc_schizoid', 'acc_cycloid', 'acc_sensitive'].includes(accentId)) vibe = 'dark';
    else if (['acc_epileptoid', 'acc_unstable'].includes(accentId)) vibe = 'tough';
    const collection = AVATAR_DB[gender][vibe];
    return `https://images.unsplash.com/photo-${collection[Math.floor(Math.random() * collection.length)]}?w=400&h=400&fit=crop&crop=faces&q=80`;
};

export const generateStudentName = (gender: 'male' | 'female'): string => {
    const maleNames = ['Максим', 'Артем', 'Иван', 'Даниил', 'Никита', 'Кирилл', 'Егор', 'Дмитрий', 'Александр', 'Матвей', 'Руслан', 'Роман', 'Глеб', 'Илья'];
    const femaleNames = ['София', 'Анна', 'Мария', 'Виктория', 'Анастасия', 'Полина', 'Алиса', 'Вероника', 'Ксения', 'Екатерина', 'Марина', 'Дарья', 'Елена', 'Ольга'];
    const list = gender === 'male' ? maleNames : femaleNames;
    return list[Math.floor(Math.random() * list.length)];
};

export type ScenarioCategory = 'aggressive' | 'bullying' | 'truancy' | 'suicide_risk' | 'addiction' | 'family' | 'social_anxiety';

const CATEGORY_INCIDENT_IDS: Record<ScenarioCategory, string[]> = {
  aggressive:    ['inc_fight', 'inc_rude', 'inc_dominance', 'inc_vandal'],
  bullying:      ['inc_cyberbullying', 'inc_setup'],
  truancy:       ['inc_truancy', 'inc_sleep'],
  suicide_risk:  ['inc_panic', 'inc_sleep'],
  addiction:     ['inc_vape', 'inc_phone', 'inc_earbuds'],
  family:        ['inc_fight', 'inc_grades_begging', 'inc_cheating'],
  social_anxiety:['inc_panic', 'inc_earbuds', 'inc_theft'],
};

const CATEGORY_BACKGROUND_IDS: Record<ScenarioCategory, string[]> = {
  aggressive:    ['bg_bad_company', 'bg_divorce', 'bg_gifted'],
  bullying:      ['bg_poor', 'bg_bad_company', 'bg_orphan'],
  truancy:       ['bg_gamer', 'bg_bad_company', 'bg_divorce'],
  suicide_risk:  ['bg_selfharm', 'bg_abuse', 'bg_loss'],
  addiction:     ['bg_gamer', 'bg_blogger'],
  family:        ['bg_abuse', 'bg_divorce', 'bg_orphan'],
  social_anxiety:['bg_orphan', 'bg_loss', 'bg_poor'],
};

function pickFromCategory<T extends { id: string }>(all: T[], ids: string[]): T | undefined {
  const filtered = all.filter(m => ids.includes(m.id));
  if (filtered.length === 0) return undefined;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export const buildDynamicPrompt = (teacher: TeacherProfile, student: StudentProfile, isPremium: boolean = false, category?: ScenarioCategory): ActiveSession => {
  const availableAccs = isPremium ? DEFAULT_ACCENTUATIONS : DEFAULT_ACCENTUATIONS.filter(a => ACCESS_LIMITS.FREE_ACCENTUATIONS.includes(a.id));
  const randomAcc = availableAccs[Math.floor(Math.random() * availableAccs.length)];
  const intensity = Math.floor(Math.random() * 3) + 3; 
  
  student.avatarUrl = getStudentAvatar(student.gender, randomAcc.id);

  const allIncidents = DEFAULT_CONTEXT_MODULES.filter(m => m.category === 'incident');
  const allBackgrounds = DEFAULT_CONTEXT_MODULES.filter(m => m.category === 'background');

  const incident = (category && pickFromCategory(allIncidents, CATEGORY_INCIDENT_IDS[category]))
    ?? [...allIncidents].sort(() => Math.random() - 0.5)[0];
  const background = (category && pickFromCategory(allBackgrounds, CATEGORY_BACKGROUND_IDS[category]))
    ?? [...allBackgrounds].sort(() => Math.random() - 0.5)[0];

  const chaosPrompt = `
    [ЯЗЫКОВОЙ ПРОТОКОЛ: СТРОГО КИРИЛЛИЦА, РУССКИЙ ЯЗЫК]
    [SYSTEM ROLE: GM / NARRATOR / STUDENT]
    
    ТЫ — ПОДРОСТОК: ${student.name.trim()}, ${student.age} лет.
    ПСИХОТИП: ${randomAcc.name}. Интенсивность ${intensity}/5.
    
    СИТУАЦИЯ: ${incident.prompt_text}
    КОНТЕКСТ: ${background.prompt_text}
    СКРЫТАЯ ЦЕЛЬ: ${background.hidden_agenda}

    ИНСТРУКЦИЯ:
    - НИКАКОГО АНГЛИЙСКОГО (Cv, Ref и т.д. СТРОГО ЗАПРЕЩЕНО).
    - Реагируй эмоционально, используя подростковый сленг.
    - В JSONthought пиши свои скрытые мотивы, в verbal_response — слова и действия.
    
    УЧИТЕЛЬ: ${teacher.name} (${teacher.gender === 'male' ? 'Мужчина' : 'Женщина'}).
  `;

  return {
    teacher,
    student,
    constructedPrompt: chaosPrompt,
    chaosDetails: {
      accentuation: randomAcc.name,
      intensity,
      modules: [incident.name, background.name],
      starting_trust: incident.initial_trust || 30, 
      starting_stress: incident.initial_stress || 40,
      thresholds: {
        runaway_stress: 95,
        runaway_trust: 5,
        shutdown_stress: 90,
        shutdown_trust: 10
      },
      contextSummary: resolveGenderTokens(incident.teacher_briefing, student)
    }
  };
};