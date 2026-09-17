// Charming hand-drawn style mascot marginalia component inspired by DESIGN.md
// Represents the PAIMANA Surveyor Hedgehog / Engineering Mascot in various poses

export default function Mascot({ pose = 'hardhat', size = 48, className = '' }) {
  if (pose === 'hardhat') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`mascot mascot-hardhat ${className}`}
        aria-hidden="true"
      >
        {/* Hedgehog Spines */}
        <path
          d="M12 40C8 36 6 28 10 22C14 16 22 14 26 14C24 10 32 6 38 8C44 10 46 16 48 20"
          stroke="#33342d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="#c59b27"
        />
        <path
          d="M14 26L8 22M18 18L14 12M28 12L28 6M38 12L42 6M10 34L4 32"
          stroke="#33342d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Body */}
        <path
          d="M14 38C14 28 22 22 34 22C46 22 54 30 54 42C54 50 46 54 34 54C22 54 14 48 14 38Z"
          fill="#e5c158"
          stroke="#23251d"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Belly patch */}
        <path
          d="M26 36C26 30 32 28 38 28C44 28 48 34 48 42C48 48 42 50 36 50C30 50 26 44 26 36Z"
          fill="#fbf4d7"
        />

        {/* Snout & Nose */}
        <path
          d="M48 38C52 38 58 40 60 41C58 43 52 45 48 45"
          fill="#e5c158"
          stroke="#23251d"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="59" cy="41" r="2.5" fill="#23251d" />

        {/* Eye */}
        <circle cx="44" cy="34" r="2.5" fill="#23251d" />
        <circle cx="45" cy="33" r="0.8" fill="#ffffff" />

        {/* Cheerful Smile */}
        <path
          d="M48 42C46 44 43 44 41 43"
          stroke="#23251d"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Yellow Safety Hard Hat */}
        <path
          d="M26 24C26 17 32 14 40 14C48 14 52 18 52 24Z"
          fill="#f7a501"
          stroke="#23251d"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 24C30 23 48 23 56 24"
          stroke="#23251d"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <rect x="36" y="16" width="5" height="7" rx="1.5" fill="#ffffff" stroke="#23251d" strokeWidth="1.5" />

        {/* Feet */}
        <ellipse cx="24" cy="54" rx="4" ry="2.5" fill="#c59b27" stroke="#23251d" strokeWidth="2" />
        <ellipse cx="44" cy="54" rx="4" ry="2.5" fill="#c59b27" stroke="#23251d" strokeWidth="2" />

        {/* Clipboard held in hand */}
        <rect x="42" y="38" width="10" height="13" rx="1.5" fill="#ffffff" stroke="#23251d" strokeWidth="1.8" transform="rotate(8 42 38)" />
        <rect x="45" y="36.5" width="4" height="2" rx="0.5" fill="#f7a501" stroke="#23251d" strokeWidth="1" transform="rotate(8 45 36.5)" />
        <line x1="45" y1="42" x2="49" y2="42.5" stroke="#6c6e63" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="45" y1="45" x2="49" y2="45.5" stroke="#6c6e63" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (pose === 'terminal') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`mascot mascot-terminal ${className}`}
        aria-hidden="true"
      >
        {/* Spines */}
        <path
          d="M8 36C4 28 8 16 18 12C26 8 36 10 40 16"
          stroke="#23251d"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="#c59b27"
        />
        <path d="M10 20L4 16M18 12L16 6M28 8L30 3M38 12L44 8" stroke="#23251d" strokeWidth="2.5" strokeLinecap="round" />

        {/* Body */}
        <path
          d="M12 36C12 26 20 22 30 22C42 22 48 28 48 40C48 48 40 52 30 52C18 52 12 46 12 36Z"
          fill="#e5c158"
          stroke="#23251d"
          strokeWidth="2.5"
        />

        {/* Reading Glasses */}
        <circle cx="36" cy="30" r="4.5" fill="rgba(255,255,255,0.7)" stroke="#23251d" strokeWidth="2" />
        <circle cx="45" cy="30" r="4.5" fill="rgba(255,255,255,0.7)" stroke="#23251d" strokeWidth="2" />
        <path d="M40.5 30H41.5" stroke="#23251d" strokeWidth="2" />

        <circle cx="37" cy="30" r="1.8" fill="#23251d" />
        <circle cx="46" cy="30" r="1.8" fill="#23251d" />

        {/* Nose */}
        <circle cx="53" cy="35" r="2.2" fill="#23251d" />

        {/* Terminal / Laptop Screen */}
        <rect x="36" y="34" width="22" height="15" rx="2" fill="#23251d" stroke="#33342d" strokeWidth="2" />
        <rect x="38" y="36" width="18" height="11" rx="1" fill="#1078a3" />
        {/* Terminal code lines */}
        <line x1="40" y1="39" x2="47" y2="39" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="40" y1="42" x2="52" y2="42" stroke="#f7a501" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="40" y1="45" x2="49" y2="45" stroke="#2c8c66" strokeWidth="1.2" strokeLinecap="round" />

        {/* Laptop Keyboard Base */}
        <path d="M32 49L58 49L55 53L35 53Z" fill="#bfc1b7" stroke="#23251d" strokeWidth="1.5" />
      </svg>
    );
  }

  if (pose === 'magnifying') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`mascot mascot-magnifying ${className}`}
        aria-hidden="true"
      >
        {/* Spines */}
        <path d="M10 38C6 32 8 20 18 14C26 10 36 12 40 18" stroke="#23251d" strokeWidth="2.5" fill="#c59b27" />
        <path d="M12 24L6 20M20 14L18 8M30 10L32 4" stroke="#23251d" strokeWidth="2.5" strokeLinecap="round" />

        {/* Body */}
        <path
          d="M12 38C12 26 22 22 34 22C44 22 50 30 50 42C50 50 42 54 32 54C20 54 12 48 12 38Z"
          fill="#e5c158"
          stroke="#23251d"
          strokeWidth="2.5"
        />

        {/* Eye */}
        <circle cx="40" cy="32" r="2.5" fill="#23251d" />
        <circle cx="41" cy="31" r="0.8" fill="#ffffff" />
        <circle cx="50" cy="38" r="2.2" fill="#23251d" />

        {/* Large Magnifying Glass */}
        <circle cx="46" cy="30" r="10" fill="rgba(220, 234, 246, 0.4)" stroke="#1d4ed8" strokeWidth="3" />
        <path d="M53 37L61 46" stroke="#23251d" strokeWidth="4" strokeLinecap="round" />
        <path d="M43 27C44 25 47 25 49 27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  // Fallback / default: pose === 'chart'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mascot mascot-chart ${className}`}
      aria-hidden="true"
    >
      <path d="M10 38C6 30 10 18 20 14C28 10 38 12 42 18" stroke="#23251d" strokeWidth="2.5" fill="#c59b27" />
      <path
        d="M12 38C12 26 22 22 34 22C44 22 50 30 50 42C50 50 42 54 32 54C20 54 12 48 12 38Z"
        fill="#e5c158"
        stroke="#23251d"
        strokeWidth="2.5"
      />
      <circle cx="42" cy="32" r="2.5" fill="#23251d" />
      <circle cx="51" cy="38" r="2.2" fill="#23251d" />
      {/* Chart board held */}
      <rect x="36" y="32" width="22" height="18" rx="2" fill="#ffffff" stroke="#23251d" strokeWidth="2" />
      <path d="M40 45L44 41L48 43L53 37" stroke="#cd4239" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="53" cy="37" r="1.5" fill="#cd4239" />
    </svg>
  );
}
