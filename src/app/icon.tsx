import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #030712 0%, #1e1b4b 100%)",
          borderRadius: 112,
          border: "4px solid #06b6d4",
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 800,
            background: "linear-gradient(135deg, #22d3ee, #a855f7)",
            backgroundClip: "text",
            color: "transparent",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          p
        </div>
      </div>
    ),
    { ...size },
  );
}
