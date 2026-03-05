// services/geminiService.ts
import { Message, MessageRole, AnalysisResult } from "../types";

type GeminiChatResponse = {
  text: string;
  thought: string;
  trust: number;
  stress: number;
  game_over?: boolean;
  violation_reason?: string;
};

const MODEL_ACTION = "gemini-2.0-flash-lite:generateContent"; // поменяй на gemini-2.0-flash:generateContent если proxy вернёт "model not found"

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function extractGeminiText(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p: any) => (typeof p?.text === "string" ? p.text : ""))
    .filter(Boolean)
    .join("");
}

async function postViaProxy(body: any, timeoutMs = 60_000): Promise<any> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const r = await fetch(`/api/proxy?url=${encodeURIComponent(MODEL_ACTION)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    const data = await r.json().catch(() => ({}));

    if (!r.ok) {
      throw new Error(data?.error || `Proxy request failed (${r.status})`);
    }

    return data;
  } finally {
    clearTimeout(t);
  }
}

function buildContentsFromMessages(messages: Message[]) {
  return messages
    .filter((m) => m.role === MessageRole.USER || m.role === MessageRole.MODEL)
    .map((m) => ({
      role: m.role === MessageRole.USER ? "user" : "model",
      parts: [{ text: m.content }],
    }));
}

/**
 * Чат: возвращает JSON-объект, который ожидает ChatInterface.
 */
export async function sendMessageToGemini(
  messages: Message[],
  constructedPrompt: string,
  _userText: string
): Promise<GeminiChatResponse> {
  const instruction = `
Отвечай ТОЛЬКО СТРОГИМ JSON (без \`\`\`).
Схема:
{
  "text": "реплика студента",
  "thought": "внутренний ход мысли (для админа)",
  "trust": число 0..100,
  "stress": число 0..100,
  "game_over": true/false,
  "violation_reason": "если game_over=true — кратко почему"
}
Никакого текста вне JSON.
`;

  const contents = [
    {
      role: "user",
      parts: [{ text: `${constructedPrompt}\n\n${instruction}` }],
    },
    ...buildContentsFromMessages(messages),
  ];

  const body = {
    contents,
    generationConfig: { temperature: 0.7 },
  };

  const data = await postViaProxy(body, 60_000);
  const modelText = extractGeminiText(data);

  try {
    const parsed = JSON.parse(modelText);

    return {
      text: String(parsed?.text ?? ""),
      thought: String(parsed?.thought ?? ""),
      trust: clamp(Number(parsed?.trust ?? 0), 0, 100),
      stress: clamp(Number(parsed?.stress ?? 0), 0, 100),
      game_over: Boolean(parsed?.game_over ?? false),
      violation_reason: parsed?.violation_reason ? String(parsed.violation_reason) : "",
    };
  } catch {
    // Фолбэк, чтобы UI не падал
    return {
      text: modelText || "Пустой ответ модели.",
      thought: "",
      trust: 0,
      stress: 0,
      game_over: false,
      violation_reason: "",
    };
  }
}

/**
 * Анализ: комиссия, общий балл, резюме.
 */
export async function analyzeChatSession(
  messages: Message[],
  accentuation: string,
  reason: string
): Promise<AnalysisResult> {
  const transcript = messages
    .filter((m) => m.role === MessageRole.USER || m.role === MessageRole.MODEL)
    .map((m) => `${m.role === MessageRole.USER ? "ПЕДАГОГ" : "СТУДЕНТ"}: ${m.content}`)
    .join("\n");

  const instruction = `
[ЯЗЫКОВОЙ ПРОТОКОЛ: СТРОГО КИРИЛЛИЦА, РУССКИЙ ЯЗЫК. ВСЕ ПОЛЯ JSON — ТОЛЬКО НА РУССКОМ.]
Ты — комиссия по оценке педагогического диалога.
Акцентуация/профиль: ${accentuation}
Причина завершения: ${reason}

Ответь ТОЛЬКО СТРОГИМ JSON (без \`\`\`). Все строковые значения — исключительно на русском языке:
{
  "overall_score": число 0..100,
  "summary": "1-2 предложения итог на русском",
  "commission": [
    { "name": "Имя эксперта на русском", "role": "Роль на русском", "score": число 0..100, "verdict": "краткий вердикт на русском" }
  ]
}
Никакого текста вне JSON. Никакого английского.
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${instruction}\n\nСТЕНОГРАММА:\n${transcript}` }],
      },
    ],
    generationConfig: { temperature: 0.4 },
  };

  const data = await postViaProxy(body, 90_000);
  const modelText = extractGeminiText(data);

  try {
    const parsed = JSON.parse(modelText);

    const overall_score = clamp(Number(parsed?.overall_score ?? 0), 0, 100);
    const summary = String(parsed?.summary ?? "");

    const commissionRaw = Array.isArray(parsed?.commission) ? parsed.commission : [];
    const commission = commissionRaw.map((m: any) => ({
      name: String(m?.name ?? "Член комиссии"),
      role: String(m?.role ?? "Эксперт"),
      score: clamp(Number(m?.score ?? 0), 0, 100),
      verdict: String(m?.verdict ?? ""),
    }));

    return {
      ...(parsed as AnalysisResult),
      overall_score,
      summary,
      commission,
    };
  } catch {
    return {
      overall_score: 0,
      summary: "Не удалось распарсить JSON-ответ анализа.",
      commission: [{ name: "Система", role: "Ошибка", score: 0, verdict: modelText || "Пустой ответ." }],
    } as unknown as AnalysisResult;
  }
}

/**
 * Суфлёр (Zap): короткая подсказка без JSON.
 */
export async function generateGhostResponse(
  messages: Message[],
  contextSummary: string,
  teacher: any
): Promise<string> {
  const lastTurns = messages
    .filter((m) => m.role === MessageRole.USER || m.role === MessageRole.MODEL)
    .slice(-10)
    .map((m) => `${m.role === MessageRole.USER ? "ПЕДАГОГ" : "СТУДЕНТ"}: ${m.content}`)
    .join("\n");

  const instruction = `
Ты — суфлёр педагога. Дай ОДНУ короткую реплику/подсказку (1–2 предложения),
которая улучшит контакт, снизит стресс студента и повысит доверие.
Не упоминай, что ты ИИ. Без JSON. Только текст.

Контекст (кратко): ${contextSummary}
Педагог: ${teacher?.name ? String(teacher.name) : "не указан"}
`;

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${instruction}\n\nПОСЛЕДНИЕ РЕПЛИКИ:\n${lastTurns}` }],
      },
    ],
    generationConfig: { temperature: 0.8 },
  };

  const data = await postViaProxy(body, 45_000);
  const modelText = extractGeminiText(data);

  return (modelText || "").trim() || "Сформулируйте короткий вопрос и уточните, что именно сейчас сложнее всего.";
}
