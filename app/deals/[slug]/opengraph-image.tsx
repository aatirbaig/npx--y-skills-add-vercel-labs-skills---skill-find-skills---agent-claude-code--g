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
          background: "#fbf9f4",
          color: "#14110b",
          padding: 76,
          fontFamily: "serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#b8860b",
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
          <span>FoundersBee</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ fontSize: 30, color: "#6e6656", fontFamily: "sans-serif" }}>
            {deal?.vendor ?? "Startup credits, grants & discounts"}
          </div>
          <div style={{ fontSize: 74, letterSpacing: -2, lineHeight: 1.05 }}>
            {deal?.name ?? "Founders leave money on the table"}
          </div>
          <div style={{ fontSize: 40, color: "#7a5a08" }}>{deal?.value ?? ""}</div>
        </div>

        <div
          style={{
            fontSize: 23,
            color: "#6e6656",
            fontFamily: "sans-serif",
            borderTop: "1px solid #e3ddce",
            paddingTop: 22,
          }}
        >
          Eligibility and fine print stated up front · foundersbee.com
        </div>
      </div>
    ),
    size,
  );
}
