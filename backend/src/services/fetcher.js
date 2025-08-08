const fetch = require('node-fetch');

class Fetcher {
  constructor() {
    this.timeout = 30000; // 30 seconds - increased for heavy websites
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
      let errorMessage = error.message;
      
      // Handle AbortError specifically  
      if (error.name === 'AbortError' || error.message.includes('user aborted')) {
        errorMessage = `Request timeout after ${this.timeout/1000} seconds`;
      } else if (error.name === 'FetchError') {
        errorMessage = error.message;
      }
      
      return {
        url,
        error: errorMessage,
        loadTime: null
      };
    }
  }
}

module.exports = new Fetcher();