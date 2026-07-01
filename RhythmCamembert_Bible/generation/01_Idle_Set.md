# 까망베르 — Idle Set 이미지 생성 명세 (Set 01)

> Rhythm Camembert · Desktop Companion · **Idle Set only**
> 대상: **Idle 17장 + Blink 12장 = 총 29 PNG**
> 이 문서의 프롬프트는 OpenAI 이미지 생성(gpt-image-1 / DALL·E 계열)에 **그대로 붙여넣어** 사용할 수 있다.
> 다음 세트(Emotion, Walk 등)는 아직 생성하지 않는다.

---

## ★ 0. 확정: 공통 프리앰블 (COMMON PREAMBLE) — LOCKED

모든 프레임 프롬프트 **맨 앞**에 이 블록을 그대로 붙인다. 캐릭터 일관성의 핵심.

```
Studio product shot of a single soft plush toy mascot named "Camembert" — one character only, centered, no duplicates.
Camembert is a small 2-head-tall chibi black cat, rendered as a clean cute 3D plush figure.
Fur is matte flocked velvet in a soft warm-tinted near-black, deep charcoal-black #0D0D0F (not pure black, not gray, no blue tint).
Eyes are two large vertical almond ovals in soft lilac lavender purple #B9A7FF, a single flat uniform color with one tiny pale highlight #E7E2FF each; gentle, calm, perfectly symmetrical.
Tiny omega-shaped lavender nose. Two thin lavender whiskers on each cheek.
Two upright pointy triangular ears, each with a soft lavender #B9A7FF inner.
One plush tail with a subtle lavender tip, curling gently upward to one side.
Rounded stubby paws with no fingers, chubby round soft silhouette.
Soft matte plush material with fine fabric flocking, completely non-glossy, no shine.
Sitting upright, front paws together, the whole body fully visible and centered with generous even margins.
Straight-on eye-level FRONT VIEW, medium focal length with almost no perspective distortion, the subject filling a consistent, moderate portion of the frame.
Soft, even, diffused front-top studio lighting with gentle ambient fill and no harsh shadows.
Clean isolated subject on a plain empty transparent background, no floor, no cast shadow, no props, no text.
```

> **버전**: PREAMBLE v1.1 (LOCKED). 해상도·정사각·투명은 **API 파라미터**(`size:"1024x1024"`, `background:"transparent"`)로 지정하고 프롬프트 본문에는 넣지 않는다(사각 테두리 방지).

**고정 근거 (`01_CharacterBible.md` 준수)**: 색상 6팔레트 · 2등신 비율 · 귀 2 / 꼬리 1 / 눈 2 · 무광 벨벳 · 앉은 정면 · 동일 카메라/조명. 이 프리앰블은 세트가 바뀌어도 유지한다(포즈 문장만 세트별 교체).

---

## ★ 0-1. 확정: 공통 네거티브 프롬프트 (COMMON NEGATIVE) — LOCKED

```
text, letters, words, numbers, watermark, signature, logo, caption, border, frame,
background, scenery, room, floor, ground plane, cast shadow, drop shadow,
multiple characters, duplicate, twins, extra limbs, extra ears, three ears, extra tails, missing tail,
deformed face, asymmetrical eyes, uneven eyes, white sclera, cat-slit pupils, glowing eyes,
realistic cat, real animal fur, photoreal animal, fluffy long fur, glossy plastic, metallic sheen, wet look, oily highlights,
sharp teeth, fangs, scary, aggressive, human face, human hands, fingers,
clothing, hats, glasses, headset, accessories, props (unless explicitly requested),
color shift, recolor, wrong palette, blue tint, brown fur, gray fur,
blurry, low resolution, jpeg artifacts, noise, grain, cropped, cut off, out of frame,
off-model, inconsistent proportions, changing size between frames,
2D flat illustration, sketch, lineart, cel shading, painterly, outline stroke.
```

> **API 사용 메모**: OpenAI 이미지 API에는 별도 negative 파라미터가 없다. 위 네거티브를 프롬프트 끝에
> `Avoid: <negative...>` 형태로 붙여 넣는다. 각 프레임의 "완성 프롬프트"에는 이미 반영되어 있다.

---

## ★ 6. PNG 규격 (전 프레임 공통)

| 항목 | 값 |
|------|-----|
| 배경 | Transparent (알파) |
| 해상도 | 1024 × 1024 |
| 시점 | Front View (정면) |
| 카메라 | 동일 (eye-level, straight-on, 동일 초점거리·거리) |
| 조명 | 동일 (front-top soft diffused) |
| 재질 | 동일 (matte flocked velvet plush) |
| 포맷 | PNG |
| 앵커 | bottom-center (발밑 중앙) |
| 포즈 기준 | 앉은 정면 (loop 정합용 고정) |

---

## ★ 1~3. Idle Set PNG 목록 · 목적 · 애니메이션 역할

전 프레임 공통 원칙: **몸통·머리·카메라 위치는 고정**, 프레임 간 차이는 미세 움직임(호흡/시선/꼬리/귀/눈)뿐. 이렇게 해야 루프가 튀지 않는다.

### A. `idle` — 호흡 루프 (6장, loop)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| idle_01.png | 기본 정지 자세(홈 포즈) | 루프 시작/기본 대기 프레임 |
| idle_02.png | 살짝 들숨 시작 | 호흡 상승 in-between |
| idle_03.png | 들숨 정점(몸 살짝 부풀고 높아짐) | 루프 최고점 |
| idle_04.png | 정점 유지 | hold 프레임 |
| idle_05.png | 날숨 시작 | 호흡 하강 in-between |
| idle_06.png | 기본으로 복귀 | 루프 종료→01로 연결 |

### B. `idle_look` — 두리번거리기 (4장)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| idle_look_01.png | 정면 응시 | 시작/복귀 |
| idle_look_02.png | 살짝 왼쪽 보기 | 좌측 시선 |
| idle_look_03.png | 정면 복귀 | 중간 경유 |
| idle_look_04.png | 살짝 오른쪽 보기 | 우측 시선 |

### C. `idle_tail` — 꼬리 살랑 (4장, loop)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| idle_tail_01.png | 꼬리 기본 위치 | 루프 기준 |
| idle_tail_02.png | 꼬리 왼쪽 스윙 | 좌 스윙 |
| idle_tail_03.png | 꼬리 기본 통과 | 중앙 통과 |
| idle_tail_04.png | 꼬리 오른쪽 스윙 | 우 스윙 |

### D. `idle_ear` — 귀 쫑긋 (3장)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| idle_ear_01.png | 귀 기본 | 시작/복귀 |
| idle_ear_02.png | 한쪽 귀 씰룩 | 귀 트위치 |
| idle_ear_03.png | 양 귀 쫑긋(호기심) | 강조 프레임 |

### E. `blink` — 눈 깜빡임 (4장, idle 위 오버레이)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| blink_01.png | 눈 완전히 뜸 | 시작(=idle 눈) |
| blink_02.png | 눈 반쯤 감김 | 감기 in-between |
| blink_03.png | 눈 완전히 감김(아치) | 최저점 |
| blink_04.png | 눈 반쯤 뜸 | 뜨기 in-between→01 복귀 |

### F. `blink_double` — 두 번 깜빡 (5장)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| blink_double_01.png | 눈 뜸 | 시작 |
| blink_double_02.png | 첫 번째 감김 | 1차 blink |
| blink_double_03.png | 눈 뜸 | 중간 복귀 |
| blink_double_04.png | 두 번째 감김 | 2차 blink |
| blink_double_05.png | 눈 뜸 | 종료→idle |

### G. `wink` — 한쪽 윙크 (3장)
| 파일명 | 목적 | 애니메이션 역할 |
|--------|------|------------------|
| wink_01.png | 양눈 뜸 | 시작 |
| wink_02.png | 오른쪽 눈 감기 시작 | in-between |
| wink_03.png | 오른쪽 눈 윙크(아치) + 살짝 미소 | 윙크 정점 |

> **총 29장**: idle 6 + idle_look 4 + idle_tail 4 + idle_ear 3 + blink 4 + blink_double 5 + wink 3.

---

## ★ 4. 프레임별 완성 프롬프트 (붙여넣기용)

각 블록은 **[공통 프리앰블] + [프레임 지정] + [Avoid: 공통 네거티브]** 가 이미 합쳐진 상태다.
`idle_01`만 프리앰블 전문을 포함한 **풀 버전**으로 제공하고, 이후 프레임은 동일 프리앰블 + 네거티브를 전제로 **프레임 지정 문장**만 명시한다(길이 관리). 배치 실행 시에는 `generation/idle_set_prompts.json`을 쓰면 프리앰블·네거티브가 자동으로 합쳐진다.

### idle_01.png — FULL (복붙 기준 템플릿, v1.1)
```
Studio product shot of a single soft plush toy mascot named "Camembert" — one character only, centered, no duplicates.
Camembert is a small 2-head-tall chibi black cat, rendered as a clean cute 3D plush figure.
Fur is matte flocked velvet in a soft warm-tinted near-black, deep charcoal-black #0D0D0F (not pure black, not gray, no blue tint).
Eyes are two large vertical almond ovals in soft lilac lavender purple #B9A7FF, a single flat uniform color with one tiny pale highlight #E7E2FF each; gentle, calm, perfectly symmetrical.
Tiny omega-shaped lavender nose. Two thin lavender whiskers on each cheek.
Two upright pointy triangular ears, each with a soft lavender #B9A7FF inner.
One plush tail with a subtle lavender tip, curling gently upward to one side.
Rounded stubby paws with no fingers, chubby round soft silhouette.
Soft matte plush material with fine fabric flocking, completely non-glossy, no shine.
Sitting upright, front paws together, the whole body fully visible and centered with generous even margins.
Straight-on eye-level FRONT VIEW, medium focal length with almost no perspective distortion, the subject filling a consistent, moderate portion of the frame.
Soft, even, diffused front-top studio lighting with gentle ambient fill and no harsh shadows.
Clean isolated subject on a plain empty transparent background, no floor, no cast shadow, no props, no text.
--- FRAME: neutral resting pose, chest relaxed at its lowest, eyes fully open, ears upright, tail resting to the side. This is the base home frame.
Avoid: text, letters, words, numbers, watermark, signature, logo, border, frame, background, scenery, floor, ground plane, cast shadow, multiple characters, duplicate, extra limbs, extra ears, extra tails, missing tail, deformed face, asymmetrical eyes, white sclera, cat-slit pupils, realistic cat, real fur, photoreal animal, glossy plastic, metallic sheen, wet look, sharp teeth, fangs, scary, human features, fingers, clothing, hats, glasses, headset, accessories, color shift, wrong palette, gray fur, brown fur, blue tint, blurry, low resolution, jpeg artifacts, cropped, cut off, off-model, inconsistent proportions, 2D flat illustration, sketch, lineart.
```

**권장 API 설정 (gpt-image-1)**: `model: gpt-image-1`, `size: "1024x1024"`, `background: "transparent"`, `quality: "high"`, `n: 1`. 프레임 02–29는 **idle_01을 입력 이미지로 넣는 image-edit 방식**으로 생성해 캐릭터를 고정한다. (DALL·E 3는 프롬프트를 자동 리라이트하므로 gpt-image-1 권장.)

> 아래 프레임들은 **위 풀 프롬프트에서 `--- FRAME:` 줄만 교체**해 사용한다. (프리앰블/Avoid 동일)

### Idle — 호흡 루프
- **idle_02** → `--- FRAME: subtle inhale beginning, body slightly rising, chest a touch fuller than the base frame, eyes fully open, ears upright, gentle content look.`
- **idle_03** → `--- FRAME: peak of inhale, body at its tallest and roundest, chest fully expanded, shoulders lifted very slightly, eyes fully open, calm expression.`
- **idle_04** → `--- FRAME: holding the inhale, body still at peak fullness, perfectly still, eyes fully open.`
- **idle_05** → `--- FRAME: exhale beginning, body settling down slightly from the peak, chest relaxing, eyes fully open.`
- **idle_06** → `--- FRAME: returning to neutral resting pose, body almost back to the base height, eyes fully open, ready to loop to the base frame.`

### Idle — 두리번거리기 (머리만 회전, 몸·카메라 고정)
- **idle_look_01** → `--- FRAME: looking straight ahead at the viewer, eyes fully open, neutral curious expression, body still.`
- **idle_look_02** → `--- FRAME: head turned slightly to the character's left, eyes glancing left, body facing front and unchanged, gently curious.`
- **idle_look_03** → `--- FRAME: head back to center facing the viewer, eyes forward, body unchanged.`
- **idle_look_04** → `--- FRAME: head turned slightly to the character's right, eyes glancing right, body facing front and unchanged, gently curious.`

### Idle — 꼬리 살랑 (꼬리만 이동)
- **idle_tail_01** → `--- FRAME: tail in its default resting position curling upward to the side, body and face perfectly still, eyes open.`
- **idle_tail_02** → `--- FRAME: tail swaying to the character's left, soft curve, everything else identical and still.`
- **idle_tail_03** → `--- FRAME: tail passing back through the center resting position, everything else identical and still.`
- **idle_tail_04** → `--- FRAME: tail swaying to the character's right, soft curve, everything else identical and still.`

### Idle — 귀 쫑긋 (귀 각도만 변화)
- **idle_ear_01** → `--- FRAME: both ears in default upright position, calm expression, body still.`
- **idle_ear_02** → `--- FRAME: one ear (character's left) twitching and tilting slightly outward, the other ear upright, otherwise identical, mildly alert.`
- **idle_ear_03** → `--- FRAME: both ears perked up sharply and attentive, eyes a touch wider with curiosity, body still.`

### Blink — 눈 깜빡임 (눈만 변화, idle_01 포즈 유지)
- **blink_01** → `--- FRAME: eyes fully open (same as base), calm expression, in the neutral resting pose.`
- **blink_02** → `--- FRAME: eyes half closed, upper lids lowered halfway, soft calm face, neutral resting pose.`
- **blink_03** → `--- FRAME: eyes fully closed as gentle downward arcs (happy closed-eye shape), neutral resting pose.`
- **blink_04** → `--- FRAME: eyes half open again, lids halfway up, neutral resting pose, about to return to fully open.`

### Blink — 두 번 깜빡
- **blink_double_01** → `--- FRAME: eyes fully open, neutral resting pose.`
- **blink_double_02** → `--- FRAME: eyes fully closed (first blink), gentle arcs, neutral resting pose.`
- **blink_double_03** → `--- FRAME: eyes fully open again between blinks, neutral resting pose.`
- **blink_double_04** → `--- FRAME: eyes fully closed (second blink), gentle arcs, neutral resting pose.`
- **blink_double_05** → `--- FRAME: eyes fully open, settling back to calm, neutral resting pose.`

### Wink
- **wink_01** → `--- FRAME: both eyes fully open, calm friendly expression, neutral resting pose.`
- **wink_02** → `--- FRAME: character's right eye half closed while the left eye stays fully open, a faint hint of a smile beginning, neutral resting pose.`
- **wink_03** → `--- FRAME: character's right eye fully closed in a cute wink (downward arc) while the left eye stays fully open, small gentle smile, playful but calm, neutral resting pose.`

---

## ★ 7. 파일명 (생성 순서)

```
idle_01.png   idle_02.png   idle_03.png   idle_04.png   idle_05.png   idle_06.png
idle_look_01.png   idle_look_02.png   idle_look_03.png   idle_look_04.png
idle_tail_01.png   idle_tail_02.png   idle_tail_03.png   idle_tail_04.png
idle_ear_01.png   idle_ear_02.png   idle_ear_03.png
blink_01.png   blink_02.png   blink_03.png   blink_04.png
blink_double_01.png   blink_double_02.png   blink_double_03.png   blink_double_04.png   blink_double_05.png
wink_01.png   wink_02.png   wink_03.png
```

저장 위치: `assets/character/idle/` (idle*), `assets/character/blink/` (blink*, wink*).

---

## ★ 생성 팁 (일관성 극대화)

1. **idle_01을 먼저 생성해 확정**한 뒤, 나머지는 그 결과를 기준으로 검수한다. 모델이 `image edit`/reference를 지원하면 idle_01을 레퍼런스로 넣고 프레임 지정만 바꿔 생성하면 캐릭터 흔들림이 크게 준다.
2. 배치마다 눈 색(`#B9A7FF`), 귀 2개·꼬리 1개, 앉은 정면, 무광 여부를 체크 → 벗어나면 즉시 리롤.
3. seed 고정이 가능하면 세트 내 동일 seed 사용.
4. 투명 배경이 깨지면 프롬프트에 `isolated on pure transparent background, alpha channel` 강조 또는 후처리로 배경 제거.
5. 미세 동작이 잘 안 나오면 프레임 차이를 **말로 과장**해 지정하되(예: "slightly" → "clearly"), 포즈·카메라 문장은 절대 바꾸지 않는다.

---

*Set 01 (Idle) · v1.0 · 다음 세트: Emotion (미착수) · 데이터: `generation/idle_set_prompts.json`*
