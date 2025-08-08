const fetch = require('node-fetch');

class Fetcher {
  constructor() {
    this.timeout = 45000; // 45 seconds - increased for problematic websites
    this.retryAttempts = 2;
    this.retryDelay = 2000; // 2 seconds between retries
  }

  getBrowserHeaders() {
    return {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchWithRetry(url, attempt = 1) {
    try {
      const startTime = Date.now();
      
      const AbortController = require('abort-controller');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: this.getBrowserHeaders(),
        redirect: 'follow',
        follow: 5,
        compress: true
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
      if (attempt <= this.retryAttempts) {
        console.log(`Fetch attempt ${attempt} failed for ${url}, retrying in ${this.retryDelay}ms...`);
        await this.sleep(this.retryDelay);
        return this.fetchWithRetry(url, attempt + 1);
      }

      let errorMessage = error.message;
      
      // Handle specific error types
      if (error.name === 'AbortError' || error.message.includes('user aborted')) {
        errorMessage = `Request timeout after ${this.timeout/1000} seconds`;
      } else if (error.name === 'FetchError') {
        if (error.message.includes('INTERNAL_ERROR')) {
          errorMessage = 'Server connection error (HTTP/2 stream error) - website may have anti-bot protection';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        url,
        error: errorMessage,
        loadTime: null
      };
    }
  }

  async fetch(url) {
    return this.fetchWithRetry(url);
  }
}

module.exports = new Fetcher();