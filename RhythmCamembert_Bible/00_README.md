# 리듬베르 Desktop Companion — 프로젝트 설계 문서

**까망베르(Camembert)** · Rhythm Camembert 공식 IP · Electron Desktop Pet 프로젝트
문서 버전 v1.0 · 작성일 2026-07-01

---

## 이 폴더는 무엇인가

리듬베르의 공식 마스코트 **까망베르**를 Electron 기반 Desktop Companion(플로팅 반려동물)으로 제작하기 위한 **기획 · 설계 문서 모음**이다.
게임 · Desktop Pet · 웹 · 앱 · SNS · 굿즈 · 스티커까지 하나의 IP로 확장하기 위해, 캐릭터 정체성과 에셋 명세를 실제 서비스 수준으로 고정했다.

> **🔒 MASTER REFERENCE 확정 (2026-07-01)**: `idle_01`이 공식 마스터 레퍼런스로 확정되었다. 이후 모든 이미지는 idle_01을 디자인 기준(캐논)으로 삼으며, 얼굴·귀·눈 크기·꼬리·비율은 절대 변경하지 않는다. 상세: `generation/MASTER_REFERENCE.md` · 프리앰블 v1.1(LOCKED).

> **현재 단계 = 설계 단계.** 이미지는 아직 생성하지 않는다.
> 다음 단계에서 Codex(OpenAI)로 `manifest/*.json`을 참조해 이미지를 일괄 생성한다.

---

## 문서 구성

| 파일 | 내용 |
|------|------|
| `00_README.md` | 본 문서 — 인덱스 · Codex 생성 가이드 |
| `01_CharacterBible.md` | **캐릭터 바이블** — 소개/성격/세계관/말투/색상/재질/비율/얼굴·귀·꼬리·눈 규칙/고정·가변 요소 |
| `02_AssetBible.md` | **에셋 바이블** — 에셋 카테고리·개수/이벤트/애니메이션 시퀀스/소품/액세서리/이펙트/UI/폴더구조/네이밍 |
| `manifest/asset_manifest.json` | 전체 스프라이트 목록 (카테고리·클립·프레임 수·소품·이펙트) |
| `manifest/animation_states.json` | 상태 머신 (레이어·시퀀스·전환 규칙) |
| `manifest/events.json` | Desktop Pet 이벤트 → 상태 매핑 (트리거·우선순위) |
| `manifest/accessories.json` | 액세서리 슬롯·카탈로그·장착 규칙 |

---

## 핵심 요약

**캐릭터**: 2등신 검은 고양이 플러시 정령. 먹빛 블랙 `#0D0D0F` + 연보라 눈 `#B9A7FF`. 무광 벨벳 질감. 조용·귀여움·음악/코딩/리듬게임을 좋아하는 응원가.

**🔒 절대 고정**: 얼굴 비율 · 귀 · 꼬리 · 실루엣 · 눈 위치/색 · 팔레트 · 재질 · 2등신 비율.
**🎨 가변**: 표정 · 포즈 · 헤드셋 · 소품 · 액세서리 · 이펙트 · 귀/꼬리 각도.

**에셋 물량**:
- 캐릭터 스프라이트 17 카테고리 ≈ 360 프레임
- 소품 20종 · 액세서리 21종 · 이펙트 16종 · UI 11세트
- 기본 에셋 합계 ≈ 590 (그림자·@2x 포함 시 약 1,200~1,400 파일)

**이벤트**: 생명주기 7 · 상호작용 9 · 앱감지 14 · 타이머 9 · 성장 4 · 시즌 4 = **약 47개 이벤트** 정의.

---

## 다음 단계 (Codex 이미지 생성 가이드)

1. `manifest/asset_manifest.json`을 순회하며 각 `clip`의 `frames` 만큼 프레임 프롬프트를 생성.
2. 모든 프롬프트에 **고정 프리앰블**을 삽입해 캐릭터 일관성을 강제한다:
   ```
   Character: "Camembert", a 2-head-tall chibi black plush cat sprite.
   Fur #0D0D0F (matte velvet, not pure black), lavender eyes #B9A7FF, accent #8E7CF6, highlight #E7E2FF.
   Two pointy triangular ears (lavender inner), one curled tail, symmetrical face,
   tiny omega nose, thin lavender whiskers. Soft matte flocked texture.
   512x512, transparent background PNG, bottom-center anchor, no text, no border.
   DO NOT change: face ratio, ear shape, tail, silhouette, eye position, palette.
   ```
3. 프레임별로 `clip.id + index + desc`를 뒤에 붙여 동작/표정을 지정 (예: `music_idle frame 3 of 6, wearing headset, gently nodding to rhythm, eyes half-closed happy`).
4. 액세서리는 `accessories.json`의 슬롯 앵커에 맞춰 별도 오버레이로 생성.
5. 생성 후 `02_AssetBible.md`의 폴더 구조대로 배치 → 스프라이트시트로 패킹.

> 일관성 확인: 매 배치마다 `01_CharacterBible.md` 13번(고정 요소)과 대조. 얼굴·눈·비율이 흔들리면 즉시 리롤.

---

## Electron 구현 메모 (참고)

- 투명 프레임리스 창 (`transparent: true`, `frame: false`), `alwaysOnTop: true`.
- 드래그: `-webkit-app-region` 또는 커스텀 마우스 핸들러 → `drag_start/drag_drop` 이벤트로 연결.
- 클릭 통과 영역: 캐릭터 알파 히트박스만 이벤트 수신, 나머지 `setIgnoreMouseEvents`.
- 이벤트 소스: 프로세스/포그라운드 윈도우 감지, 오디오 세션, 시스템 전원/세션, 내부 타이머 → `events.json` 매핑대로 상태 전환.
- 리듬베르 게임과는 IPC/로컬 소켓으로 `game_event:*` 신호 연동.
