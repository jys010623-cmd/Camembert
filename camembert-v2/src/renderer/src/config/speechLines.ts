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
  // 시간대별 인사
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'night'
  // 잡담 확장
  | 'encourage'
  | 'curious'
  | 'affection'
  | 'weatherGuess'

export const SPEECH_LINES: Record<SpeechTrigger, string[]> = {
  greeting: [
    '안녕! 나 왔어 🧀',
    '반가워~',
    '오늘도 잘 부탁해!',
    '히히 나타났다',
    '짜잔! 까망베르 등장 🧀',
    '보고 싶었어~',
    '나 여기 있지롱',
    '오늘 하루도 같이 보내자!'
  ],
  click: [
    '왜왜?',
    '불렀어?',
    '헤헤 간지러워',
    '나 여기 있어!',
    '응! 뭐 도와줄까?',
    '콕 찌르지 마~ ㅎㅎ',
    '왜 불렀어? 궁금하네',
    '나랑 놀고 싶구나?',
    '앗 깜짝이야!',
    '나 여기 잘 있어 걱정 마',
    '한 번 더 눌러봐 히히'
  ],
  idleChat: [
    '심심하다…',
    '오늘 뭐 하지?',
    '치즈 냄새 나는 것 같아',
    '흠흠~ ♪',
    '너 일 잘 하고 있어?',
    '나 여기서 구경 중이야',
    '오늘 날씨 어때?',
    '커피 한 잔 어때~',
    '가끔은 멍 때리는 것도 좋아',
    '창밖 보는 거 좋아하는구나',
    '나는 치즈 생각 중… 🧀',
    '조용하니까 좋다~',
    '너 오늘 잘 지냈어?',
    '음… 뭔가 재밌는 일 없나',
    '나 사실 구경하는 거 좋아해'
  ],
  happy: [
    '헤헤 기분 좋아!',
    '오늘 완전 행복해',
    '좋아좋아~',
    '이런 기분 최고야!',
    '너랑 있으면 즐거워',
    '오늘 운수 대통이야 ✨',
    '히히 웃음이 절로 나와'
  ],
  dance: [
    '같이 춤춰!',
    '몸이 근질근질~',
    '이 리듬 좋다!',
    '스텝 밟아볼까~',
    '빙글빙글 돌자!',
    '나 춤 좀 추는데? 헤헤'
  ],
  music: [
    '음악 최고야 ♪',
    '흥얼흥얼~',
    '이 노래 알아!',
    '라라라 ♬',
    '멜로디가 좋다~',
    '이 부분 내가 제일 좋아해 ♪'
  ],
  sleep: [
    '조금만 잘게… 쿨쿨',
    '졸려서 눈이 감겨…',
    '5분만…',
    '스르르… 굿나잇',
    '꿈에서 치즈 먹을 거야…',
    '이불 속이 최고야…'
  ],
  wakeup: [
    '잘 잤다!',
    '으아 개운해~',
    '다시 힘내볼까',
    '푹 자고 나니 상쾌해!',
    '좋은 꿈 꿨어 헤헤',
    '자 이제 뭐 하지?'
  ],
  hungry: [
    '배고파… 치즈 없어?',
    '꼬르륵… 뭐 먹을 거 없나',
    '간식 타임 아직이야?',
    '치즈… 치즈가 먹고 싶어 🧀',
    '배에서 소리 나 히잉',
    '한 입만 주라~'
  ],
  sleepy: [
    '하암… 졸려',
    '눈꺼풀이 무거워…',
    '슬슬 잘 시간인가',
    '꾸벅꾸벅… zzz',
    '스르르 잠이 와…',
    '조금만 쉬어도 될까?'
  ],
  bored: [
    '너무 심심해!',
    '나랑 놀아줘~',
    '뭔가 재밌는 거 없나',
    '심심해서 데굴데굴~',
    '놀거리 좀 없을까?',
    '나 여기 심심한 치즈 있어요…'
  ],
  fed: [
    '냠냠 고마워!',
    '와 맛있다 🧀',
    '배부르다~ 행복해',
    '최고의 간식이야!',
    '역시 넌 최고야',
    '든든해졌어 헤헤'
  ],
  played: [
    '재밌었어!',
    '헤헤 또 놀자',
    '기분 좋아졌어!',
    '너랑 노는 게 제일 좋아',
    '아 신난다~',
    '다음에 또 놀아줘!'
  ],
  onHour: [
    '벌써 {hour}시야!',
    '{hour}시 땡~',
    '시간 참 빠르다, {hour}시네',
    '{hour}시가 됐어, 잠깐 쉬어~',
    '땡땡~ {hour}시 알림이야',
    '{hour}시! 물 한 잔 어때?'
  ],
  lowBattery: [
    '배터리 얼마 안 남았어…',
    '충전 좀 해줘~',
    '나 곧 졸려질 것 같아 (배터리…)',
    '기운이 슬슬 빠져… 충전 필요해',
    '배터리 힘내라 힘내라…'
  ],
  charging: [
    '충전 중! 든든해',
    '전기 냠냠~',
    '이제 안심이야',
    '기운이 차오른다 ⚡',
    '충전되니까 좋다~'
  ],
  follow: [
    '같이 가자!',
    '기다려~ 나도 나도',
    '어디 가?',
    '졸졸 따라갈게!',
    '어디든 같이 갈래',
    '나 두고 가지 마~'
  ],
  perch: [
    '여기 앉아있을게',
    '전망 좋다~',
    '잠깐 쉴래',
    '여기가 내 명당이야',
    '구석이 아늑하네',
    '여기서 너 지켜볼게'
  ],
  micDance: [
    '소리 들린다! 춤춰야지',
    '오 이 비트!',
    '음악이다 ♪ 신난다',
    '들썩들썩~ 못 참겠어',
    '리듬 타자 타자!',
    '이 소리 좋은데? ♬'
  ],

  // ── 시간대별 인사 ──────────────────────────────
  morning: [
    '좋은 아침! 잘 잤어? ☀️',
    '아침이다~ 오늘도 파이팅!',
    '굿모닝! 물 한 잔 마셔~',
    '햇살 좋다, 상쾌한 아침이야',
    '아침 먹었어? 나는 치즈 먹었지 🧀'
  ],
  afternoon: [
    '점심은 먹었어?',
    '오후도 힘내자~',
    '나른한 오후네… 같이 기지개 켤까',
    '오후엔 달달한 게 땡겨~',
    '조금만 더 힘내! 잘하고 있어'
  ],
  evening: [
    '저녁이네~ 오늘 하루 어땠어?',
    '해가 지고 있어, 예쁘다',
    '저녁 먹을 시간이야!',
    '하루 마무리 잘 하자~',
    '오늘도 고생 많았어'
  ],
  night: [
    '밤이 깊었네, 너무 무리하지 마',
    '슬슬 잘 준비 할까?',
    '별이 반짝반짝~ 🌙',
    '늦었어, 눈도 좀 쉬어줘',
    '오늘도 수고했어, 푹 자~'
  ],

  // ── 잡담 확장 ─────────────────────────────────
  encourage: [
    '넌 잘하고 있어!',
    '조금만 더 힘내, 응원할게 💪',
    '천천히 해도 괜찮아',
    '너라면 할 수 있어!',
    '쉬엄쉬엄~ 무리하지 마',
    '잘 안 되면 잠깐 쉬어도 돼',
    '오늘도 최선을 다하는 네가 멋져'
  ],
  curious: [
    '지금 뭐 하고 있어?',
    '오늘 제일 재밌던 일이 뭐야?',
    '좋아하는 음식이 뭐야? 나는 치즈!',
    '주말엔 뭐 할 거야?',
    '요즘 관심 있는 거 있어?',
    '나 궁금한 거 많아 헤헤',
    '너는 아침형이야 저녁형이야?'
  ],
  affection: [
    '너랑 있어서 좋아 💛',
    '항상 옆에 있어줄게',
    '헤헤 네가 최고야',
    '오늘도 함께라서 행복해',
    '너 볼 때마다 기분 좋아져'
  ],
  weatherGuess: [
    '오늘 날씨 맑을 것 같아 ☀️',
    '왠지 비 올 것 같은 느낌?',
    '바깥 공기 어때? 나가고 싶다~',
    '이런 날엔 산책 좋겠다',
    '창문 열어서 환기 한번 어때?'
  ]
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

/** Pick a random line from several triggers pooled together. */
export function pickFrom(
  triggers: SpeechTrigger[],
  vars: Record<string, string | number> = {}
): string {
  const pool = triggers.flatMap((t) => SPEECH_LINES[t] ?? [])
  if (pool.length === 0) return ''
  let line = pool[Math.floor(Math.random() * pool.length)]
  for (const [key, value] of Object.entries(vars)) {
    line = line.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
  }
  return line
}

/** Trigger name for the current time of day (used for greetings + chatter). */
export function timeOfDayTrigger(date: Date = new Date()): SpeechTrigger {
  const h = date.getHours()
  if (h >= 5 && h < 11) return 'morning'
  if (h >= 11 && h < 17) return 'afternoon'
  if (h >= 17 && h < 22) return 'evening'
  return 'night'
}

/** 켤 때 등장 인사말들 (시간대 인사 앞에 붙는다). */
const LAUNCH_OPENERS = [
  '히히 드디어 켜졌다!',
  '짜잔, 나 나왔어! 🧀',
  '안녕! 나 왔어~',
  '반가워, 나 등장!',
  '히히 나타났다'
]

/** 켤 때 인사 = 등장 인사말 + 현재 시간대(아침/오후/저녁/밤) 인사. */
export function pickGreeting(date: Date = new Date()): string {
  const opener = LAUNCH_OPENERS[Math.floor(Math.random() * LAUNCH_OPENERS.length)]
  return `${opener} ${pickLine(timeOfDayTrigger(date))}`
}

/** 밤(취침)용 자러 가는 대사. */
const BEDTIME_LINES = [
  '이제 자러 갈래… 굿나잇 🌙',
  '오늘도 수고했어, 잘 자~',
  '이불 속이 최고야… 스르르',
  '잘 준비 하자, 나도 잘게',
  '꿈에서 치즈 먹을 거야… zzz',
  '눈 감고 푹 잘래, 잘 자!'
]

/** 낮(낮잠)용 잠깐 조는 대사. */
const NAP_LINES = [
  '잠깐 낮잠 잘래~',
  '5분만 눈 붙일게',
  '낮잠 타임! 조금만…',
  '졸려서 잠깐 쉴래',
  '냠… 낮잠은 꿀이지',
  '잠깐 조는 거야, 금방 일어날게'
]

/** 수면 대사: 밤이면 취침, 낮이면 낮잠 느낌으로 구분한다. */
export function pickSleepLine(date: Date = new Date()): string {
  const pool = timeOfDayTrigger(date) === 'night' ? BEDTIME_LINES : NAP_LINES
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 식사 시간대별 배고픔 대사. */
const BREAKFAST_HUNGRY = [
  '아침 먹을 시간이야! 🧀',
  '배고파~ 아침 뭐 먹지?',
  '아침은 든든하게 먹자',
  '굿모닝 겸 아침 챙겨~ 나도 치즈!'
]
const LUNCH_HUNGRY = [
  '점심 시간이다! 배고파',
  '점심 뭐 먹을 거야?',
  '꼬르륵~ 점심 아직이야?',
  '점심 맛있는 거 먹자!'
]
const DINNER_HUNGRY = [
  '저녁 먹을 시간이야~',
  '오늘 저녁 뭐야? 궁금해',
  '배고파… 저녁 챙겨줘',
  '하루 마무리 저녁은 맛있게!'
]
const SNACK_HUNGRY = [
  '출출한데 간식 어때?',
  '야식 땡긴다… 🧀',
  '뭔가 입이 심심해~',
  '치즈 한 조각이면 딱인데',
  '살짝 출출하네, 주전부리 없나?'
]

/** 배고픔 대사: 아침/점심/저녁 식사 시간과 그 외(간식·야식)를 구분한다. */
export function pickHungryLine(date: Date = new Date()): string {
  const h = date.getHours()
  let pool: string[]
  if (h >= 5 && h < 11) pool = BREAKFAST_HUNGRY
  else if (h >= 11 && h < 15) pool = LUNCH_HUNGRY
  else if (h >= 17 && h < 21) pool = DINNER_HUNGRY
  else pool = SNACK_HUNGRY // 오후 간식대(15~17시) + 밤·야식(21~5시)
  return pool[Math.floor(Math.random() * pool.length)]
}

/** 밤에 깼을 때(다시 졸림) 대사. */
const NIGHT_WAKE = [
  '으음… 깼어 zzz',
  '잠깐 깼다, 다시 졸려…',
  '밤엔 푹 자야 하는데~',
  '눈 비비며… 아직 밤이네'
]
/** 낮잠에서 깼을 때(개운함) 대사. */
const DAY_WAKE = [
  '낮잠 개운해!',
  '잘 잤다~ 다시 힘내볼까',
  '으아 개운해, 낮잠 최고 🧀',
  '좋은 꿈 꿨어 헤헤'
]

/** 기상 대사: 밤엔 다시 졸린 느낌, 낮엔 개운한 낮잠 느낌으로 구분한다. */
export function pickWakeLine(date: Date = new Date()): string {
  const pool = timeOfDayTrigger(date) === 'night' ? NIGHT_WAKE : DAY_WAKE
  return pool[Math.floor(Math.random() * pool.length)]
}

/**
 * Idle small talk drawn from a wide rotation so the pet feels chatty and varied:
 * generic musings, curious questions, encouragement, affection, weather guesses,
 * and the occasional time-of-day remark.
 */
export function pickIdleChatter(date: Date = new Date()): string {
  const pool: SpeechTrigger[] = ['idleChat', 'curious', 'encourage', 'affection', 'weatherGuess', timeOfDayTrigger(date)]
  const trigger = pool[Math.floor(Math.random() * pool.length)]
  return pickTimedLine(trigger, date)
}


type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night'

/**
 * 시간대별로 갈리는 대사 모음. 여기 없는 트리거는 기존 SPEECH_LINES(단일 풀)를 그대로 쓴다.
 */
const TIMED_LINES: Partial<Record<SpeechTrigger, Record<TimeSlot, string[]>>> = {
  click: {
    morning: ['좋은 아침! 왜 불렀어~', '아침부터 반가워 ☀️', '굿모닝! 나 여기 있어'],
    afternoon: ['왜왜? 심심했어?', '응! 뭐 도와줄까?', '헤헤 간지러워'],
    evening: ['저녁이야, 왜 불렀어~', '오늘 하루 어땠어?', '헤헤 불렀구나'],
    night: ['쉿… 밤이야, 살살~', '졸린데 왜 불러~ ㅎㅎ', '늦었는데 안 자?']
  },
  happy: {
    morning: ['아침부터 기분 최고야!', '상쾌해서 신나~', '오늘 좋은 일 있을 것 같아 ✨'],
    afternoon: ['헤헤 기분 좋아!', '오후가 즐거워~', '좋아좋아~'],
    evening: ['오늘 하루 뿌듯해!', '저녁이라 나른하니 좋아', '기분 좋게 마무리 중'],
    night: ['밤이라 마음이 포근해', '조용해서 행복해~', '하루 잘 보냈다 헤헤']
  },
  dance: {
    morning: ['아침 스트레칭 겸 춤!', '잠 깨는 댄스~', '아침부터 신난다!'],
    afternoon: ['같이 춤춰!', '이 리듬 좋다!', '몸이 근질근질~'],
    evening: ['저녁엔 흥이 오르지~', '하루 마무리 댄스!', '빙글빙글 돌자!'],
    night: ['조용히 살랑살랑~', '밤이라 살짝만 춤춰', '늦었지만 흥은 못 참아 ♪']
  },
  music: {
    morning: ['아침 음악 상쾌해 ♪', '잠 깨는 노래~', '라라라 좋은 아침 ♬'],
    afternoon: ['음악 최고야 ♪', '흥얼흥얼~', '이 노래 알아!'],
    evening: ['저녁 감성 음악 ♪', '노을이랑 잘 어울려~', '멜로디가 좋다'],
    night: ['밤엔 잔잔한 게 좋아 ♪', '조용한 밤 음악~', '자장가 같은 멜로디 ♬']
  },
  sleepy: {
    morning: ['아침인데 벌써 졸려…', '잠이 덜 깼어 하암', '조금만 더 잘까…'],
    afternoon: ['식곤증 오나 봐 하암', '나른한 오후… 졸려', '잠깐 낮잠 땡긴다'],
    evening: ['저녁 되니 노곤해…', '슬슬 눈이 감겨', '하루 피곤했나 봐'],
    night: ['이제 잘 시간인가 봐', '눈꺼풀이 무거워… zzz', '슬슬 잘 준비 하자']
  },
  bored: {
    morning: ['아침부터 심심해~', '오늘 뭐 하고 놀지?', '나랑 아침 산책 어때'],
    afternoon: ['너무 심심해!', '나랑 놀아줘~', '뭔가 재밌는 거 없나'],
    evening: ['저녁엔 뭐 하고 놀까?', '심심한데 같이 쉴래?', '오늘 재밌는 일 있었어?'],
    night: ['밤이라 조용하고 심심해', '늦었지만 심심한 건 심심한 거…', '자기 전에 조금만 놀까']
  },
  fed: {
    morning: ['아침 잘 먹었다 🧀', '든든한 아침 고마워!', '아침 먹으니 힘난다'],
    afternoon: ['점심 잘 먹었어~', '냠냠 배부르다!', '맛있는 점심 고마워 🧀'],
    evening: ['저녁 잘 먹었다~', '배부르고 행복해', '오늘 저녁 최고였어!'],
    night: ['야식이라니… 최고야 🧀', '냠냠 든든한 밤', '잘 먹었다, 이제 푹 자자']
  },
  played: {
    morning: ['아침부터 신났어!', '재밌었어~ 오늘도 파이팅!', '헤헤 기분 좋게 시작!'],
    afternoon: ['재밌었어!', '헤헤 또 놀자', '아 신난다~'],
    evening: ['저녁에 노니 즐거워~', '오늘도 고마웠어 헤헤', '기분 좋게 하루 마무리!'],
    night: ['재밌었어! 이제 슬슬 쉬자', '늦었으니 오늘은 여기까지~', '헤헤 잘 놀았다, 잘 자!']
  },
  encourage: {
    morning: ['오늘도 좋은 하루 만들자!', '아침부터 응원할게 💪', '상쾌하게 시작하자!'],
    afternoon: ['조금만 더 힘내, 잘하고 있어', '오후도 파이팅!', '천천히 해도 괜찮아'],
    evening: ['오늘 하루도 수고 많았어', '거의 다 왔어, 힘내!', '마무리까지 잘하고 있어'],
    night: ['이제 그만 쉬어도 돼', '너무 늦었어, 무리하지 마', '오늘 충분히 잘했어, 푹 쉬자']
  },
  curious: {
    morning: ['오늘 계획은 뭐야?', '아침 먹었어? 뭐 먹었어?', '오늘 기대되는 일 있어?'],
    afternoon: ['점심 맛있었어?', '지금 뭐 하고 있어?', '오후엔 뭐 할 거야?'],
    evening: ['오늘 하루 어땠어?', '저녁 뭐 먹을 거야?', '오늘 제일 좋았던 일은?'],
    night: ['오늘 하루 잘 보냈어?', '내일은 뭐 할 거야?', '잠은 잘 잘 것 같아?']
  },
  weatherGuess: {
    morning: ['오늘 날씨 맑을까? ☀️', '아침 공기 어때?', '창문 열어 환기하자~'],
    afternoon: ['지금 밖에 따뜻해?', '산책하기 좋은 날씨일까', '햇살 좋으면 좋겠다'],
    evening: ['저녁 노을 예쁠 것 같아', '바람 선선해졌으려나', '저녁 공기 상쾌하겠다'],
    night: ['밤공기 쌀쌀할까?', '별 보이는 밤이면 좋겠다 🌙', '내일 날씨 맑았으면~']
  }
}

/** 트리거에 시간대 변형이 있으면 현재 시간대 대사를, 없으면 기존 풀을 고른다. */
export function pickTimedLine(trigger: SpeechTrigger, date: Date = new Date()): string {
  const timed = TIMED_LINES[trigger]
  if (timed) {
    const pool = timed[timeOfDayTrigger(date) as TimeSlot]
    if (pool && pool.length > 0) return pool[Math.floor(Math.random() * pool.length)]
  }
  return pickLine(trigger)
}
