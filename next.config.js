const createNextIntlPlugin = require("next-intl/plugin");
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No basePath needed — deployed on subdomain practice.deafened.org
};

module.exports = withNextIntl(nextConfig);
