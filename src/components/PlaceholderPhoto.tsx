interface PlaceholderPhotoProps {
  size?: number;
  radius?: number;
  url?: string | null;
  posicao?: string | null;
}

export function PlaceholderPhoto({ size = 46, radius = 11, url, posicao }: PlaceholderPhotoProps) {
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
        {(() => {
          const parts = (posicao ?? "center top").split(" ");
          const posX = parts[0];
          const posY = parts.slice(1).join(" ") || "top";
          const xShift = posX === "25%" ? "12%" : posX === "75%" ? "-12%" : "0%";
          const hasHoriz = posX !== "center" && posX !== "50%";
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: `center ${posY}`,
                ...(hasHoriz ? { transform: `scale(1.3) translateX(${xShift})` } : {}),
              }}
            />
          );
        })()}
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
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/mascote.png"
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
      />
    </div>
  );
}
