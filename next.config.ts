import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The catalog is read from disk at runtime, and Next's tracer cannot see
  // through `fs.readdirSync`. Without this the markdown is missing in a
  // serverless deploy.
  outputFileTracingIncludes: {
    "/**": ["./content/deals/**/*.md"],
  },
};

export default nextConfig;
