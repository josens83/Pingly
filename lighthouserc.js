// Lighthouse CI Configuration
// Elite Performance Standards

module.exports = {
  ci: {
    collect: {
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/register',
      ],
      // Start server command
      startServerCommand: 'npm run start',
      // Wait for server to be ready
      startServerReadyPattern: 'ready on',
      // Number of runs for each URL
      numberOfRuns: 3,
      // Settings for collection
      settings: {
        preset: 'desktop',
        // Throttling settings
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      // Elite performance assertions
      assertions: {
        // Performance Score (>= 90)
        'categories:performance': ['error', { minScore: 0.9 }],
        // Accessibility Score (>= 90)
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Best Practices Score (>= 90)
        'categories:best-practices': ['error', { minScore: 0.9 }],
        // SEO Score (>= 90)
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        // Largest Contentful Paint (< 2.5s)
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        // First Input Delay / Total Blocking Time (< 200ms)
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
        // Cumulative Layout Shift (< 0.1)
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        // First Contentful Paint (< 1.8s)
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        // Speed Index (< 3.4s)
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        // Time to Interactive (< 3.8s)
        'interactive': ['warn', { maxNumericValue: 3800 }],

        // Resource optimization
        'uses-text-compression': 'error',
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn',
        'uses-webp-images': 'warn',
        'uses-rel-preconnect': 'warn',
        'render-blocking-resources': 'warn',

        // Security
        'is-on-https': 'off', // Local testing
        'uses-http2': 'off', // Local testing
      },
    },
    upload: {
      // Upload target
      target: 'temporary-public-storage',
    },
  },
}
