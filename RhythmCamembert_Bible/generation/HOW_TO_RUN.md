# Idle Set 생성 실행 가이드 (image-edit)

`idle_01.png`를 reference로 넣어 gpt-image-1의 image-edit로 나머지 28장을 생성한다. 새 캐릭터를 만들지 않고 idle_01 디자인을 유지한다.

## 1. 준비
```
pip install openai pillow
# Windows
set OPENAI_API_KEY=sk-...
# mac / linux
export OPENAI_API_KEY=sk-...
```
- `assets/character/idle/idle_01.png` (마스터) 가 있어야 한다. ✔ 이미 저장됨.
- gpt-image-1의 image edit는 OpenAI 콘솔에서 **조직 인증(Verify Organization)** 이 필요할 수 있다.

## 2. 실행
```
cd RhythmCamembert_Bible/generation

# 전체 29장 (idle_01은 마스터라 자동 건너뜀, 나머지 28장 생성)
python generate_idle_set.py

# 한 장만 테스트 (권장: 먼저 1~2장 확인)
python generate_idle_set.py --only idle_02
python generate_idle_set.py --only blink_03

# 덮어쓰기 / 크기 지정
python generate_idle_set.py --force
python generate_idle_set.py --size 1024x1024
```

## 3. 저장 위치 (자동)
- `idle*` → `assets/character/idle/`
- `blink*`, `wink*` → `assets/character/blink/`

## 4. 검수 (idle_01 대비, MASTER_REFERENCE.md 체크리스트)
눈 크기·위치 / 귀 2개 모양 / 꼬리 / 2등신 비율 / 무광 벨벳·색 / 투명배경·정면·중앙. 하나라도 어긋나면 그 파일만 `--force --only <name>` 로 리롤.

## 동작 원리
- 각 프롬프트 = `"Keep this exact same character... only change the small motion"` + PREAMBLE v1.1 + 프레임 지정 + Avoid(네거티브).
- `client.images.edit(model="gpt-image-1", image=[idle_01.png], prompt=..., size, background="transparent")`.
- reference를 편집 기준으로 쓰기 때문에 얼굴·비율·색이 고정된다.

## 참고
- 재시도/대기 내장(`--retries`, `--sleep`). 레이트리밋 시 자동 백오프.
- 결과가 미세 움직임이 약하면 프레임 문구를 조금 과장(예: "slightly" → "clearly")하되, 얼굴·비율·카메라 문장은 절대 수정하지 않는다.
