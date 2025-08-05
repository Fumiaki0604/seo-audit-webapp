const cheerio = require('cheerio');
const fetcher = require('./fetcher');
const metaRules = require('./rules/meta-rules');
const contentRules = require('./rules/content-rules');
const techRules = require('./rules/tech-rules');

class SEOAnalyzer {
  async analyze(url, options = {}) {
    try {
      console.log(`📡 Fetching URL: ${url}`);
      const fetchResult = await fetcher.fetch(url);
      
      if (fetchResult.error) {
        throw new Error(`Failed to fetch URL: ${fetchResult.error}`);
      }

      console.log(`📄 Parsing HTML (${fetchResult.html.length} characters)`);
      const $ = cheerio.load(fetchResult.html);
      
      const results = {
        url: fetchResult.url,
        finalUrl: fetchResult.finalUrl,
        statusCode: fetchResult.statusCode,
        loadTime: fetchResult.loadTime,
        redirects: fetchResult.redirects,
        timestamp: new Date().toISOString(),
        
        // SEO analysis results
        meta: metaRules.analyze($, url),
        content: contentRules.analyze($, url, fetchResult.html),
        technical: techRules.analyze(fetchResult, $),
        
        // Overall scoring
        score: null,
        issues: []
      };

      // Calculate overall score
      results.score = this.calculateScore(results);
      
      // Collect issues
      results.issues = this.collectIssues(results);

      console.log(`🎯 Analysis completed. Score: ${results.score}/100`);
      console.log(`⚠️  Issues found: ${results.issues.length}`);

      return results;
      
    } catch (error) {
      console.error('SEO Analysis Error:', error.message);
      throw new Error(`SEO analysis failed: ${error.message}`);
    }
  }

  calculateScore(results) {
    let totalScore = 0;
    let maxScore = 0;

    // Meta tags scoring (weight: 40%)
    const metaWeight = 0.4;
    totalScore += results.meta.score * metaWeight;
    maxScore += 100 * metaWeight;

    // Content scoring (weight: 35%)
    const contentWeight = 0.35;
    totalScore += results.content.score * contentWeight;
    maxScore += 100 * contentWeight;

    // Technical scoring (weight: 25%)
    const techWeight = 0.25;
    totalScore += results.technical.score * techWeight;
    maxScore += 100 * techWeight;

    return Math.round((totalScore / maxScore) * 100);
  }

  collectIssues(results) {
    const issues = [];

    // Collect meta issues
    if (results.meta.issues) {
      issues.push(...results.meta.issues);
    }
    
    // Collect content issues
    if (results.content.issues) {
      issues.push(...results.content.issues);
    }
    
    // Collect technical issues
    if (results.technical.issues) {
      issues.push(...results.technical.issues);
    }

    return issues.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  // Utility method for testing
  async testConnection() {
    try {
      const result = await this.analyze('https://example.com');
      return {
        success: true,
        testResult: {
          score: result.score,
          loadTime: result.loadTime,
          issuesCount: result.issues.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new SEOAnalyzer();