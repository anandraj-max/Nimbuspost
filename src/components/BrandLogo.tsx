import { LOGO_ASPECT, LOGO_DARK_SRC, LOGO_LIGHT_SRC } from "@/lib/brand";

/**
 * The NimbusPost lockup.
 *
 * Uses the official artwork from `public/` (see `LOGO_LIGHT_SRC` /
 * `LOGO_DARK_SRC` in src/lib/brand.ts). If either is set to null, a
 * hand-built vector mark stands in for that tone.
 */
export function BrandLogo({
  height = 34,
  tone = "light",
  className = "",
}: {
  /** Rendered height in px. */
  height?: number;
  /** "light" = white mark for the blue header, "dark" = blue mark on white. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const src = tone === "light" ? LOGO_LIGHT_SRC : LOGO_DARK_SRC;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="NimbusPost"
        width={Math.round(height * LOGO_ASPECT)}
        height={height}
        style={{ height, width: height * LOGO_ASPECT, display: "block" }}
        className={className}
      />
    );
  }

  return <FallbackMark height={height} tone={tone} className={className} />;
}

/** Vector stand-in, used only when a logo file is missing. */
function FallbackMark({
  height,
  tone,
  className,
}: {
  height: number;
  tone: "light" | "dark";
  className: string;
}) {
  const color = tone === "light" ? "#ffffff" : "#1d4ed8";
  const wordColor = tone === "light" ? "#ffffff" : "#0f2a63";
  const scale = height / 34;

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ height, gap: 8 * scale }}
      aria-label="NimbusPost"
    >
      <svg
        width={36 * scale}
        height={24 * scale}
        viewBox="0 0 36 24"
        fill="none"
        aria-hidden="true"
      >
        <g fill={color}>
          <circle cx="17" cy="11" r="7" />
          <circle cx="25.5" cy="13.5" r="5.5" />
          <circle cx="12.5" cy="15" r="5" />
          <rect x="12" y="14" width="19" height="5" rx="2.5" />
          <rect x="0" y="7.5" width="8" height="2" rx="1" opacity="0.75" />
          <rect x="2.5" y="12.5" width="6" height="2" rx="1" opacity="0.55" />
          <rect x="0.5" y="17.5" width="9" height="2" rx="1" opacity="0.4" />
        </g>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        <span style={{ color: wordColor, fontWeight: 700, fontSize: 16 * scale }}>
          Nimbus
        </span>
        <span
          style={{
            color: wordColor,
            fontWeight: 700,
            fontSize: 16 * scale,
            marginTop: 1 * scale,
          }}
        >
          Post
        </span>
      </div>
    </div>
  );
}
