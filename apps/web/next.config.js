const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "placehold.co",
            },
        ],
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
};
export default nextConfig;
