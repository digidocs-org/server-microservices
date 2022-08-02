export const ROUTES = [
  {
    url: '/api/v1/auth',
    auth: false,
    rateLimit: {
      windowMs: 15 * 60 * 1000,
      max: 5,
    },
    proxy: {
      target: 'https://www.google.com',
      changeOrigin: true,
      pathRewrite: {
        [`^/free`]: '',
      },
    },
  },
];
