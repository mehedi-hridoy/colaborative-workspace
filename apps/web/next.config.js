const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return {
      beforeFiles: [
        {
          source: "/api/download/:path*",
          destination: `${apiUrl}/download/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;