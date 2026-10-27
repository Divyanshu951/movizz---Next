export default function MovizzLogo() {
  return (
    <div className="flex justify-center select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 170 70"
        className="h-auto w-48 cursor-pointer drop-shadow-2xl transition-transform duration-500 hover:scale-105 md:w-64"
        aria-label="Movizz Logo"
      >
        {/* === MOV (White Segment) === */}
        {/* Letter M */}
        <polygon
          points="0,40 0,10 6,10 16,26 26,10 32,10 32,40 26,40 26,20 16,36 6,20 6,40"
          fill="#ffffff"
        />

        {/* Letter O (Custom Ring with Play Button inside) */}
        <circle
          cx="50"
          cy="25"
          r="11"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
        />
        <polygon points="47,18 58,25 47,32" fill="#f5c518" />

        {/* Letter V */}
        <polygon points="68,10 75,10 83,28 91,10 98,10 83,40" fill="#ffffff" />

        {/* === IZZ (Yellow Film Strip Segment) === */}
        {/* Letter I */}
        <polygon points="104,10 110,10 110,40 104,40" fill="#f5c518" />

        {/* Letter Z (First) */}
        <polygon
          points="116,10 136,10 136,16 122,34 136,34 136,40 116,40 116,34 130,16 116,16"
          fill="#f5c518"
        />

        {/* Letter Z (Second) */}
        <polygon
          points="142,10 162,10 162,16 148,34 162,34 162,40 142,40 142,34 156,16 142,16"
          fill="#f5c518"
        />

        {/* Film Strip Holes (Top) */}
        <g fill="#f5c518">
          <rect x="104" y="0" width="4" height="4" />
          <rect x="113" y="0" width="4" height="4" />
          <rect x="122" y="0" width="4" height="4" />
          <rect x="131" y="0" width="4" height="4" />
          <rect x="140" y="0" width="4" height="4" />
          <rect x="149" y="0" width="4" height="4" />
          <rect x="158" y="0" width="4" height="4" />
        </g>

        {/* Film Strip Holes (Bottom) */}
        <g fill="#f5c518">
          <rect x="104" y="46" width="4" height="4" />
          <rect x="113" y="46" width="4" height="4" />
          <rect x="122" y="46" width="4" height="4" />
          <rect x="131" y="46" width="4" height="4" />
          <rect x="140" y="46" width="4" height="4" />
          <rect x="149" y="46" width="4" height="4" />
          <rect x="158" y="46" width="4" height="4" />
        </g>

        {/* === Subtitle === */}
        <text
          x="81"
          y="66"
          fontFamily="ui-sans-serif, system-ui, -apple-system, sans-serif"
          fontSize="7"
          fontWeight="800"
          letterSpacing="3"
          fill="#a1a1aa"
          textAnchor="middle"
        >
          CINEMATIC BUZZ
        </text>
      </svg>
    </div>
  );
}
