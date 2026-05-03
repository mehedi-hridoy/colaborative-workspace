const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/api/download/:path*",
          destination: "http://localhost:5000/api/download/:path*",
        },
      ],
    };
  },
};

export default nextConfig;