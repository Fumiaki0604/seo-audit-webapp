const fetch = require('node-fetch');

class Fetcher {
  constructor() {
    this.timeout = 10000; // 10 seconds
    this.userAgent = 'SEO-Audit-Tool/1.0.0';
  }

  async fetch(url) {
    try {
      const startTime = Date.now();
      
      const AbortController = require('abort-controller');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        redirect: 'follow',
        follow: 5
      });

      clearTimeout(timeoutId);

      const loadTime = Date.now() - startTime;
      const html = await response.text();

      return {
        url,
        finalUrl: response.url,
        statusCode: response.status,
        headers: response.headers.raw(),
        html,
        loadTime,
        redirects: response.redirected ? 1 : 0
      };

    } catch (error) {
      if (error.name === 'FetchError') {
        return {
          url,
          error: error.message,
          loadTime: null
        };
      } else {
        return {
          url,
          error: error.message,
          loadTime: null
        };
      }
    }
  }
}

module.exports = new Fetcher();