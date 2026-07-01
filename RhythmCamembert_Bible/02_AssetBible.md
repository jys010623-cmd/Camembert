# 리듬베르 Desktop Companion Asset Bible

> 까망베르 Desktop Pet(Electron / Always-On-Top / 투명창 / 드래그) 제작을 위한 **전체 에셋 정의 문서 (v1.0)**
> 이 문서의 목적은 **누락 없이** 모든 이미지 에셋 · 이벤트 · 애니메이션 · 소품 · 액세서리 · 폴더 구조를 정의하여,
> 이후 Codex(OpenAI)로 이미지를 자동 생성할 때 **참조 명세서**로 쓰이는 것이다.
>
> 반드시 `01_CharacterBible.md`의 고정 규칙(🔒)을 준수한다.

---

## 목차
1. 에셋 규격 공통 규칙
2. 에셋 카테고리 & 개수 (전체 스프라이트 목록)
3. Desktop Pet 이벤트 정의
4. 이벤트 → 애니메이션 시퀀스 매핑
5. 소품(Props) 목록
6. 액세서리(Accessory) 시스템
7. 이펙트(Effects) 목록
8. UI 에셋
9. 폴더 구조
10. 파일 네이밍 규칙
11. 에셋 물량 총계

---

## 1. 에셋 규격 공통 규칙

| 항목 | 값 | 비고 |
|------|-----|------|
| 기본 캔버스 | 512 × 512 px | 표준 프레임. 필요시 768로 스케일업 |
| 세이프 존 | 중앙 400×400 | 액세서리/이펙트가 잘리지 않게 |
| 포맷 | PNG (알파 투명) | Desktop Pet 투명창용 필수 |
| 배경 | 완전 투명 (`rgba(0,0,0,0)`) | 흰 배경 금지 |
| 색 공간 | sRGB | |
| 앵커(기준점) | 발밑 중앙 (bottom-center) | 바닥 정렬 일관성 |
| 프레임레이트 | 8–12 fps (기본 10) | 루프 애니메이션 기준 |
| 그림자 | 별도 레이어 `shadow.png` 1장 | 캐릭터와 분리해 옵션화 |
| 해상도 배수 | @1x, @2x 2종 | 고DPI 대응 |

> **스프라이트 방식**: 각 동작은 개별 프레임 PNG 시퀀스(`walk_01.png`, `walk_02.png`…)로 제작하고,
> 빌드 시 스프라이트시트(`walk.png` + `walk.json`)로 패킹한다. 본 문서는 **프레임 단위**로 개수를 센다.

---

## 2. 에셋 카테고리 & 개수 (전체 스프라이트 목록)

각 카테고리는 `01_CharacterBible.md`의 표정/동작 규칙을 따른다. 아래 개수는 **최소 권장치**이며 루프가 자연스럽도록 설계했다.

### 2.1 Idle (평상시)
| ID | 설명 | 프레임 |
|----|------|--------|
| idle | 앉아서 숨쉬기(호흡 loop) | idle_01 ~ idle_06 (6) |
| idle_look_around | 두리번거리기 | idle_look_01 ~ 04 (4) |
| idle_tail | 꼬리 살랑 | idle_tail_01 ~ 04 (4) |
| idle_ear | 귀 쫑긋 | idle_ear_01 ~ 03 (3) |
**소계: 17**

### 2.2 Blink (눈 깜빡임 — idle 위에 오버레이)
| ID | 설명 | 프레임 |
|----|------|--------|
| blink | 눈 감았다 뜨기 | blink_01 ~ blink_04 (4) |
| blink_double | 두 번 깜빡 | blink_double_01 ~ 05 (5) |
| wink | 한쪽 윙크 | wink_01 ~ 03 (3) |
**소계: 12**

### 2.3 Emotion (표정 — 정지 키프레임 + 짧은 인트로)
CharacterBible 12장 표정 규칙 준수. 각 표정 = 대표 1장 + 전환 2~3프레임.
| ID | 프레임 |
|----|--------|
| emo_neutral | 1 |
| emo_happy | happy_01 ~ 03 (3) |
| emo_excited | excited_01 ~ 04 (4) |
| emo_sad | sad_01 ~ 03 (3) |
| emo_surprised | surprised_01 ~ 03 (3) |
| emo_angry | angry_01 ~ 03 (3) |
| emo_sleepy | sleepy_01 ~ 03 (3) |
| emo_sleeping | sleeping_01 ~ 04 (4, zZ loop) |
| emo_love | love_01 ~ 03 (하트눈, 3) |
| emo_curious | curious_01 ~ 03 (물음표, 3) |
| emo_cry | cry_01 ~ 04 (눈물, 4) |
| emo_shy | shy_01 ~ 03 (볼터치, 3) |
**소계: 37**

### 2.4 Walk (걷기 — 드래그 이동/랜덤 산책)
| ID | 설명 | 프레임 |
|----|------|--------|
| walk_right | 오른쪽 걷기 loop | walk_r_01 ~ 08 (8) |
| walk_left | 왼쪽 (미러 or 별도) | walk_l_01 ~ 08 (8) |
| walk_start | 걷기 시작 | walk_start_01 ~ 02 (2) |
| walk_stop | 멈춤 | walk_stop_01 ~ 02 (2) |
**소계: 20** (좌우 미러 처리 시 12)

### 2.5 Run (뛰기 — 커서 추격/놀람 도주)
| ID | 프레임 |
|----|--------|
| run_right | run_r_01 ~ 06 (6) |
| run_left | run_l_01 ~ 06 (6) |
**소계: 12** (미러 시 6)

### 2.6 Jump (점프)
| ID | 프레임 |
|----|--------|
| jump | jump_01 ~ 06 (준비-도약-공중-착지, 6) |
| jump_happy | 신난 점프 | jump_happy_01 ~ 06 (6) |
**소계: 12**

### 2.7 Sit (앉기/일어서기 전환)
| ID | 프레임 |
|----|--------|
| sit_down | stand→sit | sit_down_01 ~ 04 (4) |
| stand_up | sit→stand | stand_up_01 ~ 04 (4) |
| sit_idle | 앉은 대기 loop | sit_idle_01 ~ 04 (4) |
**소계: 12**

### 2.8 Music (음악 — 대표 상호작용)
| ID | 설명 | 프레임 |
|----|------|--------|
| headphone_on | 헤드셋 착용 | hp_on_01 ~ 04 (4) |
| headphone_off | 헤드셋 해제 | hp_off_01 ~ 04 (4) |
| music_idle | 헤드셋 쓰고 리듬타기 loop | music_idle_01 ~ 06 (6) |
| music_nod | 고개 까딱 | music_nod_01 ~ 04 (4) |
| music_sway | 몸 흔들기 | music_sway_01 ~ 06 (6) |
**소계: 24**

### 2.9 Dance (춤)
| ID | 프레임 |
|----|--------|
| dance_basic | dance_01 ~ 08 (8) |
| dance_spin | 회전 | dance_spin_01 ~ 06 (6) |
| dance_star | 별 들고 춤(소품) | dance_star_01 ~ 06 (6) |
**소계: 20**

### 2.10 Coding (코딩)
| ID | 설명 | 프레임 |
|----|------|--------|
| coding_open | 노트북 꺼내기 | coding_open_01 ~ 03 (3) |
| coding_type | 타이핑 loop | coding_type_01 ~ 06 (6) |
| coding_think | 생각(턱 괴기) | coding_think_01 ~ 04 (4) |
| coding_close | 노트북 닫기 | coding_close_01 ~ 03 (3) |
**소계: 16**

### 2.11 Sleep (수면)
| ID | 설명 | 프레임 |
|----|------|--------|
| yawn | 하품 | yawn_01 ~ 04 (4) |
| doze | 꾸벅꾸벅 | doze_01 ~ 04 (4) |
| lie_down | 눕기 전환 | lie_down_01 ~ 04 (4) |
| sleep_loop | 자면서 zZ | sleep_loop_01 ~ 06 (6) |
| wake_up | 깨어나기 | wake_up_01 ~ 04 (4) |
**소계: 22**

### 2.12 Wave (인사)
| ID | 프레임 |
|----|--------|
| wave | 손 흔들기 | wave_01 ~ 05 (5) |
| wave_both | 두 손 흔들기 | wave_both_01 ~ 05 (5) |
| bow | 꾸벅 인사 | bow_01 ~ 04 (4) |
**소계: 14**

### 2.13 Cheer (응원)
| ID | 프레임 |
|----|--------|
| cheer_pompom | 응원봉/폼폼 들고 | cheer_pom_01 ~ 06 (6) |
| cheer_fighting | 화이팅 주먹 | cheer_fight_01 ~ 05 (5) |
| clap | 박수 | clap_01 ~ 04 (4) |
**소계: 15**

### 2.14 Game (리듬게임 연동)
| ID | 설명 | 프레임 |
|----|------|--------|
| game_ready | 준비 자세 | game_ready_01 ~ 03 (3) |
| game_play | 노트 치기 loop | game_play_01 ~ 06 (6) |
| game_perfect | PERFECT 리액션 | game_perfect_01 ~ 05 (5) |
| game_combo | 콤보 신남 | game_combo_01 ~ 04 (4) |
| game_fail | 미스/실패(엎드림) | game_fail_01 ~ 05 (5) |
| game_result | 결과 두근두근 | game_result_01 ~ 04 (4) |
**소계: 27**

### 2.15 Reaction (상호작용 반응)
| ID | 설명 | 프레임 |
|----|------|--------|
| poke | 클릭당함(움찔) | poke_01 ~ 04 (4) |
| pet | 쓰다듬김(기뻐함) | pet_01 ~ 05 (5) |
| drag | 드래그 중 매달림 | drag_01 ~ 04 (4) |
| drop | 떨어뜨려짐 착지 | drop_01 ~ 04 (4) |
| dizzy | 어지러움(흔들림 후) | dizzy_01 ~ 05 (5) |
| surprised_jump | 깜짝 놀람 | surp_jump_01 ~ 04 (4) |
**소계: 26**

### 2.16 Play (혼자 놀기)
| ID | 설명 | 프레임 |
|----|------|--------|
| stretch | 기지개 | stretch_01 ~ 05 (5) |
| roll_star | 별 굴리기 | roll_star_01 ~ 06 (6) |
| chase_tail | 꼬리 잡기 | chase_tail_01 ~ 06 (6) |
| groom | 세수/그루밍 | groom_01 ~ 05 (5) |
| peek | 화면 밖 빼꼼 | peek_01 ~ 04 (4) |
**소계: 26**

### 2.17 Special / Seasonal (특수 · 시즌)
| ID | 설명 | 프레임 |
|----|------|--------|
| celebrate | 폭죽 축하 | celebrate_01 ~ 06 (6) |
| levelup | 레벨업 반짝 | levelup_01 ~ 05 (5) |
| night_form_transform | 야행 모드 변신(날개) | nf_transform_01 ~ 06 (6) |
| night_form_idle | 야행 모드 대기(날개 loop) | nf_idle_01 ~ 06 (6) |
| birthday | 생일(고깔+케이크) | birthday_01 ~ 05 (5) |
| newyear | 새해 인사 | newyear_01 ~ 04 (4) |
| halloween | 할로윈(호박) | halloween_01 ~ 04 (4) |
| christmas | 크리스마스(산타모자) | christmas_01 ~ 04 (4) |
**소계: 38**

### 카테고리 요약
| # | 카테고리 | 프레임 수 |
|---|----------|-----------|
| 1 | Idle | 17 |
| 2 | Blink | 12 |
| 3 | Emotion | 37 |
| 4 | Walk | 20 |
| 5 | Run | 12 |
| 6 | Jump | 12 |
| 7 | Sit | 12 |
| 8 | Music | 24 |
| 9 | Dance | 20 |
| 10 | Coding | 16 |
| 11 | Sleep | 22 |
| 12 | Wave | 14 |
| 13 | Cheer | 15 |
| 14 | Game | 27 |
| 15 | Reaction | 26 |
| 16 | Play | 26 |
| 17 | Special/Seasonal | 38 |
| | **캐릭터 스프라이트 총계** | **≈ 360 프레임** |

---

## 3. Desktop Pet 이벤트 정의

이벤트는 **트리거 → 상태(State)** 로 연결된다. 우선순위(priority)가 높은 이벤트가 낮은 것을 인터럽트한다.

### 3.1 시스템/생명주기 이벤트
| 이벤트 | 트리거 | 반응 상태 | 우선순위 |
|--------|--------|-----------|----------|
| `app_launch` | Desktop Pet 실행 / Windows 시작 | wave → idle | 8 |
| `app_quit` | 종료 요청 | bow(작별인사) → fade out | 10 |
| `system_boot` | OS 부팅 감지 | stretch → wave | 8 |
| `system_shutdown` | 종료 신호 | sleepy → lie_down | 10 |
| `screen_lock` | 화면 잠금 | sleeping | 6 |
| `screen_unlock` | 잠금 해제 | wake_up → wave | 7 |
| `low_battery` | 배터리 부족 | sad + 저전력 이펙트 | 7 |

### 3.2 마우스/직접 상호작용
| 이벤트 | 트리거 | 반응 상태 | 우선순위 |
|--------|--------|-----------|----------|
| `click` | 캐릭터 클릭 | poke(움찔) | 9 |
| `double_click` | 더블클릭 | surprised_jump | 9 |
| `right_click` | 우클릭 | (컨텍스트 메뉴) + curious | 9 |
| `drag_start` | 드래그 시작 | drag(매달림) | 10 |
| `drag_move` | 이동 중 | drag loop | 10 |
| `drag_drop` | 놓음 | drop → dizzy → idle | 10 |
| `long_hover` | 오래 hover(쓰다듬) | pet(기뻐함) | 8 |
| `cursor_near` | 커서 근접 | 눈으로 커서 추적 | 5 |
| `cursor_fast` | 커서 빠르게 지나감 | surprised_jump | 6 |

### 3.3 앱/작업 감지 이벤트 (프로세스·포그라운드 윈도우 감지)
| 이벤트 | 트리거 | 반응 상태 | 우선순위 |
|--------|--------|-----------|----------|
| `music_start` | 음악 재생 감지(Spotify 등) | headphone_on → music_idle | 7 |
| `music_stop` | 음악 정지 | headphone_off → idle | 7 |
| `vscode_open` | VSCode/IDE 실행 | coding_open → coding_type | 6 |
| `vscode_close` | IDE 종료 | coding_close → idle | 6 |
| `github_open` | GitHub 브라우저 탭 | curious + 별 이펙트 | 5 |
| `chrome_open` | Chrome 실행 | curious | 4 |
| `rhythm_launch` | 리듬베르 게임 실행 | game_ready → game_play | 9 |
| `rhythm_perfect` | 게임 PERFECT 판정 | game_perfect | 9 |
| `rhythm_fail` | 게임 미스 | game_fail | 9 |
| `rhythm_clear` | 곡 클리어 | celebrate | 9 |
| `terminal_open` | 터미널 실행 | coding_think | 5 |
| `build_success` | 빌드/테스트 성공 | cheer_fighting | 6 |
| `build_fail` | 빌드 실패 | sad → cheer(응원) | 6 |

### 3.4 시간/상태 기반 이벤트 (내부 타이머)
| 이벤트 | 트리거 | 반응 상태 | 우선순위 |
|--------|--------|-----------|----------|
| `idle_bored` | 일정 시간 무입력(예 3분) | play(혼자놀기 랜덤) | 3 |
| `idle_long` | 장시간 무입력(예 10분) | yawn → doze | 3 |
| `idle_sleep` | 초장시간(예 20분) | lie_down → sleep_loop | 2 |
| `night_time` | 밤 시간대(22–05시) | night_form_transform | 4 |
| `morning` | 아침(첫 활동) | wave + "좋은 아침" | 5 |
| `work_long` | 장시간 작업 지속 | cheer(응원) + 물 마시기 알림 | 5 |
| `random_idle` | 랜덤 주기 | idle_look_around/tail/ear 중 랜덤 | 1 |
| `random_special` | 저확률 랜덤 | roll_star/chase_tail/peek | 2 |
| `hourly_chime` | 정각 | 작은 종소리 + nod | 3 |
| `birthday_date` | 사용자 생일 | birthday | 8 |
| `seasonal_date` | 시즌(할로윈/크리스마스/새해) | 해당 seasonal 상태 | 6 |

### 3.5 애정/성장 이벤트 (선택 확장)
| 이벤트 | 트리거 | 반응 상태 |
|--------|--------|-----------|
| `affection_up` | 상호작용 누적 | love |
| `levelup` | 경험치 달성 | levelup |
| `feed` | 간식 주기(메뉴) | happy + 먹기 |
| `gift` | 선물 받기 | surprised → happy (선물상자) |

---

## 4. 이벤트 → 애니메이션 시퀀스 매핑

각 이벤트는 **인트로 → 루프 → 아웃트로** 3단 구조를 기본으로 한다. 루프는 인터럽트 전까지 반복.

```
[Music Playing]
music_start → headphone_on → music_idle(loop) → [music_stop] → headphone_off → idle

[Coding]
vscode_open → coding_open → coding_type(loop)
             ↘ (가끔) coding_think → coding_type
             → [vscode_close] → coding_close → idle

[Rhythm Game]
rhythm_launch → game_ready → game_play(loop)
   ├─ rhythm_perfect → game_perfect → game_play
   ├─ combo↑        → game_combo   → game_play
   ├─ rhythm_fail   → game_fail    → game_play
   └─ rhythm_clear  → game_result  → celebrate → idle

[Idle → Sleep 진행]
idle → (3분) idle_bored → play(random)
     → (10분) idle_long → yawn → doze
     → (20분) idle_sleep → lie_down → sleep_loop(loop)
     → [any input] → wake_up → idle

[Drag]
drag_start → drag(loop while moving) → drag_drop → drop → dizzy → idle

[Click / Interaction]
click → poke → idle
double_click → surprised_jump → idle
long_hover → pet(loop while hover) → happy → idle

[App Launch / Quit]
app_launch → (fade in) → wave → idle
app_quit → bow → (fade out)

[Night Form]
night_time → night_form_transform → night_form_idle(loop)
           → [morning] → (reverse) → idle

[Music + Dance 조합]
music_idle → (신남/비트 강할 때) → dance_basic → dance_spin → music_idle
```

### 상태 머신 규칙
- **Base Layer**: idle / walk / sleep 등 신체 상태 (한 번에 하나)
- **Overlay Layer**: blink, 표정, 이펙트 (base 위에 합성)
- **Accessory Layer**: 헤드셋/모자 등 (2번 항목 참고, base와 함께 렌더)
- 우선순위 높은 이벤트 발생 시 현재 루프를 **아웃트로 없이 컷 전환** 가능(단 drag/game 예외).
- 인터럽트 후 복귀는 항상 `idle`을 기본 홈 상태로 한다.

---

## 5. 소품(Props) 목록

소품은 캐릭터 손/주변에 붙는 오브젝트. 별도 PNG로 제작해 애니메이션에 합성하거나, 소품 포함 프레임을 별도 제작한다.

| ID | 소품 | 사용 상태 | 색상 |
|----|------|-----------|------|
| prop_laptop | 노트북 | coding, github_open | 실버 + 연보라 발바닥 로고 |
| prop_keyboard | 키보드 | coding(확장) | 회색 |
| prop_mouse | 마우스 | coding(확장) | 회색 |
| prop_headset | 헤드셋 | music, dance | `#8E7CF6` |
| prop_mic | 마이크 | music(노래), 방송 | `#8E7CF6` |
| prop_note | 음표 | music, dance, game (이펙트 겸용) | `#B9A7FF` |
| prop_note_rhythm | 리듬게임 노트 | game | `#8E7CF6` |
| prop_star | 별 | play, dance_star, cheer | `#B9A7FF` |
| prop_star_big | 큰 별(끌어안기) | roll_star, special | `#8E7CF6` |
| prop_coffee | 커피/코코아 잔 | idle, work_long | 머그 연보라 |
| prop_pompom | 응원 폼폼 | cheer_pompom | `#B9A7FF` |
| prop_gift | 선물상자 | gift 이벤트 | `#8E7CF6` 리본 |
| prop_ribbon | 리본 | 액세서리/장식 | `#B9A7FF` |
| prop_cushion | 방석 | sleep, sit | 연보라 |
| prop_blanket | 담요 | sleep | 연보라 |
| prop_balloon | 풍선 | celebrate, birthday | 파스텔 |
| prop_cake | 케이크 | birthday | 파스텔 |
| prop_book | 책 | idle(독서, 확장) | 연보라 |
| prop_phone | 스마트폰 | idle(확장) | 검정+보라 |
| prop_speech_bubble | 말풍선 | 대사 표시 | 흰/연보라 |

**소품 총계: 20종** (각 1~2 프레임, 애니메이션 소품은 note/star 등 3~4프레임)

---

## 6. 액세서리(Accessory) 시스템

액세서리는 **부위 슬롯(slot)** 에 장착하는 교체형 파츠다. 각 액세서리는 캐릭터의 **모든 주요 포즈에 맞는 오버레이 세트**로 제작한다. `01_CharacterBible.md` 고정 규칙(얼굴/귀/실루엣)을 침범하지 않는다.

### 6.1 슬롯 정의
| 슬롯 | 위치 | 예시 |
|------|------|------|
| `head` | 머리 위/귀 | 모자류, 리본, 고깔 |
| `face` | 얼굴 | 안경, 마스크, 볼터치 |
| `ear` | 귀 | 헤드셋, 귀 장식 |
| `neck` | 목 | 목도리, 리본타이, 방울 |
| `body` | 몸 | 후드티, 망토, 코스튬 |
| `hand` | 손 | 우산, 응원봉(소품과 연동) |
| `back` | 등 | 날개(야행모드), 배낭 |

### 6.2 액세서리 카탈로그
| ID | 이름 | 슬롯 | 비고 |
|----|------|------|------|
| acc_none | 기본(없음) | - | 디폴트 |
| acc_headset | 헤드셋 | ear | 대표 액세서리 `#8E7CF6` |
| acc_glasses | 안경 | face | 동그란 연보라테 |
| acc_sunglasses | 선글라스 | face | 쿨한 연출 |
| acc_beanie | 비니 | head | 겨울 |
| acc_winter_hat | 겨울 방울모자 | head | 겨울 |
| acc_santa_hat | 산타모자 | head | 크리스마스 |
| acc_party_hat | 파티 고깔 | head | 생일/축하 |
| acc_witch_hat | 마녀모자 | head | 할로윈 |
| acc_flower_crown | 꽃 화관 | head | 봄 |
| acc_ribbon | 머리 리본 | head | 데일리 |
| acc_bell_collar | 방울 목걸이 | neck | 데일리 |
| acc_scarf | 목도리 | neck | 겨울 |
| acc_bowtie | 나비넥타이 | neck | 포멀 |
| acc_hoodie | 후드티 | body | 데일리 캐주얼 `#8E7CF6` |
| acc_cape | 망토 | body | 히어로/야행 |
| acc_raincoat | 우비 | body | 비 |
| acc_umbrella | 우산 | hand | 비 (소품 연동) |
| acc_bat_wings | 박쥐 날개 | back | 야행 모드 Night Form |
| acc_angel_wings | 천사 날개 | back | 이벤트 |
| acc_backpack | 배낭 | back | 여행 |

**액세서리 총계: 21종 (기본 포함)**

### 6.3 장착 규칙
- 슬롯당 **1개**만 장착 (head+face+ear+neck+body+back+hand 동시 가능).
- 헤드셋(ear)과 모자(head)는 동시 착용 가능하되 겹침 우선순위: head > ear.
- 각 액세서리는 최소 **4방향(front/3-4/side/back)** + 주요 애니메이션 대응 오버레이 필요.
- 액세서리 프레임 수 = 부착 대상 애니메이션 프레임과 1:1 대응 (또는 정적 오버레이 1장 + 앵커).

> **에셋 물량 주의**: 액세서리를 모든 프레임에 개별 제작하면 폭증한다.
> 권장 전략 → 액세서리는 **정적 오버레이 1~4장 + 본체 앵커 포인트(head/ear/neck 좌표)** 방식으로 붙인다.
> 크게 움직이는 body/back(후드티/날개)만 애니메이션 세트(6~8프레임)를 제작한다.

---

## 7. 이펙트(Effects) 목록

캐릭터와 분리된 파티클/심볼 레이어. 감정·상태 강조용.

| ID | 이펙트 | 사용 | 프레임 |
|----|--------|------|--------|
| fx_note | 음표 떠오름 | music, dance | 4 |
| fx_sparkle | 반짝임 ✦ | happy, excited, pet | 4 |
| fx_heart | 하트 | love, pet | 4 |
| fx_zzz | 수면 zZ | sleep | 4 |
| fx_sweat | 땀방울 | angry, fail, 당황 | 3 |
| fx_anger | 화남 표식(핏줄) | angry | 3 |
| fx_question | 물음표 | curious | 3 |
| fx_exclaim | 느낌표 | surprised | 3 |
| fx_tear | 눈물 | cry, sad | 4 |
| fx_confetti | 폭죽/꽃가루 | celebrate, levelup | 6 |
| fx_star_burst | 별 터짐 | perfect, levelup | 5 |
| fx_dust | 먼지(착지) | jump, drop | 3 |
| fx_music_wave | 사운드 웨이브 | music | 4 |
| fx_glow | 은은한 글로우 | night_form, special | loop 3 |
| fx_perfect_text | "PERFECT!!" 텍스트 | game_perfect | 2 |
| fx_combo_text | "COMBO" 텍스트 | game_combo | 2 |

**이펙트 총계: 16종 (≈ 60 프레임)**

---

## 8. UI 에셋

Desktop Pet 컨트롤/트레이/메뉴용.

| ID | 설명 |
|----|------|
| ui_tray_icon | 시스템 트레이 아이콘 (16/32/64) |
| ui_context_menu_bg | 우클릭 메뉴 배경 |
| ui_menu_icons | 메뉴 아이콘 세트(설정/액세서리/잠자기/종료 등) |
| ui_speech_bubble | 말풍선 (좌/우/상단 꼬리 3종) |
| ui_notification | 알림 토스트 프레임 |
| ui_settings_panel | 설정 패널 배경 |
| ui_accessory_slot | 액세서리 선택 썸네일 프레임 |
| ui_button_set | 버튼(기본/hover/press) |
| ui_logo | 리듬베르 로고 (가로/세로/심볼) |
| ui_splash | 실행 스플래시 |
| app_icon | 앱 아이콘 (.ico/.icns, 다중 해상도) |

**UI 총계: 11 세트**

---

## 9. 폴더 구조

```
RhythmCamembert/
└── assets/
    ├── character/
    │   ├── idle/
    │   ├── blink/
    │   ├── emotion/
    │   ├── walk/
    │   ├── run/
    │   ├── jump/
    │   ├── sit/
    │   ├── music/
    │   ├── dance/
    │   ├── coding/
    │   ├── sleep/
    │   ├── wave/
    │   ├── cheer/
    │   ├── game/
    │   ├── reaction/
    │   ├── play/
    │   └── special/
    │
    ├── accessories/
    │   ├── head/          (모자·리본·고깔)
    │   ├── face/          (안경·선글라스)
    │   ├── ear/           (헤드셋)
    │   ├── neck/          (목도리·방울)
    │   ├── body/          (후드티·망토)
    │   ├── hand/          (우산)
    │   └── back/          (날개·배낭)
    │
    ├── props/
    │   ├── laptop/
    │   ├── music/         (헤드셋·마이크·음표·리듬노트)
    │   ├── star/
    │   ├── drink/         (커피·코코아)
    │   ├── celebrate/     (선물·케이크·풍선)
    │   └── misc/          (책·폰·방석·담요)
    │
    ├── effects/
    │   ├── music/
    │   ├── emotion/
    │   ├── game/
    │   └── ambient/       (글로우·먼지)
    │
    ├── ui/
    │   ├── tray/
    │   ├── menu/
    │   ├── bubble/
    │   ├── panel/
    │   └── logo/
    │
    ├── spritesheets/      (빌드 산출물: png + json 아틀라스)
    │
    └── manifest/
        ├── asset_manifest.json      (전체 에셋 목록)
        ├── animation_states.json    (상태·시퀀스 정의)
        ├── events.json              (이벤트→상태 매핑)
        └── accessories.json         (액세서리·슬롯 정의)
```

### 프레임 파일 예시
```
assets/character/idle/idle_01.png ... idle_06.png
assets/character/music/music_idle_01.png ... music_idle_06.png
assets/accessories/ear/acc_headset_front.png
assets/props/star/prop_star.png
assets/effects/music/fx_note_01.png ... fx_note_04.png
```

---

## 10. 파일 네이밍 규칙

- 전부 **소문자 + snake_case.**
- 형식: `{category}_{action}_{index}.png` (예: `game_perfect_03.png`)
- 액세서리: `acc_{name}_{view|action}.png` (예: `acc_santa_hat_front.png`)
- 소품: `prop_{name}.png` / 애니메이션 소품은 `prop_{name}_{index}.png`
- 이펙트: `fx_{name}_{index}.png`
- 좌우 미러: `_r`(오른쪽) / `_l`(왼쪽). 코드 미러 사용 시 `_r`만 제작.
- 인덱스는 **2자리 zero-pad** (`_01`, `_02` … `_12`).
- @2x 버전: `idle_01@2x.png`

---

## 11. 에셋 물량 총계

| 구분 | 종류 | 대략 프레임/파일 수 |
|------|------|--------------------|
| 캐릭터 스프라이트 | 17 카테고리 | ≈ 360 |
| 소품 Props | 20종 | ≈ 40 |
| 액세서리 | 21종 (오버레이 방식) | ≈ 90 |
| 이펙트 | 16종 | ≈ 60 |
| UI | 11 세트 | ≈ 40 |
| **합계** | | **≈ 590 에셋 (그림자·@2x 제외)** |

> @1x/@2x 2종 + shadow까지 포함하면 실제 파일 수는 약 **1,200~1,400개** 수준.
> Codex 생성 시에는 `manifest/asset_manifest.json`을 순회하며 **프레임 단위 프롬프트**로 생성하는 것을 권장.

---

*문서 버전: v1.0 · 참고: `01_CharacterBible.md`(고정 규칙) · 데이터: `manifest/*.json`*
