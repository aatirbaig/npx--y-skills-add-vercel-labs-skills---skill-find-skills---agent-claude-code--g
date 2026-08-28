import { ImageResponse } from "next/og";
import { getAllDeals, getDeal } from "@/lib/content/deals";

export const alt = "FoundersBee deal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getAllDeals().map((deal) => ({ slug: deal.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = getDeal(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0c0b09",
          color: "#f6f3ec",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#f5b301",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
          <span style={{ letterSpacing: -0.5 }}>FoundersBee</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 30, color: "#9d9585" }}>{deal?.vendor ?? "Startup deals"}</div>
          <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2, lineHeight: 1.1 }}>
            {deal?.name ?? "Verified startup credits, grants and discounts"}
          </div>
          <div style={{ fontSize: 40, color: "#f5b301" }}>{deal?.value ?? ""}</div>
        </div>

        <div style={{ fontSize: 24, color: "#9d9585" }}>
          Eligibility and fine print stated up front · foundersbee.com
        </div>
      </div>
    ),
    size,
  );
}
