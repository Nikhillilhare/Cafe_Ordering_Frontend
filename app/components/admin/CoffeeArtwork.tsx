"use client";

import { useId } from "react";

type CoffeeArtworkProps = {
  className?: string;
};

export function CoffeeCupArtwork({
  className = "",
}: CoffeeArtworkProps) {
  const reactId = useId().replace(/:/g, "");

  const cupBodyId = `cup-body-${reactId}`;
  const saucerId = `saucer-${reactId}`;
  const coffeeLiquidId = `coffee-liquid-${reactId}`;
  const cupShadowId = `cup-shadow-${reactId}`;

  return (
    <svg
      viewBox="0 0 240 180"
      className={className}
      role="img"
      aria-label="A warm cup of coffee"
    >
      <defs>
        <linearGradient
          id={cupBodyId}
          x1="62"
          y1="65"
          x2="176"
          y2="154"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF9F1" />
          <stop offset="0.5" stopColor="#F8D8B5" />
          <stop offset="1" stopColor="#C87837" />
        </linearGradient>

        <linearGradient
          id={saucerId}
          x1="40"
          y1="140"
          x2="195"
          y2="164"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FFF7EC" />
          <stop offset="1" stopColor="#C56B2E" />
        </linearGradient>

        <radialGradient id={coffeeLiquidId}>
          <stop stopColor="#8E451F" />
          <stop offset="0.7" stopColor="#4A1F0E" />
          <stop offset="1" stopColor="#251008" />
        </radialGradient>

        <filter id={cupShadowId} x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow
            dx="0"
            dy="10"
            stdDeviation="8"
            floodColor="#160904"
            floodOpacity="0.45"
          />
        </filter>
      </defs>

      <g
        fill="none"
        strokeLinecap="round"
        className="origin-center"
      >
        <path
          d="M90 53C72 35 102 28 87 9"
          stroke="#FFF2DF"
          strokeWidth="7"
          opacity="0.82"
        />

        <path
          d="M119 49C103 32 132 25 119 5"
          stroke="#FFF2DF"
          strokeWidth="6"
          opacity="0.68"
        />

        <path
          d="M147 53C132 38 158 29 148 14"
          stroke="#FFF2DF"
          strokeWidth="5"
          opacity="0.52"
        />
      </g>

      <g filter={`url(#${cupShadowId})`}>
        <ellipse
          cx="119"
          cy="153"
          rx="84"
          ry="18"
          fill={`url(#${saucerId})`}
        />

        <ellipse
          cx="119"
          cy="149"
          rx="65"
          ry="10"
          fill="#FFF2E2"
          opacity="0.78"
        />

        <path
          d="M62 69H171L162 128C160 143 147 153 132 153H101C84 153 71 142 69 126L62 69Z"
          fill={`url(#${cupBodyId})`}
        />

        <path
          d="M170 82C201 77 209 91 206 108C203 127 184 136 164 128"
          stroke="#E6A66B"
          strokeWidth="13"
        />

        <path
          d="M171 89C190 87 195 95 193 106C191 116 180 121 166 118"
          stroke="#FFF2E2"
          strokeWidth="6"
        />

        <ellipse
          cx="116.5"
          cy="69"
          rx="55"
          ry="13"
          fill="#F8DABF"
        />

        <ellipse
          cx="116.5"
          cy="69"
          rx="48"
          ry="9.5"
          fill={`url(#${coffeeLiquidId})`}
        />

        <ellipse
          cx="104"
          cy="66"
          rx="21"
          ry="3.5"
          fill="#D58A50"
          opacity="0.28"
        />

        <path
          d="M106 98C116 86 128 88 134 99C124 111 114 110 106 98Z"
          fill="#C96B2D"
          opacity="0.9"
        />

        <path
          d="M112 101C119 98 124 95 130 92"
          stroke="#FFE1BD"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        <circle cx="91" cy="118" r="4" fill="#E79A58" />
        <circle cx="143" cy="119" r="4" fill="#E79A58" />
      </g>
    </svg>
  );
}

type BeanProps = {
  x: number;
  y: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
};

function CoffeeBean({
  x,
  y,
  scale = 1,
  rotate = 0,
  opacity = 1,
}: BeanProps) {
  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
      opacity={opacity}
    >
      <ellipse
        cx="0"
        cy="0"
        rx="18"
        ry="25"
        fill="#6C2E13"
      />

      <ellipse
        cx="-5"
        cy="-5"
        rx="9"
        ry="16"
        fill="#9A4A20"
        opacity="0.68"
      />

      <path
        d="M0 -21C-7 -11 8 -3 0 8C-5 15 -2 20 1 22"
        fill="none"
        stroke="#D68A4F"
        strokeWidth="2.8"
        strokeLinecap="round"
      />

      <ellipse
        cx="-7"
        cy="-9"
        rx="4"
        ry="8"
        fill="#E3A36A"
        opacity="0.22"
      />
    </g>
  );
}

export function CoffeeBeansArtwork({
  className = "",
}: CoffeeArtworkProps) {
  const reactId = useId().replace(/:/g, "");
  const beanGlowId = `bean-glow-${reactId}`;

  return (
    <svg
      viewBox="0 0 520 220"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={beanGlowId}>
          <stop stopColor="#E4A269" stopOpacity="0.45" />
          <stop offset="1" stopColor="#6E2F15" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse
        cx="285"
        cy="116"
        rx="220"
        ry="108"
        fill={`url(#${beanGlowId})`}
        opacity="0.48"
      />

      <CoffeeBean x={120} y={96} scale={1.12} rotate={-34} />
      <CoffeeBean x={171} y={66} scale={0.84} rotate={24} />
      <CoffeeBean x={220} y={118} scale={1.28} rotate={42} />
      <CoffeeBean x={277} y={67} scale={1.03} rotate={-18} />
      <CoffeeBean x={322} y={125} scale={1.35} rotate={20} />
      <CoffeeBean x={377} y={75} scale={0.92} rotate={50} />
      <CoffeeBean x={420} y={132} scale={1.14} rotate={-30} />
      <CoffeeBean
        x={468}
        y={72}
        scale={0.72}
        rotate={14}
        opacity={0.85}
      />

      <CoffeeBean
        x={77}
        y={151}
        scale={0.65}
        rotate={15}
        opacity={0.72}
      />

      <CoffeeBean
        x={256}
        y={175}
        scale={0.72}
        rotate={-52}
        opacity={0.74}
      />

      <CoffeeBean
        x={390}
        y={180}
        scale={0.58}
        rotate={33}
        opacity={0.62}
      />
    </svg>
  );
}