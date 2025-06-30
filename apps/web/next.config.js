/** @type {import("next").NextConfig} */
const config = {
  transpilePackages: ["@repo/ui"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ludus-goinglive.s3.us-east-1.amazonaws.com",
        pathname: "**",
      },
    ],
  },
  redirects: async () => [
    {
      source: "/course-builder/:courseId",
      destination: "/course-builder/:courseId/basic",
      permanent: true,
    },
  ],
};

export default config;
