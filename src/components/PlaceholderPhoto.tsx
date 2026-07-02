interface PlaceholderPhotoProps {
  size?: number;
  radius?: number;
  url?: string | null;
}

export function PlaceholderPhoto({ size = 46, radius = 11, url }: PlaceholderPhotoProps) {
  if (url) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          flexShrink: 0,
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        flexShrink: 0,
        background: "#EBE2D2",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48">
        <circle cx="24" cy="19" r="8.5" fill="#CDBFA8" />
        <path d="M9 44 C9 32 39 32 39 44 Z" fill="#CDBFA8" />
      </svg>
    </div>
  );
}
