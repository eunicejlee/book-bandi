import React, { useState, useRef, useEffect, useCallback } from "react";

/* =========================================================
   책반디 (ChaekBandi) — 종이책을 비추는 AI 독서 친구
   프로토타입 · 카메라/OCR/AI 설명/AI 그림은 모두 시뮬레이션
   ========================================================= */

/* ---------------- 데이터 ---------------- */

const LEVELS = [
  { id: "low", age: "8~9세", label: "초등 저학년" },
  { id: "mid", age: "10~13세", label: "초등 고학년" },
  { id: "high", age: "14세~", label: "중학생 이상" },
];

const WORDS = {
  mangseol: {
    id: "mangseol",
    lemma: "망설이다",
    surface: "망설였다",
    kind: "word",
    hue: "#6E7BFF",
    tint: "#EEF0FF",
    short: "할까? 말까? 고민하는 것",
    easy: {
      low: "할까? 말까? 하고 마음을 얼른 정하지 못하는 거야.",
      mid: "할까? 말까? 바로 결정하지 못하고 고민하는 거야.",
      high: "어떤 행동을 할지 말지 쉽게 정하지 못하고 마음속으로 계속 고민하는 거야.",
    },
    scene: "수아가 오래된 집의 문을 열고 들어갈지 말지 고민하고 있어.",
    example: "“친구에게 먼저 사과할까 말까 망설였어.”",
    caption: "할까? 말까? 고민하는 것 = 망설이다",
  },
  gicheok: {
    id: "gicheok",
    lemma: "기척",
    surface: "기척",
    kind: "word",
    hue: "#22B681",
    tint: "#E7F8F1",
    short: "누군가 있는 것 같은 작은 소리나 움직임",
    easy: {
      low: "가까이에 누가 있는 것 같은 아주 작은 소리나 움직임이야.",
      mid: "누군가 가까이에 있는 것처럼 느껴지는 작은 소리나 움직임이야.",
      high: "사람이나 동물이 가까이에 있다는 것을 알아챌 수 있게 하는 작은 소리나 낌새를 말해.",
    },
    scene: "수아가 문 안에서 누군가 움직이는 것 같은 느낌을 받은 거야.",
    example: "“밤에 거실에서 인기척이 느껴졌어.”",
    caption: "보이지 않아도 누군가 있는 것 같은 느낌 = 기척",
  },
  heumchit: {
    id: "heumchit",
    lemma: "흠칫하다",
    surface: "흠칫했다",
    kind: "word",
    hue: "#F58A2E",
    tint: "#FFF1E2",
    short: "깜짝 놀라 몸이 순간 움찔하는 것",
    easy: {
      low: "깜짝 놀라서 몸이 순간 움찔하는 거야.",
      mid: "갑자기 놀라서 몸이 순간 움찔하는 거야.",
      high: "예상하지 못한 일에 놀라 몸이 저절로 움츠러들듯 움찔하는 것을 말해.",
    },
    scene: "갑자기 ‘쿵!’ 소리가 나서 수아가 깜짝 놀라 몸을 움찔했어.",
    example: "“뒤에서 갑자기 이름을 부르자 흠칫 놀랐어.”",
    caption: "깜짝 놀라 몸이 움찔! = 흠칫하다",
  },
  uia: {
    id: "uia",
    lemma: "의아하다",
    surface: "의아한",
    kind: "word",
    hue: "#F2668E",
    tint: "#FFEDF2",
    short: "“왜 그렇지?” 하고 궁금하게 느끼는 것",
    easy: {
      low: "이상해서 “어? 왜 그러지?” 하고 궁금해지는 거야.",
      mid: "뭔가 이상해서 ‘응? 왜 그렇지?’ 하고 궁금해지는 거야.",
      high: "무언가가 앞뒤가 맞지 않아 이상하게 느껴지고 그 까닭이 궁금해지는 마음이야.",
    },
    scene: "아무도 없는 줄 알았던 집에서 갑자기 편지가 나와서 수아가 이상하게 느낀 거야.",
    example: "“평소와 다른 친구의 행동이 의아했어.”",
    caption: "‘왜 그렇지?’ 하고 이상하게 느끼는 것 = 의아하다",
  },
  maeum: {
    id: "maeum",
    lemma: "마음이 무겁다",
    surface: "마음이 무거워졌다",
    kind: "expression",
    hue: "#8B6BE8",
    tint: "#F1ECFF",
    short: "걱정 때문에 마음이 편하지 않은 것",
    easy: {
      low: "걱정되는 일이 있어서 마음이 편하지 않은 거야.",
      mid: "걱정되거나 슬픈 일이 있어서 마음이 편하지 않은 거야.",
      high: "걱정이나 슬픔, 부담 때문에 마음이 편하지 않고 가라앉은 상태를 뜻해.",
    },
    scene: "편지를 읽은 수아가 걱정되고 좋지 않은 기분이 들었다는 뜻이야.",
    example: "“친구가 아프다는 말을 듣고 마음이 무거웠어.”",
    caption: "걱정 때문에 마음이 편하지 않은 상태 = 마음이 무겁다",
  },
};

const GONOE = {
  low: "어떤 일 때문에 아주 많이 걱정하고 고민하는 마음이야.",
  mid: "해결하기 어려운 일 때문에 깊이 고민하고 괴로워하는 거야.",
  high: "해결하기 어려운 문제나 선택 때문에 깊이 고민하며 마음이 괴로운 상태를 뜻해.",
};

const BOOK_TITLE = "오래된 집의 비밀";

const STORY = [
  [{ t: "수아는 골목 끝에 있는 오래된 집 앞에 멈춰 섰다." }],
  [
    { t: "며칠 전 이 집의 창문에서 이상한 불빛을 본 뒤로 계속 마음에 걸렸다. 수아는 문을 열려고 손을 뻗었지만 잠시 " },
    { w: "mangseol" },
    { t: "." },
  ],
  [{ t: "그때 문 너머에서 작은 " }, { w: "gicheok" }, { t: "이 느껴졌다." }],
  [{ t: "“거기 누구 있어?”", q: true }],
  [{ t: "갑자기 안쪽에서 ‘쿵!’ 하는 소리가 들리자 수아는 " }, { w: "heumchit" }, { t: "." }],
  [
    { t: "잠시 뒤 문 아래로 작은 종이 한 장이 밀려 나왔다. 아무도 없는 줄 알았던 집에서 편지가 나타나자 수아는 " },
    { w: "uia" },
    { t: " 표정으로 종이를 바라보았다." },
  ],
  [{ t: "편지에는 단 한 문장만 적혀 있었다." }],
  [{ t: "“네가 찾고 있는 사람은 여기에 없어.”", q: true }],
  [{ t: "그 문장을 읽은 수아는 왠지 " }, { w: "maeum" }, { t: "." }],
];

/* 미니 만화 데이터 (장면 + 말풍선) */
const COMICS = {
  mangseol: [
    { scene: "doorReach", bubbles: [{ kind: "thought", text: "들어갈까?", style: { top: "6%", left: "5%" } }] },
    { scene: "doorTurn", bubbles: [{ kind: "thought", text: "그냥 돌아갈까?", style: { top: "6%", right: "5%" } }] },
  ],
  gicheok: [
    { scene: "doorQuiet", bubbles: [{ kind: "quiet", text: "…", style: { top: "8%", left: "8%" } }] },
    {
      scene: "doorRustle",
      bubbles: [{ kind: "speech", text: "어? 안에 누가 있나?", style: { bottom: "8%", left: "6%" } }],
    },
  ],
  heumchit: [
    { scene: "doorBang", bubbles: [] },
    { scene: "startled", bubbles: [{ kind: "speech", text: "앗!", style: { top: "10%", right: "10%" } }] },
  ],
  uia: [
    { scene: "letterUnder", bubbles: [] },
    { scene: "tilt", bubbles: [{ kind: "speech", text: "응? 아무도 없다면서…?", style: { top: "6%", left: "5%" } }] },
  ],
  maeum: [
    { scene: "readLetter", bubbles: [] },
    { scene: "lookDown", bubbles: [{ kind: "thought", text: "무슨 일이 있는 걸까…", style: { top: "6%", left: "5%" } }] },
  ],
};

/* ---------------- 마스코트 : 반디 ---------------- */

function Bandi({ size = 64, glow = true }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true">
      {glow && <circle className="cb-glowpulse" cx="60" cy="66" r="46" fill="#FFD24A" opacity="0.22" />}
      {/* 꼬리 불빛 */}
      <circle className="cb-glowpulse" cx="60" cy="103" r="15" fill="#FFDF6B" opacity="0.6" />
      <circle cx="60" cy="103" r="8" fill="#FFE98A" />
      {/* 날개 */}
      <ellipse cx="26" cy="56" rx="20" ry="13" fill="#BFE6FF" opacity="0.85" transform="rotate(-22 26 56)" />
      <ellipse cx="94" cy="56" rx="20" ry="13" fill="#BFE6FF" opacity="0.85" transform="rotate(22 94 56)" />
      {/* 몸통 = 작은 책 */}
      <rect x="24" y="40" width="72" height="56" rx="16" fill="#57C48C" />
      <rect x="24" y="40" width="16" height="56" rx="8" fill="#3FA974" />
      <rect x="49" y="52" width="34" height="6" rx="3" fill="#EAFBF2" opacity="0.9" />
      <rect x="49" y="66" width="24" height="6" rx="3" fill="#EAFBF2" opacity="0.65" />
      {/* 더듬이 */}
      <path d="M44 40 q-6 -14 -14 -18" stroke="#3FA974" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M76 40 q6 -14 14 -18" stroke="#3FA974" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="29" cy="20" r="5" fill="#FFD24A" />
      <circle cx="91" cy="20" r="5" fill="#FFD24A" />
      {/* 얼굴 */}
      <circle cx="60" cy="34" r="22" fill="#FFF3D0" />
      <circle cx="52" cy="34" r="4.6" fill="#2E2547" />
      <circle cx="68" cy="34" r="4.6" fill="#2E2547" />
      <path d="M54 42 q6 6 12 0" stroke="#2E2547" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <circle cx="43" cy="41" r="4" fill="#FFB0B0" opacity="0.7" />
      <circle cx="77" cy="41" r="4" fill="#FFB0B0" opacity="0.7" />
    </svg>
  );
}

/* ---------------- 만화 캐릭터 (수아) ---------------- */

function Face({ type }) {
  switch (type) {
    case "think":
      return (
        <g>
          <circle cx="-5" cy="-15" r="2.6" fill="#2E2547" />
          <circle cx="6" cy="-15" r="2.6" fill="#2E2547" />
          <path d="M-9 -22 q4 -3 8 -1" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M2 -23 q4 -2 8 1" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-3 -7 q4 1 7 -1" stroke="#2E2547" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "startled":
      return (
        <g>
          <ellipse cx="-5" cy="-15" rx="4.4" ry="5.4" fill="#fff" stroke="#2E2547" strokeWidth="1.6" />
          <ellipse cx="7" cy="-15" rx="4.4" ry="5.4" fill="#fff" stroke="#2E2547" strokeWidth="1.6" />
          <circle cx="-5" cy="-14" r="2" fill="#2E2547" />
          <circle cx="7" cy="-14" r="2" fill="#2E2547" />
          <path d="M-11 -24 q5 -4 9 -2" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M3 -26 q5 -2 9 2" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="1" cy="-5" rx="4" ry="5" fill="#2E2547" />
        </g>
      );
    case "curious":
      return (
        <g>
          <circle cx="-5" cy="-15" r="2.8" fill="#2E2547" />
          <circle cx="7" cy="-15" r="2.8" fill="#2E2547" />
          <path d="M-10 -24 q5 -2 9 1" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M3 -22 q5 -4 9 -1" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="1" cy="-6" r="2.6" fill="#2E2547" />
        </g>
      );
    case "worried":
      return (
        <g>
          <path d="M-9 -16 q4 3 8 0" stroke="#2E2547" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M3 -16 q4 3 8 0" stroke="#2E2547" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M-11 -24 q5 2 8 4" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M4 -20 q4 -3 8 -4" stroke="#2E2547" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M-4 -5 q5 -3 9 1" stroke="#2E2547" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "read":
      return (
        <g>
          <path d="M-9 -15 q4 3 8 0" stroke="#2E2547" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M3 -15 q4 3 8 0" stroke="#2E2547" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M-2 -6 h7" stroke="#2E2547" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
    default:
      return (
        <g>
          <circle cx="-5" cy="-15" r="2.8" fill="#2E2547" />
          <circle cx="7" cy="-15" r="2.8" fill="#2E2547" />
          <path d="M-2 -6 q5 2 8 -1" stroke="#2E2547" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

function Sua({ x = 0, y = 0, s = 1, flip = false, face = "calm", pose = "stand", tilt = 0 }) {
  const arms = {
    stand: (
      <>
        <path d="M-15 12 q-9 10 -8 20" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M15 12 q9 10 8 20" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
      </>
    ),
    reach: (
      <>
        <path d="M-15 12 q-9 10 -8 20" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M15 10 q16 -4 26 -6" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
      </>
    ),
    down: (
      <>
        <path d="M-15 12 q-11 12 -6 22" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M15 12 q12 12 6 22" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
      </>
    ),
    hold: (
      <>
        <path d="M-15 12 q-4 14 6 18" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M15 12 q4 14 -6 18" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
      </>
    ),
    up: (
      <>
        <path d="M-15 8 q-14 -6 -16 -14" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M15 8 q14 -6 16 -14" stroke="#F6C7A8" strokeWidth="7" fill="none" strokeLinecap="round" />
      </>
    ),
  }[pose];

  const shoulderLift = pose === "up" ? -5 : 0;

  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      <ellipse cx="0" cy="46" rx="20" ry="5" fill="#000" opacity="0.08" />
      <g transform={`translate(0,${shoulderLift})`}>
        {arms}
        {/* 몸 */}
        <path d="M-17 44 Q-19 8 0 6 Q19 8 17 44 Z" fill="#6E7BFF" />
        <path d="M-17 44 Q0 40 17 44 L17 46 Q0 42 -17 46 Z" fill="#5866E0" />
        {/* 다리 */}
        <path d="M-7 44 v10" stroke="#F6C7A8" strokeWidth="6" strokeLinecap="round" />
        <path d="M7 44 v10" stroke="#F6C7A8" strokeWidth="6" strokeLinecap="round" />
        <g transform={`rotate(${tilt} 0 -10)`}>
          {/* 머리 */}
          <circle cx="1" cy="-14" r="18" fill="#FFE0C4" />
          <path d="M-18 -12 Q-19 -38 1 -38 Q21 -38 20 -12 Q17 -24 12 -27 Q4 -22 -12 -25 Q-16 -20 -18 -12 Z" fill="#3B2B37" />
          <Face type={face} />
        </g>
      </g>
    </g>
  );
}

function Door({ open = 0 }) {
  return (
    <g>
      <rect x="112" y="6" width="82" height="128" rx="6" fill="#E4D6C2" />
      <rect x="120" y="14" width="66" height="120" rx="5" fill="#C98A5B" />
      <rect x="128" y="24" width="50" height="42" rx="4" fill="#B87A4D" />
      <rect x="128" y="76" width="50" height="46" rx="4" fill="#B87A4D" />
      <circle cx="130" cy="80" r="4.5" fill="#FFD24A" />
      {open > 0 && <rect x="120" y="14" width={open} height="120" fill="#3A3350" opacity="0.85" />}
    </g>
  );
}

function Scene({ type }) {
  const wall = <rect x="0" y="0" width="200" height="150" fill="#F6EFE2" />;
  const floor = <rect x="0" y="126" width="200" height="24" fill="#E7DBC7" />;
  const common = (
    <>
      {wall}
      {floor}
    </>
  );
  switch (type) {
    case "doorReach":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <Sua x={72} y={82} s={0.95} face="think" pose="reach" />
        </svg>
      );
    case "doorTurn":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <Sua x={68} y={82} s={0.95} face="worried" pose="down" tilt={-6} />
          <path d="M50 60 q-10 6 -14 14" stroke="#B9AFA0" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 5" />
        </svg>
      );
    case "doorQuiet":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <Sua x={72} y={82} s={0.95} face="calm" pose="stand" />
        </svg>
      );
    case "doorRustle":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <g opacity="0.9">
            <path d="M150 40 q10 -6 18 -2" stroke="#8C7BC7" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M152 52 q12 -8 22 -3" stroke="#8C7BC7" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
          <text x="150" y="34" className="cb-sfx cb-sfx-soft">사각…</text>
          <Sua x={66} y={82} s={0.95} face="curious" pose="stand" tilt={6} />
        </svg>
      );
    case "doorBang":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          <rect x="0" y="0" width="200" height="150" fill="#FFF0D8" />
          {floor}
          <g opacity="0.5">
            {[...Array(10)].map((_, i) => (
              <path key={i} d={`M100 70 L${100 + 95 * Math.cos((i * Math.PI) / 5)} ${70 + 95 * Math.sin((i * Math.PI) / 5)}`} stroke="#F5A623" strokeWidth="4" strokeLinecap="round" />
            ))}
          </g>
          <Door open={10} />
          <text x="100" y="82" textAnchor="middle" className="cb-sfx cb-sfx-big">쿵!!</text>
        </svg>
      );
    case "startled":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <g stroke="#F5A623" strokeWidth="3.5" strokeLinecap="round">
            <path d="M44 40 l-8 -10" />
            <path d="M62 32 l0 -12" />
            <path d="M80 40 l8 -10" />
          </g>
          <Sua x={62} y={84} s={0.95} face="startled" pose="up" />
        </svg>
      );
    case "letterUnder":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <g transform="translate(96,120) rotate(-8)">
            <rect x="0" y="0" width="40" height="26" rx="3" fill="#FFFDF5" stroke="#D9CDB8" strokeWidth="2" />
            <path d="M4 6 h22 M4 12 h28 M4 18 h16" stroke="#CFC2AC" strokeWidth="2" strokeLinecap="round" />
          </g>
          <path d="M118 128 q-8 -4 -14 -2" stroke="#B9AFA0" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 5" />
          <Sua x={54} y={82} s={0.9} face="calm" pose="stand" />
        </svg>
      );
    case "tilt":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          {common}
          <Door />
          <g transform="translate(120,122) rotate(-8)">
            <rect x="0" y="0" width="34" height="22" rx="3" fill="#FFFDF5" stroke="#D9CDB8" strokeWidth="2" />
          </g>
          <text x="96" y="42" className="cb-sfx cb-sfx-q">?</text>
          <Sua x={66} y={84} s={0.95} face="curious" pose="stand" tilt={13} />
        </svg>
      );
    case "readLetter":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          <rect x="0" y="0" width="200" height="150" fill="#F3EFE6" />
          {floor}
          <Door />
          <Sua x={78} y={84} s={1.05} face="read" pose="hold" />
          <g transform="translate(60,86) rotate(-6)">
            <rect x="0" y="0" width="42" height="28" rx="3" fill="#FFFDF5" stroke="#D9CDB8" strokeWidth="2" />
            <path d="M5 10 h32 M5 17 h24" stroke="#B9AFA0" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );
    case "lookDown":
      return (
        <svg viewBox="0 0 200 150" className="cb-scene">
          <rect x="0" y="0" width="200" height="150" fill="#E9E7EF" />
          <rect x="0" y="126" width="200" height="24" fill="#DBD8E4" />
          <Door />
          <g opacity="0.45" stroke="#A9A4BC" strokeWidth="2.6" strokeLinecap="round">
            <path d="M28 22 v14" />
            <path d="M44 14 v16" />
            <path d="M60 26 v12" />
          </g>
          <Sua x={78} y={86} s={1.05} face="worried" pose="hold" tilt={10} />
          <g transform="translate(60,92) rotate(-10)">
            <rect x="0" y="0" width="40" height="26" rx="3" fill="#FFFDF5" stroke="#CFC6D8" strokeWidth="2" />
            <path d="M5 10 h30 M5 17 h20" stroke="#BDB6C9" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      );
    default:
      return null;
  }
}

function ComicPanel({ panel, index }) {
  return (
    <div className="cb-panel" style={{ animationDelay: `${index * 140}ms` }}>
      <span className="cb-panel-no">{index + 1}</span>
      <Scene type={panel.scene} />
      {panel.bubbles.map((b, i) => (
        <div key={i} className={`cb-bubble cb-bubble-${b.kind}`} style={b.style}>
          {b.text}
        </div>
      ))}
    </div>
  );
}

/* ---------------- 아이콘 ---------------- */

const Ico = {
  home: (a) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
    </svg>
  ),
  book: (a) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M8 8h7" />
    </svg>
  ),
  chart: (a) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 19V11" />
      <path d="M12 19V5" />
      <path d="M19 19v-5" />
    </svg>
  ),
  gear: (a) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5" />
    </svg>
  ),
  cam: (a) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h2L9 4h6l1.5 2h2A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
      <circle cx="12" cy="13" r="3.6" />
    </svg>
  ),
  search: (a) => (
    <svg viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.4" strokeLinecap="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  ),
};

/* ---------------- 앱 ---------------- */

export default function App() {
  const [screen, setScreen] = useState("home");
  const [level, setLevel] = useState("mid");
  const [textSize, setTextSize] = useState("m");
  const [notif, setNotif] = useState(true);
  const [collected, setCollected] = useState([]); // [{id, at}]
  const [sheet, setSheet] = useState(null); // {id, comic}
  const [toast, setToast] = useState(null);
  const [scan, setScan] = useState("idle"); // idle | scanning | done
  const [query, setQuery] = useState("");
  const [drag, setDrag] = useState(0);
  const toastTimer = useRef(null);
  const dragRef = useRef({ active: false, start: 0 });

  const showToast = useCallback((node, ms = 2400) => {
    setToast(node);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }, []);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const openCamera = () => {
    setScreen("camera");
    setScan("scanning");
    setTimeout(() => setScan("done"), 1600);
  };

  const tapWord = (id) => {
    setSheet({ id, comic: false });
    setDrag(0);
    if (!collected.some((c) => c.id === id)) {
      setCollected((prev) => [{ id, at: Date.now() }, ...prev]);
      setTimeout(() => {
        showToast(
          <div className="cb-toast cb-toast-save">
            <Bandi size={38} />
            <div>
              <b>✨ 새 단어 발견!</b>
              <span>
                ‘{WORDS[id].lemma}’이(가) <em>내 단어</em>에 쏙!
              </span>
            </div>
          </div>
        );
      }, 520);
    }
  };

  const closeSheet = () => {
    setSheet(null);
    setDrag(0);
  };

  const onGotIt = () => {
    closeSheet();
    showToast(<div className="cb-toast cb-toast-mini">📖 계속 읽어도 좋아!</div>, 1600);
  };

  /* 시트 드래그 */
  const onPointerDown = (e) => {
    dragRef.current = { active: true, start: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const d = e.clientY - dragRef.current.start;
    if (d > 0) setDrag(d);
  };
  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    if (drag > 90) closeSheet();
    else setDrag(0);
  };

  const collectedWords = collected.map((c) => ({ ...WORDS[c.id], at: c.at }));
  const filtered = collectedWords.filter(
    (w) => !query.trim() || w.lemma.includes(query.trim()) || w.short.includes(query.trim())
  );

  const bookFont = { s: 14, m: 15.5, l: 17.5 }[textSize];

  return (
    <div className="cb-root">
      <style>{CSS}</style>

      <div className="cb-phone">
        {/* ===== 화면 ===== */}
        <div className={`cb-screen ${screen === "camera" ? "cb-screen-dark" : ""}`}>
          {screen === "home" && (
            <HomeScreen
              collected={collectedWords}
              onStart={openCamera}
              onOpenWord={(id) => setSheet({ id, comic: false })}
              onGoWords={() => setScreen("words")}
            />
          )}

          {screen === "camera" && (
            <CameraScreen
              scan={scan}
              onTap={tapWord}
              collected={collected}
              bookFont={bookFont}
              onBack={() => setScreen("home")}
            />
          )}

          {screen === "words" && (
            <WordsScreen
              words={filtered}
              total={collectedWords.length}
              query={query}
              setQuery={setQuery}
              onMeaning={(id) => setSheet({ id, comic: false })}
              onComic={(id) => setSheet({ id, comic: true })}
              onStart={openCamera}
            />
          )}

          {screen === "log" && <LogScreen collected={collectedWords} onStart={openCamera} />}

          {screen === "settings" && (
            <SettingsScreen
              level={level}
              setLevel={setLevel}
              textSize={textSize}
              setTextSize={setTextSize}
              notif={notif}
              setNotif={setNotif}
            />
          )}
        </div>

        {/* ===== 설명 바텀시트 ===== */}
        {sheet && (
          <>
            <div className="cb-backdrop" onClick={closeSheet} />
            <WordSheet
              word={WORDS[sheet.id]}
              comic={sheet.comic}
              level={level}
              drag={drag}
              textSize={textSize}
              onToggleComic={() => setSheet({ ...sheet, comic: !sheet.comic })}
              onGotIt={onGotIt}
              onClose={closeSheet}
              handleProps={{ onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }}
            />
          </>
        )}

        {/* ===== 토스트 ===== */}
        {toast && <div className="cb-toast-wrap">{toast}</div>}

        {/* ===== 하단 내비게이션 ===== */}
        <nav className="cb-nav">
          <NavBtn label="홈" active={screen === "home"} onClick={() => setScreen("home")} icon={Ico.home} />
          <NavBtn
            label="내 단어"
            active={screen === "words"}
            onClick={() => setScreen("words")}
            icon={Ico.book}
            badge={collected.length || null}
          />
          <button className="cb-fab" onClick={openCamera} aria-label="책 비추기">
            <span className="cb-fab-ring" />
            {Ico.cam("#2E2547")}
          </button>
          <NavBtn label="기록" active={screen === "log"} onClick={() => setScreen("log")} icon={Ico.chart} />
          <NavBtn label="설정" active={screen === "settings"} onClick={() => setScreen("settings")} icon={Ico.gear} />
        </nav>
      </div>
    </div>
  );
}

function NavBtn({ label, active, onClick, icon, badge }) {
  const color = active ? "#2E2547" : "#A9A3B8";
  return (
    <button className={`cb-navbtn ${active ? "on" : ""}`} onClick={onClick}>
      <span className="cb-navicon">
        {icon(color)}
        {badge ? <span className="cb-badge">{badge}</span> : null}
      </span>
      <span style={{ color }}>{label}</span>
    </button>
  );
}

/* ---------------- 홈 ---------------- */

function HomeScreen({ collected, onStart, onOpenWord, onGoWords }) {
  return (
    <div className="cb-page-scroll cb-home">
      <div className="cb-home-top">
        <div className="cb-logo">
          <Bandi size={40} />
          <span className="cb-logo-txt">책반디</span>
        </div>
        <div className="cb-hi">오늘도 반가워!</div>
      </div>

      <h1 className="cb-h1">
        모르는 단어 때문에
        <br />
        책을 멈추지 마세요.
      </h1>
      <p className="cb-sub">책에 카메라를 비추고 궁금한 단어를 눌러봐!</p>

      <div className="cb-cta-zone">
        <div className="cb-mascot-say">
          <div className="cb-say">여기를 누르면 시작!</div>
          <div className="cb-float">
            <Bandi size={74} />
          </div>
        </div>
        <button className="cb-cta" onClick={onStart}>
          <span className="cb-cta-emoji">📷</span>
          책 비추기
        </button>
        <div className="cb-steps">비추고 · 누르고 · 이해하고 · 계속 읽기</div>
      </div>

      <div className="cb-sec-head">
        <h2>✨ 최근 발견한 단어</h2>
        {collected.length > 0 && (
          <button className="cb-more" onClick={onGoWords}>
            모두 보기
          </button>
        )}
      </div>

      {collected.length === 0 ? (
        <div className="cb-empty-home">
          <div className="cb-empty-dots">
            <span />
            <span />
            <span />
          </div>
          <b>아직 발견한 단어가 없어!</b>
          <p>책을 비추고 궁금한 단어를 누르면 여기에 쏙쏙 모여.</p>
        </div>
      ) : (
        <div className="cb-word-row">
          {collected.slice(0, 6).map((w) => (
            <button key={w.id} className="cb-wcard" style={{ background: w.tint }} onClick={() => onOpenWord(w.id)}>
              <span className="cb-wdot" style={{ background: w.hue }} />
              <b style={{ color: w.hue }}>{w.lemma}</b>
              <span>{w.short}</span>
            </button>
          ))}
        </div>
      )}
      <div className="cb-bottom-space" />
    </div>
  );
}

/* ---------------- 카메라 ---------------- */

function CameraScreen({ scan, onTap, collected, bookFont, onBack }) {
  const found = collected.map((c) => c.id);
  return (
    <div className="cb-cam">
      <div className="cb-cam-top">
        <button className="cb-round" onClick={onBack} aria-label="닫기">
          ✕
        </button>
        <div className="cb-cam-pill">
          {scan === "scanning" ? (
            <>
              <span className="cb-dot-load" /> 책을 읽는 중…
            </>
          ) : (
            <>✨ 글자를 찾았어!</>
          )}
        </div>
        <button className="cb-round" aria-label="불빛">
          💡
        </button>
      </div>

      <div className="cb-viewfinder">
        <span className="cb-corner tl" />
        <span className="cb-corner tr" />
        <span className="cb-corner bl" />
        <span className="cb-corner br" />
        {scan === "scanning" && <span className="cb-scanline" />}

        <div className="cb-book">
          <div className="cb-page" style={{ fontSize: bookFont }}>
            <div className="cb-page-head">
              <span>{BOOK_TITLE}</span>
              <span>37</span>
            </div>
            {STORY.map((para, i) => (
              <p key={i} className={para[0].q ? "cb-quote" : ""}>
                {para.map((seg, j) =>
                  seg.w ? (
                    <button
                      key={j}
                      className={`cb-w ${found.includes(seg.w) ? "found" : ""}`}
                      onClick={() => onTap(seg.w)}
                    >
                      {WORDS[seg.w].surface}
                    </button>
                  ) : (
                    <span key={j}>{seg.t}</span>
                  )
                )}
              </p>
            ))}
            <div className="cb-page-foot">— 오래된 집의 비밀 · 1장 —</div>
          </div>
        </div>
      </div>

      <div className="cb-cam-hint">
        <Bandi size={34} />
        {scan === "scanning" ? (
          <span>종이책의 글자를 읽고 있어…</span>
        ) : found.length === 0 ? (
          <span>
            <b>궁금한 단어를 눌러봐.</b> 점선이 그어진 말을 누를 수 있어!
          </span>
        ) : (
          <span>
            <b>{found.length}개 발견!</b> 다른 단어도 눌러볼까?
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------------- 설명 시트 ---------------- */

function WordSheet({ word, comic, level, drag, textSize, onToggleComic, onGotIt, onClose, handleProps }) {
  const isExp = word.kind === "expression";
  const scale = { s: 0.94, m: 1, l: 1.1 }[textSize];
  const comicRef = useRef(null);

  useEffect(() => {
    if (comic && comicRef.current) {
      comicRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [comic, word.id]);

  return (
    <div
      className={`cb-sheet ${comic ? "tall" : ""}`}
      style={{ transform: `translateY(${drag}px)`, transition: drag ? "none" : undefined }}
    >
      <div className="cb-handle-zone" {...handleProps}>
        <span className="cb-handle" />
      </div>

      <div className="cb-sheet-body" style={{ fontSize: `${scale}rem` }}>
        <div className="cb-found" style={{ background: word.tint, color: word.hue }}>
          {isExp ? "✨ 표현의 뜻을 찾았어!" : "🔎 이 단어가 궁금했구나!"}
        </div>

        <div className="cb-word-head">
          <h2 style={{ color: word.hue }}>{word.lemma}</h2>
          {isExp && <span className="cb-tag">표현</span>}
        </div>
        <div className="cb-inbook">
          책에서는 <b>‘{word.surface}’</b>
        </div>

        <Block emoji="💬" title="쉽게 말하면" text={word.easy[level]} hue={word.hue} strong />
        <Block emoji="📖" title="이 장면에서는?" text={word.scene} hue={word.hue} />
        <Block emoji="🌱" title="이렇게도 써!" text={word.example} hue={word.hue} italic />

        {/* 그림은 뜻 바로 아래에서 펼쳐진다 */}
        <div className="cb-comic-slot" ref={comicRef}>
          <button
            className={`cb-btn-comic ${comic ? "open" : ""}`}
            onClick={onToggleComic}
            aria-expanded={comic}
          >
            <span>🎨 그림으로 이해하기</span>
            <span className="cb-caret">{comic ? "▲" : "▼"}</span>
          </button>

          {comic && (
            <div className="cb-comic-inline">
              <div className="cb-panels">
                {COMICS[word.id].map((p, i) => (
                  <ComicPanel key={i} panel={p} index={i} />
                ))}
              </div>
              <div className="cb-caption" style={{ background: word.tint, color: word.hue }}>
                {word.caption}
              </div>
            </div>
          )}
        </div>

        <button className="cb-btn-ok wide" onClick={onGotIt}>
          {comic ? "이제 알겠어! 👍" : "✓ 이제 알겠어!"}
        </button>

        <div className="cb-autosave">✨ 내 단어에 저장됐어!</div>
      </div>

      <button className="cb-sheet-close" onClick={onClose} aria-label="닫기">
        ✕
      </button>
    </div>
  );
}

function Block({ emoji, title, text, hue, strong, italic }) {
  return (
    <div className="cb-block">
      <div className="cb-block-t" style={{ color: hue }}>
        <span>{emoji}</span>
        {title}
      </div>
      <p className={`cb-block-p ${strong ? "strong" : ""} ${italic ? "italic" : ""}`}>{text}</p>
    </div>
  );
}

/* ---------------- 내 단어 ---------------- */

function WordsScreen({ words, total, query, setQuery, onMeaning, onComic, onStart }) {
  return (
    <div className="cb-page-scroll">
      <h1 className="cb-title">📚 내 단어</h1>
      <p className="cb-title-sub">책을 읽으며 발견한 단어들이야!</p>

      <div className="cb-search">
        {Ico.search("#A9A3B8")}
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="단어 찾기" />
      </div>

      {total === 0 ? (
        <div className="cb-empty">
          <div className="cb-float">
            <Bandi size={92} />
          </div>
          <b>여긴 아직 비어 있어!</b>
          <p>책을 비추고 궁금한 단어를 누르면 자동으로 모여.</p>
          <button className="cb-cta small" onClick={onStart}>
            📷 책 비추기
          </button>
        </div>
      ) : words.length === 0 ? (
        <div className="cb-empty">
          <b>찾는 단어가 없어.</b>
          <p>다른 말로 찾아볼까?</p>
        </div>
      ) : (
        <>
          <div className="cb-count">모두 {total}개</div>
          <div className="cb-list">
            {words.map((w) => (
              <div key={w.id} className="cb-lcard" style={{ borderColor: w.tint }}>
                <span className="cb-lbar" style={{ background: w.hue }} />
                <div className="cb-lhead">
                  <b style={{ color: w.hue }}>{w.lemma}</b>
                  {w.kind === "expression" && <span className="cb-tag sm">표현</span>}
                </div>
                <p className="cb-lshort">{w.short}</p>
                <div className="cb-lsrc">📖 {BOOK_TITLE}</div>
                <div className="cb-lbtns">
                  <button onClick={() => onMeaning(w.id)}>뜻 다시 보기</button>
                  <button className="alt" style={{ background: w.tint, color: w.hue }} onClick={() => onComic(w.id)}>
                    🎨 그림 다시 보기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="cb-bottom-space" />
    </div>
  );
}

/* ---------------- 기록 ---------------- */

function LogScreen({ collected, onStart }) {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const litBase = [1, 0, 1, 1, 0, 0, 0];
  return (
    <div className="cb-page-scroll">
      <h1 className="cb-title">🌙 독서 기록</h1>
      <p className="cb-title-sub">반디가 켜준 불빛만큼 읽었어!</p>

      <div className="cb-logcard">
        <div className="cb-logcard-l">
          <div className="cb-bookmini">📖</div>
        </div>
        <div>
          <b>{BOOK_TITLE}</b>
          <span>오늘 12분 읽음 · 37쪽</span>
          <div className="cb-progress">
            <span style={{ width: "42%" }} />
          </div>
        </div>
      </div>

      <div className="cb-week">
        <div className="cb-week-h">이번 주 반디 불빛</div>
        <div className="cb-week-row">
          {days.map((d, i) => {
            const on = litBase[i] || (i === 2 && collected.length > 0);
            return (
              <div key={d} className="cb-day">
                <span className={`cb-lamp ${on ? "on" : ""}`}>{on ? "✦" : ""}</span>
                <em>{d}</em>
              </div>
            );
          })}
        </div>
      </div>

      <div className="cb-stat-row">
        <div className="cb-stat">
          <b>{collected.length}</b>
          <span>발견한 단어</span>
        </div>
        <div className="cb-stat">
          <b>1</b>
          <span>읽고 있는 책</span>
        </div>
        <div className="cb-stat">
          <b>3일</b>
          <span>연속 독서</span>
        </div>
      </div>

      {collected.length > 0 ? (
        <div className="cb-recent">
          <div className="cb-sec-head">
            <h2>오늘 발견한 단어</h2>
          </div>
          <div className="cb-chiprow">
            {collected.map((w) => (
              <span key={w.id} className="cb-chip" style={{ background: w.tint, color: w.hue }}>
                {w.lemma}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="cb-empty small">
          <b>오늘은 아직 기록이 없어.</b>
          <button className="cb-cta small" onClick={onStart}>
            📷 책 비추기
          </button>
        </div>
      )}
      <div className="cb-bottom-space" />
    </div>
  );
}

/* ---------------- 설정 ---------------- */

function SettingsScreen({ level, setLevel, textSize, setTextSize, notif, setNotif }) {
  return (
    <div className="cb-page-scroll">
      <h1 className="cb-title">⚙️ 설정</h1>
      <p className="cb-title-sub">나에게 맞게 바꿔봐.</p>

      <div className="cb-set">
        <div className="cb-set-h">설명 난이도</div>
        <div className="cb-levels">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`cb-level ${level === l.id ? "on" : ""}`}
              onClick={() => setLevel(l.id)}
              aria-pressed={level === l.id}
            >
              <b>{l.age}</b>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
        <div className="cb-preview">
          <div className="cb-preview-h">
            <span className="cb-tag sm">미리보기</span> 고뇌
          </div>
          <p key={level} className="cb-preview-p">
            {GONOE[level]}
          </p>
        </div>
      </div>

      <div className="cb-set">
        <div className="cb-set-h">책 글씨 크기</div>
        <div className="cb-seg">
          {[
            ["s", "작게"],
            ["m", "보통"],
            ["l", "크게"],
          ].map(([id, label]) => (
            <button key={id} className={textSize === id ? "on" : ""} onClick={() => setTextSize(id)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="cb-set">
        <div className="cb-row">
          <div>
            <b>반디의 알림</b>
            <span>하루 한 번 읽을 시간을 알려줘.</span>
          </div>
          <button className={`cb-switch ${notif ? "on" : ""}`} onClick={() => setNotif(!notif)}>
            <span />
          </button>
        </div>
        {notif && (
          <div className="cb-noti">
            <Bandi size={34} />
            <div>
              <b>책반디 · 지금</b>
              <span>오늘도 3분만 읽어볼까? 반디가 기다리고 있어! 📖</span>
            </div>
          </div>
        )}
      </div>

      <div className="cb-set">
        <div className="cb-row">
          <div>
            <b>그림은 필요할 때만</b>
            <span>먼저 뜻만 빠르게 보고, 어려울 때 그림을 열어.</span>
          </div>
          <button className="cb-switch on locked" aria-disabled="true">
            <span />
          </button>
        </div>
      </div>

      <div className="cb-about">
        <Bandi size={40} />
        <div>
          <b>책반디 v1.0</b>
          <span>찾지 말고, 비추고 누르세요.</span>
        </div>
      </div>
      <div className="cb-bottom-space" />
    </div>
  );
}

/* ---------------- 스타일 ---------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Jua&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Black+Han+Sans&display=swap');

.cb-root{
  --ink:#2E2547; --ink-2:#6C6483; --mute:#A9A3B8;
  --glow:#FFCE3A; --glow-2:#FFE27A; --leaf:#22B681; --sky:#6E7BFF;
  --bg:#EEF3EE; --card:#FFFFFF; --paper:#FBF4E4;
  font-family:'IBM Plex Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif;
  color:var(--ink);
  display:flex; align-items:center; justify-content:center;
  min-height:100dvh; width:100%;
  background:
    radial-gradient(900px 500px at 20% 0%, #FFF6DA 0%, transparent 60%),
    radial-gradient(700px 500px at 90% 100%, #DFF3E8 0%, transparent 60%),
    #E8EFE9;
  padding:0;
  -webkit-font-smoothing:antialiased;
}
.cb-root *{box-sizing:border-box; margin:0; padding:0;}
.cb-root button{font-family:inherit; border:none; background:none; cursor:pointer; color:inherit;}

.cb-phone{
  position:relative; width:100%; max-width:430px; height:100dvh; max-height:920px;
  background:var(--bg); overflow:hidden; display:flex; flex-direction:column;
  box-shadow:0 30px 70px rgba(46,37,71,.22);
}
@media(min-width:520px){ .cb-phone{ border-radius:38px; height:min(90dvh,880px); border:9px solid #221C34; } }

.cb-screen{position:relative; flex:1; overflow:hidden; background:var(--bg);}
.cb-screen-dark{background:#1B1730;}
.cb-page-scroll{height:100%; overflow-y:auto; padding:22px 20px 0;}
.cb-bottom-space{height:110px;}

/* ---- 홈 ---- */
.cb-home-top{display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;}
.cb-logo{display:flex; align-items:center; gap:6px;}
.cb-logo-txt{font-family:'Jua',sans-serif; font-size:26px; letter-spacing:-.5px;}
.cb-hi{font-size:12.5px; color:var(--ink-2); background:#fff; padding:7px 12px; border-radius:999px; box-shadow:0 3px 10px rgba(46,37,71,.06);}
.cb-h1{font-family:'Jua',sans-serif; font-size:29px; line-height:1.35; letter-spacing:-.7px;}
.cb-sub{margin-top:10px; font-size:14px; color:var(--ink-2); line-height:1.6; max-width:100%;}

.cb-cta-zone{margin:14px 0 26px;}
.cb-mascot-say{display:flex; align-items:center; justify-content:flex-end; gap:8px; margin:0 4px 10px 0;}
.cb-say{
  font-family:'Jua',sans-serif; font-size:13px; background:#fff; padding:10px 14px;
  border-radius:16px 16px 4px 16px; box-shadow:0 6px 16px rgba(46,37,71,.12);
  animation:cb-say-in .45s ease both .25s;
}
@keyframes cb-say-in{from{opacity:0; transform:translateX(8px) scale(.9)} to{opacity:1; transform:none}}
.cb-float{animation:cb-bob 3s ease-in-out infinite;}
@keyframes cb-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}

.cb-cta{
  width:100%; height:92px; border-radius:28px;
  background:linear-gradient(160deg,#FFD95C,#FFB525);
  font-family:'Jua',sans-serif; font-size:27px; color:#3A2E12;
  display:flex; align-items:center; justify-content:center; gap:12px;
  box-shadow:0 14px 0 #E39A0F, 0 22px 34px rgba(227,154,15,.34);
  transition:transform .12s ease, box-shadow .12s ease;
}
.cb-cta:active{transform:translateY(8px); box-shadow:0 6px 0 #E39A0F, 0 10px 18px rgba(227,154,15,.3);}
.cb-cta.small{height:56px; font-size:19px; border-radius:20px; box-shadow:0 8px 0 #E39A0F; width:auto; padding:0 26px; margin-top:16px;}
.cb-cta-emoji{font-size:26px;}
.cb-steps{margin-top:14px; text-align:center; font-size:12.5px; color:var(--ink-2); letter-spacing:.2px;}

.cb-sec-head{display:flex; align-items:center; justify-content:space-between; margin:4px 0 12px;}
.cb-sec-head h2{font-family:'Jua',sans-serif; font-size:18px; font-weight:400;}
.cb-more{font-size:12.5px; color:var(--ink-2);}

.cb-word-row{display:flex; gap:11px; overflow-x:auto; padding-bottom:6px; margin:0 -20px; padding-left:20px; padding-right:20px;}
.cb-wcard{
  flex:0 0 158px; text-align:left; border-radius:22px; padding:15px 15px 16px;
  display:flex; flex-direction:column; gap:5px; position:relative;
  box-shadow:0 6px 16px rgba(46,37,71,.07);
}
.cb-wcard b{font-family:'Jua',sans-serif; font-size:18px; font-weight:400;}
.cb-wcard span:not(.cb-wdot){font-size:12.5px; color:var(--ink-2); line-height:1.5;}
.cb-wdot{width:9px; height:9px; border-radius:50%;}

.cb-empty-home{
  background:#fff; border:2px dashed #D9E2DA; border-radius:24px; padding:26px 20px; text-align:center;
}
.cb-empty-home b{font-family:'Jua',sans-serif; font-size:17px; font-weight:400;}
.cb-empty-home p{margin-top:7px; font-size:13px; color:var(--ink-2); line-height:1.6;}
.cb-empty-dots{display:flex; gap:7px; justify-content:center; margin-bottom:12px;}
.cb-empty-dots span{width:11px; height:11px; border-radius:50%; background:#E3EAE3;}

/* ---- 카메라 ---- */
.cb-cam{height:100%; display:flex; flex-direction:column; background:#1B1730;}
.cb-cam-top{display:flex; align-items:center; justify-content:space-between; padding:16px 16px 10px; gap:10px;}
.cb-round{width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,.14); color:#fff; font-size:15px;}
.cb-cam-pill{
  flex:1; text-align:center; font-family:'Jua',sans-serif; font-size:14px; color:#2E2547;
  background:var(--glow-2); padding:9px 12px; border-radius:999px;
  display:flex; align-items:center; justify-content:center; gap:7px;
  box-shadow:0 0 22px rgba(255,206,58,.4);
}
.cb-dot-load{width:8px; height:8px; border-radius:50%; background:#2E2547; animation:cb-blink .8s infinite;}
@keyframes cb-blink{0%,100%{opacity:1}50%{opacity:.2}}

.cb-viewfinder{position:relative; flex:1; min-height:0; margin:0 12px 10px; overflow:hidden; border-radius:22px;}
.cb-corner{position:absolute; width:26px; height:26px; border:3px solid var(--glow); z-index:4; opacity:.9;}
.cb-corner.tl{top:8px; left:8px; border-right:0; border-bottom:0; border-radius:10px 0 0 0;}
.cb-corner.tr{top:8px; right:8px; border-left:0; border-bottom:0; border-radius:0 10px 0 0;}
.cb-corner.bl{bottom:8px; left:8px; border-right:0; border-top:0; border-radius:0 0 0 10px;}
.cb-corner.br{bottom:8px; right:8px; border-left:0; border-top:0; border-radius:0 0 10px 0;}
.cb-scanline{
  position:absolute; left:0; right:0; height:120px; z-index:5; pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(255,206,58,.35),transparent);
  animation:cb-scan 1.6s ease-in-out;
}
@keyframes cb-scan{from{transform:translateY(-140px)} to{transform:translateY(560px)}}

.cb-book{
  height:100%; padding:14px 6px;
  transform:perspective(1400px) rotateX(4deg) rotate(-.7deg);
  transform-origin:top center;
}
.cb-page{
  height:100%; overflow-y:auto; border-radius:6px;
  background:
    linear-gradient(90deg, rgba(120,90,50,.16) 0%, rgba(120,90,50,0) 6%),
    repeating-linear-gradient(0deg, rgba(160,130,90,.035) 0 2px, transparent 2px 5px),
    var(--paper);
  padding:22px 20px 34px 26px;
  color:#3B342A; line-height:2.05; letter-spacing:-.2px;
  box-shadow:0 18px 40px rgba(0,0,0,.45), inset 0 0 60px rgba(150,110,60,.08);
}
.cb-page p{margin-bottom:14px; text-indent:.6em;}
.cb-page p.cb-quote{text-indent:0; padding-left:10px; color:#4A4136;}
.cb-page-head{display:flex; justify-content:space-between; font-size:11px; color:#A2937B; letter-spacing:1px; margin-bottom:18px; text-indent:0;}
.cb-page-foot{text-align:center; font-size:11px; color:#B3A48B; margin-top:10px;}

.cb-w{
  display:inline; font:inherit; color:#3B342A; padding:0 1px; border-radius:5px;
  border-bottom:2px dotted rgba(214,150,20,.8);
  transition:background .18s ease;
}
.cb-w::after{content:"✦"; font-size:.55em; color:rgba(214,150,20,.85); vertical-align:super; margin-left:1px;}
.cb-w:active{background:rgba(255,206,58,.55);}
.cb-w.found{background:rgba(255,206,58,.32); border-bottom-color:rgba(214,150,20,.45);}

.cb-cam-hint{
  flex:0 0 auto; margin:0 12px 12px; border-radius:18px;
  background:rgba(255,255,255,.13); padding:8px 14px 8px 8px;
  display:flex; align-items:center; gap:8px;
  border:1px solid rgba(255,255,255,.12);
}
.cb-cam-hint span{font-size:12.5px; color:rgba(255,255,255,.78); line-height:1.45;}
.cb-cam-hint b{font-family:'Jua',sans-serif; font-size:13.5px; font-weight:400; color:var(--glow-2);}
@keyframes cb-up{from{opacity:0; transform:translateY(14px)} to{opacity:1; transform:none}}

/* ---- 바텀시트 ---- */
.cb-backdrop{position:absolute; inset:0; background:rgba(20,16,36,.42); z-index:20; animation:cb-fade .2s ease;}
@keyframes cb-fade{from{opacity:0}to{opacity:1}}
.cb-sheet{
  position:absolute; left:0; right:0; bottom:0; z-index:21;
  max-height:74%; background:#fff; border-radius:30px 30px 0 0;
  box-shadow:0 -12px 40px rgba(20,16,36,.28);
  display:flex; flex-direction:column;
  animation:cb-sheetup .34s cubic-bezier(.2,.9,.25,1) both;
  transition:transform .22s ease;
}
.cb-sheet.tall{max-height:90%;}
@keyframes cb-sheetup{from{transform:translateY(100%)} to{transform:translateY(0)}}
.cb-handle-zone{padding:12px 0 4px; display:flex; justify-content:center; touch-action:none; cursor:grab;}
.cb-handle{width:46px; height:5px; border-radius:99px; background:#E2DEEA;}
.cb-sheet-body{overflow-y:auto; padding:6px 22px 26px;}
.cb-sheet-close{position:absolute; right:14px; top:12px; width:32px; height:32px; border-radius:50%; background:#F2F0F6; color:var(--mute); font-size:13px;}

.cb-found{display:inline-block; font-family:'Jua',sans-serif; font-size:13.5px; padding:8px 14px; border-radius:999px;}
.cb-word-head{display:flex; align-items:center; gap:9px; margin-top:12px;}
.cb-word-head h2{font-family:'Jua',sans-serif; font-size:34px; font-weight:400; letter-spacing:-1px;}
.cb-tag{font-size:11px; background:#F2F0F6; color:var(--ink-2); padding:4px 9px; border-radius:8px;}
.cb-tag.sm{font-size:10px; padding:3px 7px;}
.cb-inbook{margin-top:6px; font-size:12.5px; color:var(--mute);}
.cb-inbook b{color:var(--ink-2); font-weight:600;}

.cb-block{margin-top:18px;}
.cb-block-t{font-family:'Jua',sans-serif; font-size:14px; display:flex; align-items:center; gap:6px; margin-bottom:7px;}
.cb-block-p{font-size:15px; line-height:1.72; color:#3B3550; background:#F7F6FA; border-radius:16px; padding:13px 15px;}
.cb-block-p.strong{font-weight:600; font-size:16px; background:#FFF8E3;}
.cb-block-p.italic{color:var(--ink-2);}

.cb-comic-slot{margin-top:22px; scroll-margin-top:8px;}
.cb-btn-comic{
  width:100%; height:58px; border-radius:20px; font-family:'Jua',sans-serif; font-size:16.5px;
  background:linear-gradient(150deg,#8FE3C0,#3FC98F); color:#134B36;
  box-shadow:0 7px 0 #2FA875;
  display:flex; align-items:center; justify-content:center; gap:10px; position:relative;
}
.cb-caret{position:absolute; right:20px; font-size:11px; opacity:.75;}
.cb-btn-comic.open{
  border-radius:20px 20px 8px 8px; box-shadow:0 4px 0 #2FA875;
}
.cb-btn-ok{
  width:100%; height:58px; border-radius:20px; margin-top:12px;
  font-family:'Jua',sans-serif; font-size:16.5px;
  background:#2E2547; color:#fff; box-shadow:0 7px 0 #191233;
}
.cb-btn-comic:active,.cb-btn-ok:active{transform:translateY(4px); box-shadow:none;}
.cb-comic-inline{
  background:#F7F6FA; border-radius:8px 8px 22px 22px; padding:14px;
  animation:cb-open .34s cubic-bezier(.2,.9,.25,1) both;
}
@keyframes cb-open{from{opacity:0; transform:translateY(-10px)} to{opacity:1; transform:none}}
.cb-autosave{margin-top:14px; text-align:center; font-size:12px; color:var(--mute);}

/* ---- 만화 ---- */
.cb-panels{display:flex; flex-direction:column; gap:12px;}
.cb-panel{
  position:relative; border-radius:18px; overflow:hidden; border:3px solid #2E2547;
  background:#F6EFE2; animation:cb-panel-in .4s ease both;
}
@keyframes cb-panel-in{from{opacity:0; transform:translateY(12px) scale(.97)} to{opacity:1; transform:none}}
.cb-panel-no{
  position:absolute; left:8px; top:8px; z-index:3; width:22px; height:22px; border-radius:8px;
  background:#2E2547; color:#fff; font-size:12px; display:flex; align-items:center; justify-content:center;
  font-family:'Jua',sans-serif;
}
.cb-scene{display:block; width:100%; height:auto;}
.cb-sfx{font-family:'Black Han Sans',sans-serif; fill:#E8582F;}
.cb-sfx-big{font-size:38px; letter-spacing:-1px; stroke:#fff; stroke-width:4; paint-order:stroke;}
.cb-sfx-soft{font-size:15px; fill:#7B6BB5;}
.cb-sfx-q{font-size:30px; fill:#F2668E;}

.cb-bubble{
  position:absolute; z-index:4; max-width:64%;
  font-family:'Jua',sans-serif; font-size:13px; line-height:1.4; color:#2E2547;
  background:#fff; padding:9px 13px; border:2.5px solid #2E2547;
}
.cb-bubble-speech{border-radius:16px 16px 16px 4px;}
.cb-bubble-thought{border-radius:20px; border-style:dashed;}
.cb-bubble-quiet{border-radius:20px; border-style:dashed; font-size:16px; padding:4px 12px;}

.cb-caption{
  margin-top:12px; text-align:center; font-family:'Jua',sans-serif; font-size:16px;
  padding:15px 14px; border-radius:18px; line-height:1.5;
}

/* ---- 내 단어 ---- */
.cb-title{font-family:'Jua',sans-serif; font-size:27px; font-weight:400;}
.cb-title-sub{margin-top:6px; font-size:13.5px; color:var(--ink-2);}
.cb-search{
  display:flex; align-items:center; gap:9px; background:#fff; border-radius:18px;
  padding:13px 15px; margin:16px 0 14px; box-shadow:0 4px 12px rgba(46,37,71,.06);
}
.cb-search svg{width:18px; height:18px; flex:0 0 18px;}
.cb-search input{border:none; outline:none; font-family:inherit; font-size:14px; width:100%; background:none; color:var(--ink);}
.cb-count{font-size:12px; color:var(--mute); margin-bottom:10px;}
.cb-list{display:flex; flex-direction:column; gap:12px;}
.cb-lcard{position:relative; background:#fff; border-radius:22px; padding:16px 16px 14px 20px; box-shadow:0 6px 16px rgba(46,37,71,.07); overflow:hidden;}
.cb-lbar{position:absolute; left:0; top:0; bottom:0; width:7px;}
.cb-lhead{display:flex; align-items:center; gap:7px;}
.cb-lhead b{font-family:'Jua',sans-serif; font-size:20px; font-weight:400;}
.cb-lshort{margin-top:5px; font-size:13.5px; color:#4A4460; line-height:1.55;}
.cb-lsrc{margin-top:9px; font-size:11.5px; color:var(--mute);}
.cb-lbtns{display:flex; gap:8px; margin-top:13px;}
.cb-lbtns button{flex:1; height:42px; border-radius:14px; font-size:13.5px; font-weight:600; background:#F4F3F8; color:var(--ink-2);}
.cb-lbtns button.alt{font-weight:600;}
.cb-lbtns button:active{transform:scale(.97);}

.cb-empty{text-align:center; padding:34px 16px; background:#fff; border-radius:26px; margin-top:8px;}
.cb-empty.small{padding:26px 16px;}
.cb-empty b{display:block; font-family:'Jua',sans-serif; font-size:18px; font-weight:400; margin-top:8px;}
.cb-empty p{margin-top:7px; font-size:13px; color:var(--ink-2); line-height:1.6;}

/* ---- 기록 ---- */
.cb-logcard{display:flex; gap:14px; background:#fff; border-radius:24px; padding:16px; margin:16px 0 14px; box-shadow:0 6px 16px rgba(46,37,71,.07);}
.cb-bookmini{width:54px; height:70px; border-radius:8px 12px 12px 8px; background:linear-gradient(150deg,#FFD95C,#FFB525); display:flex; align-items:center; justify-content:center; font-size:24px;}
.cb-logcard b{font-family:'Jua',sans-serif; font-size:18px; font-weight:400; display:block;}
.cb-logcard span{font-size:12.5px; color:var(--ink-2);}
.cb-progress{margin-top:10px; height:9px; border-radius:99px; background:#EFEDF4; overflow:hidden;}
.cb-progress span{display:block; height:100%; background:linear-gradient(90deg,#FFD95C,#FFB525);}
.cb-week{background:#fff; border-radius:24px; padding:16px; box-shadow:0 6px 16px rgba(46,37,71,.07);}
.cb-week-h{font-family:'Jua',sans-serif; font-size:15px; margin-bottom:12px;}
.cb-week-row{display:flex; justify-content:space-between;}
.cb-day{display:flex; flex-direction:column; align-items:center; gap:6px;}
.cb-lamp{width:34px; height:34px; border-radius:12px; background:#F1EFF6; display:flex; align-items:center; justify-content:center; color:#fff; font-size:14px;}
.cb-lamp.on{background:linear-gradient(150deg,#FFD95C,#FFB525); box-shadow:0 0 14px rgba(255,181,37,.55);}
.cb-day em{font-style:normal; font-size:11.5px; color:var(--mute);}
.cb-stat-row{display:flex; gap:10px; margin:14px 0;}
.cb-stat{flex:1; background:#fff; border-radius:20px; padding:14px 10px; text-align:center; box-shadow:0 6px 16px rgba(46,37,71,.06);}
.cb-stat b{display:block; font-family:'Jua',sans-serif; font-size:22px; font-weight:400;}
.cb-stat span{font-size:11.5px; color:var(--ink-2);}
.cb-chiprow{display:flex; flex-wrap:wrap; gap:8px;}
.cb-chip{font-family:'Jua',sans-serif; font-size:14px; padding:9px 14px; border-radius:999px;}

/* ---- 설정 ---- */
.cb-set{background:#fff; border-radius:24px; padding:17px; margin-top:14px; box-shadow:0 6px 16px rgba(46,37,71,.06);}
.cb-set-h{font-family:'Jua',sans-serif; font-size:16px; margin-bottom:12px;}
.cb-levels{display:flex; gap:9px;}
.cb-level{
  flex:1; padding:14px 4px 12px; border-radius:18px;
  background:#FBF9F4; border:1.5px solid #E7E2D6;
  display:flex; flex-direction:column; align-items:center; gap:3px;
  transition:background .18s ease, border-color .18s ease, transform .12s ease;
}
.cb-level b{font-family:'Jua',sans-serif; font-size:18px; font-weight:400; letter-spacing:-.4px; color:#3B3550;}
.cb-level span{font-size:11.5px; color:#8C8699;}
.cb-level.on{background:#1E5A44; border-color:#1E5A44; box-shadow:0 6px 16px rgba(30,90,68,.28);}
.cb-level.on b{color:#fff;}
.cb-level.on span{color:#B8DDCB;}
.cb-level:active{transform:scale(.97);}

.cb-seg{display:flex; gap:6px; background:#F4F3F8; padding:5px; border-radius:16px;}
.cb-seg button{flex:1; height:42px; border-radius:12px; font-size:13px; font-weight:600; color:var(--ink-2);}
.cb-seg button.on{background:#2E2547; color:#fff;}
.cb-preview{margin-top:13px; background:#FFF8E3; border-radius:16px; padding:14px;}
.cb-preview-h{font-family:'Jua',sans-serif; font-size:15px; display:flex; align-items:center; gap:8px;}
.cb-preview-p{margin-top:8px; font-size:14px; line-height:1.7; color:#3B3550; animation:cb-fade .35s ease;}
.cb-row{display:flex; align-items:center; justify-content:space-between; gap:14px;}
.cb-row b{font-family:'Jua',sans-serif; font-size:15.5px; font-weight:400; display:block;}
.cb-row span{font-size:12px; color:var(--ink-2); line-height:1.5;}
.cb-switch{width:52px; height:31px; border-radius:99px; background:#E2DEEA; position:relative; flex:0 0 52px; transition:background .2s;}
.cb-switch span{position:absolute; top:3px; left:3px; width:25px; height:25px; border-radius:50%; background:#fff; transition:transform .2s; box-shadow:0 2px 5px rgba(0,0,0,.16);}
.cb-switch.on{background:#3FC98F;}
.cb-switch.on span{transform:translateX(21px);}
.cb-switch.locked{opacity:.65;}
.cb-noti{display:flex; align-items:center; gap:10px; margin-top:14px; background:#F4F3F8; border-radius:16px; padding:12px;}
.cb-noti b{display:block; font-size:11.5px; color:var(--mute);}
.cb-noti span{font-size:13px; color:#3B3550; line-height:1.5;}
.cb-about{display:flex; align-items:center; gap:12px; padding:22px 6px 0; opacity:.85;}
.cb-about b{font-family:'Jua',sans-serif; font-size:15px; font-weight:400; display:block;}
.cb-about span{font-size:12px; color:var(--ink-2);}

/* ---- 토스트 ---- */
.cb-toast-wrap{position:absolute; left:0; right:0; bottom:100px; z-index:40; display:flex; justify-content:center; pointer-events:none; padding:0 18px;}
.cb-toast{
  display:flex; align-items:center; gap:10px; background:#2E2547; color:#fff;
  padding:12px 18px 12px 12px; border-radius:22px; box-shadow:0 14px 30px rgba(20,16,36,.35);
  animation:cb-toast .3s cubic-bezier(.2,1.2,.4,1) both;
}
.cb-toast b{display:block; font-family:'Jua',sans-serif; font-size:14px; font-weight:400; color:var(--glow-2);}
.cb-toast span{font-size:13px;}
.cb-toast em{font-style:normal; color:var(--glow-2); font-weight:600;}
.cb-toast-mini{font-family:'Jua',sans-serif; font-size:14px; padding:12px 20px;}
@keyframes cb-toast{from{opacity:0; transform:translateY(16px) scale(.94)} to{opacity:1; transform:none}}

/* ---- 내비 ---- */
.cb-nav{
  position:relative; z-index:30; display:flex; align-items:flex-end; justify-content:space-around;
  background:#fff; padding:10px 8px calc(12px + env(safe-area-inset-bottom)) 8px;
  box-shadow:0 -6px 24px rgba(46,37,71,.1); border-radius:26px 26px 0 0;
}
.cb-navbtn{display:flex; flex-direction:column; align-items:center; gap:4px; flex:1; font-size:11px; padding:6px 0;}
.cb-navicon{position:relative; width:24px; height:24px; display:block;}
.cb-navicon svg{width:24px; height:24px;}
.cb-badge{
  position:absolute; top:-5px; right:-9px; min-width:17px; height:17px; padding:0 4px;
  border-radius:99px; background:#F2668E; color:#fff; font-size:10px; font-weight:700;
  display:flex; align-items:center; justify-content:center;
}
.cb-fab{
  position:relative; flex:0 0 68px; width:68px; height:68px; margin-top:-28px; border-radius:50%;
  background:linear-gradient(160deg,#FFD95C,#FFB525);
  display:flex; align-items:center; justify-content:center;
  box-shadow:0 10px 24px rgba(227,154,15,.5); border:5px solid #fff;
}
.cb-fab svg{width:28px; height:28px;}
.cb-fab-ring{position:absolute; inset:-7px; border-radius:50%; border:2px solid rgba(255,181,37,.45); animation:cb-ring 2.4s ease-out infinite;}
@keyframes cb-ring{0%{transform:scale(.9); opacity:.8} 70%{transform:scale(1.25); opacity:0} 100%{opacity:0}}
.cb-fab:active{transform:scale(.94);}

.cb-glowpulse{animation:cb-pulse 2.4s ease-in-out infinite; transform-origin:center;}
@keyframes cb-pulse{0%,100%{opacity:.22}50%{opacity:.5}}

@media (prefers-reduced-motion:reduce){
  .cb-root *{animation:none !important; transition:none !important;}
}
`;
