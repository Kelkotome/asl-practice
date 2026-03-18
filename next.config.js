const redirectsData = require("./data/redirects.json");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No basePath needed — deployed on subdomain practice.deafened.org
  async redirects() {
    return redirectsData.map(({ source, destination }) => ({
      source: `/signs/${source}`,
      destination: `/signs/${destination}`,
      permanent: true,
    }));
  },
};

module.exports = nextConfig;
