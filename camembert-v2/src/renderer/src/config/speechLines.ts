/**
 * Pre-written Korean speech lines for the pet's speech bubble. Grouped by
 * trigger; a random line is chosen from the matching group. Kept as plain data
 * so lines are easy to tweak without touching UI or behaviour code.
 */

export type SpeechTrigger =
  | 'greeting'
  | 'click'
  | 'idleChat'
  | 'happy'
  | 'dance'
  | 'music'
  | 'sleep'
  | 'wakeup'
  | 'hungry'
  | 'sleepy'
  | 'bored'
  | 'fed'
  | 'played'
  | 'onHour'
  | 'lowBattery'
  | 'charging'
  | 'follow'
  | 'perch'
  | 'micDance'

export const SPEECH_LINES: Record<SpeechTrigger, string[]> = {
  greeting: ['안녕! 나 왔어 🧀', '반가워~', '오늘도 잘 부탁해!', '히히 나타났다'],
  click: ['왜왜?', '불렀어?', '헤헤 간지러워', '나 여기 있어!', '응! 뭐 도와줄까?'],
  idleChat: [
    '심심하다…',
    '오늘 뭐 하지?',
    '치즈 냄새 나는 것 같아',
    '흠흠~ ♪',
    '너 일 잘 하고 있어?',
    '나 여기서 구경 중이야'
  ],
  happy: ['헤헤 기분 좋아!', '오늘 완전 행복해', '좋아좋아~'],
  dance: ['같이 춤춰!', '몸이 근질근질~', '이 리듬 좋다!'],
  music: ['음악 최고야 ♪', '흥얼흥얼~', '이 노래 알아!'],
  sleep: ['조금만 잘게… 쿨쿨', '졸려서 눈이 감겨…', '5분만…'],
  wakeup: ['잘 잤다!', '으아 개운해~', '다시 힘내볼까'],
  hungry: ['배고파… 치즈 없어?', '꼬르륵… 뭐 먹을 거 없나', '간식 타임 아직이야?'],
  sleepy: ['하암… 졸려', '눈꺼풀이 무거워…', '슬슬 잘 시간인가'],
  bored: ['너무 심심해!', '나랑 놀아줘~', '뭔가 재밌는 거 없나'],
  fed: ['냠냠 고마워!', '와 맛있다 🧀', '배부르다~ 행복해'],
  played: ['재밌었어!', '헤헤 또 놀자', '기분 좋아졌어!'],
  onHour: ['벌써 {hour}시야!', '{hour}시 땡~', '시간 참 빠르다, {hour}시네'],
  lowBattery: ['배터리 얼마 안 남았어…', '충전 좀 해줘~', '나 곧 졸려질 것 같아 (배터리…)'],
  charging: ['충전 중! 든든해', '전기 냠냠~', '이제 안심이야'],
  follow: ['같이 가자!', '기다려~ 나도 나도', '어디 가?'],
  perch: ['여기 앉아있을게', '전망 좋다~', '잠깐 쉴래'],
  micDance: ['소리 들린다! 춤춰야지', '오 이 비트!', '음악이다 ♪ 신난다']
}

/** Pick a random line for a trigger, with optional {placeholders} substituted. */
export function pickLine(
  trigger: SpeechTrigger,
  vars: Record<string, string | number> = {}
): string {
  const pool = SPEECH_LINES[trigger]
  if (!pool || pool.length === 0) return ''
  let line = pool[Math.floor(Math.random() * pool.length)]
  for (const [key, value] of Object.entries(vars)) {
    line = line.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return line
}
