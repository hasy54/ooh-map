import { ImageResponse } from "next/og"

export const runtime = "edge"

export const alt = "OOH Advertising India - Find & Book Billboards Across India"
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        fontSize: 48,
        background: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 48,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Yash-ads-logo-oWJjuiHG03seE3h41DtvRYqmYdE4JN.png"
          alt="Yash Ads Logo"
          width={120}
          height={120}
          style={{ marginRight: 24 }}
        />
        <h1 style={{ color: "#1a1a1a", margin: 0 }}>OOH Advertising India</h1>
      </div>
      <p style={{ fontSize: 28, color: "#4a4a4a", textAlign: "center", margin: 0 }}>
        Find & Book Billboards Across India – Easy, Fast, Everywhere
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
          marginTop: 36,
        }}
      >
        <div style={{ background: "#f0f0f0", padding: "8px 16px", borderRadius: 8, fontSize: 24 }}>Mumbai</div>
        <div style={{ background: "#f0f0f0", padding: "8px 16px", borderRadius: 8, fontSize: 24 }}>Delhi</div>
        <div style={{ background: "#f0f0f0", padding: "8px 16px", borderRadius: 8, fontSize: 24 }}>Bangalore</div>
        <div style={{ background: "#f0f0f0", padding: "8px 16px", borderRadius: 8, fontSize: 24 }}>Hyderabad</div>
      </div>
    </div>,
    { ...size },
  )
}
