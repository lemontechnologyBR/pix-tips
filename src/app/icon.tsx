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
          background: "#07070a",
          borderRadius: 112,
          border: "4px solid #38bdf8",
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 800,
            background: "linear-gradient(135deg, #38bdf8, #a78bfa)",
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
