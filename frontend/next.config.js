module.exports = {
  reactStrictMode: true,
  i18n: {
    locales: ['en', 'bn'],
    defaultLocale: 'en'
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*'
      },
      {
        source: '/images/:path*',
        destination: 'http://localhost:4000/images/:path*'
      }
    ];
  }
};
