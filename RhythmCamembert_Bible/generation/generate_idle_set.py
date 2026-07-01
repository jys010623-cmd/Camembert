#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
까망베르 Idle Set 생성기 (image-edit 방식)
------------------------------------------------
- 마스터 idle_01.png 를 REFERENCE IMAGE 로 넣고 gpt-image-1 의 images.edit 로 각 프레임을 생성한다.
- 새 캐릭터를 만들지 않고, idle_01 디자인을 유지한 채 프레임별 최소 움직임만 반영한다.
- 프롬프트/네거티브/파일목록은 idle_set_prompts.json 에서 읽는다 (PREAMBLE v1.1 LOCKED).

사용법:
    pip install openai pillow
    set OPENAI_API_KEY=sk-...        (Windows)   /   export OPENAI_API_KEY=sk-...  (mac/linux)
    python generate_idle_set.py                  # 전체 29장 생성 (이미 있으면 건너뜀)
    python generate_idle_set.py --only idle_01   # 특정 파일만
    python generate_idle_set.py --force          # 기존 파일 덮어쓰기
    python generate_idle_set.py --size 1024x1024 # 출력 크기

주의:
- gpt-image-1 의 image edit 는 OpenAI '조직 인증(Verify Organization)' 이 필요할 수 있다.
- images.edit 는 reference 이미지를 편집 기준으로 사용하므로 캐릭터 일관성이 가장 잘 유지된다.
"""

import os
import sys
import json
import base64
import time
import argparse
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    sys.exit("openai 패키지가 필요합니다:  pip install openai pillow")

# ---- 경로 설정 -----------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent          # RhythmCamembert_Bible/
PROMPTS_JSON = Path(__file__).resolve().parent / "idle_set_prompts.json"
MASTER_REF = ROOT / "assets" / "character" / "idle" / "idle_01.png"   # 마스터 레퍼런스
ASSETS = ROOT / "assets"

# ---- 인자 ----------------------------------------------------------------
ap = argparse.ArgumentParser()
ap.add_argument("--only", default=None, help="특정 파일명만 생성 (예: idle_02.png 또는 idle_02)")
ap.add_argument("--force", action="store_true", help="기존 파일 덮어쓰기")
ap.add_argument("--size", default="1024x1024", help="출력 크기 (기본 1024x1024)")
ap.add_argument("--model", default="gpt-image-1")
ap.add_argument("--sleep", type=float, default=2.0, help="요청 간 대기(초)")
ap.add_argument("--retries", type=int, default=4, help="실패 시 재시도 횟수")
args = ap.parse_args()

# ---- 로드 ----------------------------------------------------------------
if not PROMPTS_JSON.exists():
    sys.exit(f"프롬프트 JSON을 찾을 수 없습니다: {PROMPTS_JSON}")
if not MASTER_REF.exists():
    sys.exit(f"마스터 레퍼런스가 없습니다: {MASTER_REF}\n먼저 idle_01.png 를 저장하세요.")

spec = json.loads(PROMPTS_JSON.read_text(encoding="utf-8"))
PREAMBLE = spec["common_preamble"]
NEGATIVE = spec["common_negative"]
TEMPLATE = spec.get("prompt_template", "{common_preamble}\n--- FRAME: {frame}\nAvoid: {common_negative}")
FRAMES = spec["frames"]

# idle_01 은 마스터 자체이므로 재생성 대상에서 기본 제외 (원하면 --force --only idle_01)
client = OpenAI()  # OPENAI_API_KEY 환경변수 사용

def build_prompt(frame_text: str) -> str:
    # image-edit 이므로 캐릭터를 '유지'하라는 지시를 앞에 덧붙여 일관성을 강화한다.
    keep = ("Keep this exact same plush black cat character from the reference image. "
            "Do NOT redesign. Do NOT change the face, ears, eye size or position, mouth, tail, "
            "body proportions, material or colors. Only change the small motion described below.\n")
    return keep + TEMPLATE.format(common_preamble=PREAMBLE, frame=frame_text, common_negative=NEGATIVE)

def gen_one(frame: dict) -> bool:
    fname = frame["file"]
    out_dir = ASSETS / frame["dir"].replace("assets/", "", 1)
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / fname

    if fname == "idle_01.png" and not args.force:
        print(f"  = {fname}: 마스터 원본 유지 (건너뜀)")
        return True
    if out_path.exists() and not args.force:
        print(f"  = {fname}: 이미 존재 (건너뜀)")
        return True

    prompt = build_prompt(frame["frame"])
    for attempt in range(1, args.retries + 1):
        try:
            with open(MASTER_REF, "rb") as ref:
                resp = client.images.edit(
                    model=args.model,
                    image=[ref],                 # ← REFERENCE IMAGE (idle_01)
                    prompt=prompt,
                    size=args.size,
                    background="transparent",
                )
            b64 = resp.data[0].b64_json
            out_path.write_bytes(base64.b64decode(b64))
            print(f"  + {fname}: 생성 완료 → {out_path}")
            return True
        except Exception as e:
            wait = args.sleep * attempt * 2
            print(f"  ! {fname}: 실패({attempt}/{args.retries}) {e} → {wait:.0f}s 후 재시도")
            time.sleep(wait)
    print(f"  X {fname}: 최종 실패")
    return False

def main():
    targets = FRAMES
    if args.only:
        key = args.only if args.only.endswith(".png") else args.only + ".png"
        targets = [f for f in FRAMES if f["file"] == key]
        if not targets:
            sys.exit(f"--only 대상 없음: {key}")

    print(f"모델={args.model} 크기={args.size} 대상={len(targets)}장  reference={MASTER_REF.name}")
    ok = 0
    for i, fr in enumerate(targets, 1):
        print(f"[{i}/{len(targets)}] {fr['file']}")
        if gen_one(fr):
            ok += 1
        time.sleep(args.sleep)
    print(f"\n완료: {ok}/{len(targets)} 성공")

if __name__ == "__main__":
    main()
