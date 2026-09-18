import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  async headers() {
    return [
      {
        // এমবেডেড-প্রিভিউ (iframe) ও ক্রস-অরিজিন পরিবেশে API-অ্যাক্সেস-সেফ হেডার।
        // নোট: Access-Control-Allow-Credentials:true ইচ্ছাকৃত বাদ — '*' অরিজিনের
        // সাথে স্পেক-অসঙ্গত (ব্রাউজার প্রত্যাখ্যান করে); অ্যাপ সেম-অরিজিন কুকি ব্যবহার
        // করে বলে CORS-ক্রেডেনশিয়াল প্রাসঙ্গিকই নয়।
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
      {
        // আপলোড করা অডিও/মিডিয়া আইফ্রেমে স্ট্রিম-সেফ হোক
        source: "/uploads/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
