/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['nanoid'],
  devIndicators: false,
  webpack : webpackConfig => {
    webpackConfig.resolve.extensionAlias = { 
      ".js": [ ".ts", ".js"],
      ".jsx": [ ".tsx", ".jsx"],
      ".mjs": [ ".mts", ".mjs"],
      ".cjs": [ ".cts", ".cjs"]
    }
    return webpackConfig;
  }
}
 
module.exports = nextConfig
