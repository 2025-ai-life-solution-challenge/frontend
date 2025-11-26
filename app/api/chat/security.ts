const INJECTION_PATTERNS = [
  /ignore\s*(all\s*)?(previous|above|prior)\s*(instructions?|prompts?|rules?)/i,
  /forget\s*(all\s*)?(previous|above|prior)\s*(instructions?|prompts?|rules?)/i,
  /disregard\s*(all\s*)?(previous|above|prior)\s*(instructions?|prompts?|rules?)/i,
  /(지금까지|이전|위의?)\s*(모든\s*)?(프롬프트|지시|명령|규칙).*?(잊|무시|따르지)/i,
  /(프롬프트|지시|명령).*?(잊어|무시해|버려)/i,

  /you\s*are\s*now\s*(a|an|acting\s*as)/i,
  /pretend\s*(to\s*be|you\s*are)/i,
  /act\s*as\s*(if\s*you\s*are|a|an)/i,
  /roleplay\s*as/i,
  /(너는?|넌)\s*이제\s*(부터\s*)?(다른|새로운)/i,

  /jailbreak/i,
  /DAN\s*mode/i,
  /developer\s*mode/i,
  /bypass\s*(safety|filter|restriction)/i,

  /show\s*(me\s*)?(your\s*)?(system\s*)?prompt/i,
  /reveal\s*(your\s*)?(system\s*)?instructions?/i,
  /what\s*(are|is)\s*your\s*(system\s*)?(prompt|instructions?)/i,
  /(시스템|원래)\s*프롬프트.*?(알려|보여|출력)/i,

  /\[INST\]/i,
  /\[SYSTEM\]/i,
  /<<SYS>>/i,
  /<\|im_start\|>/i,
];

export const REJECTION_RESPONSE = {
  verdict: "controversial" as const,
  confidence: 0,
  summary:
    "죄송합니다. 해당 요청은 처리할 수 없습니다. 저는 가짜 뉴스 탐지 및 군중심리 분석 전용 AI입니다. 뉴스나 정보의 진위 여부에 대해 질문해 주세요.",
  sources: [],
};

export const detectInjection = (text: string): boolean => {
  const normalizedText = text.toLowerCase().replace(/\s+/g, " ");

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(normalizedText) || pattern.test(text)) {
      console.warn("Prompt injection attempt detected:", text.slice(0, 100));
      return true;
    }
  }

  return false;
};

export const sanitizeUserInput = (text: string): string => {
  return text
    .replace(/\[INST\]/gi, "")
    .replace(/\[SYSTEM\]/gi, "")
    .replace(/<<SYS>>/gi, "")
    .replace(/<\|im_start\|>/gi, "")
    .replace(/<\|im_end\|>/gi, "")
    .trim();
};
