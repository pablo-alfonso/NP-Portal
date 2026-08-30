/** @type {import('next').NextConfig} */
const isGitHubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig = {
  output: 'export',
  basePath: isGitHubPages ? '/NP-Portal' : '',
  assetPrefix: isGitHubPages ? '/NP-Portal/' : '',
  images: { unoptimized: true },
};

export default nextConfig;
