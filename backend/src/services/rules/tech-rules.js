class TechnicalRules {
  analyze(fetchResult, $) {
    const results = {
      https: this.analyzeHTTPS(fetchResult.finalUrl || fetchResult.url),
      loadTime: this.analyzeLoadTime(fetchResult.loadTime),
      redirects: this.analyzeRedirects(fetchResult.redirects),
      statusCode: this.analyzeStatusCode(fetchResult.statusCode),
      responsive: this.analyzeResponsive($),
      structuredData: this.analyzeStructuredData($),
      robotsMeta: this.analyzeRobotsMeta($),
      score: 0,
      issues: []
    };

    results.score = this.calculateScore(results);
    results.issues = this.collectIssues(results);

    return results;
  }

  analyzeHTTPS(url) {
    const isHTTPS = url.startsWith('https://');
    return {
      isHTTPS,
      protocol: isHTTPS ? 'https' : 'http'
    };
  }

  analyzeLoadTime(loadTime) {
    if (!loadTime) {
      return {
        time: null,
        fast: false,
        acceptable: false,
        slow: true
      };
    }

    return {
      time: loadTime,
      fast: loadTime < 1000,
      acceptable: loadTime < 3000,
      slow: loadTime >= 3000
    };
  }

  analyzeRedirects(redirectCount) {
    return {
      count: redirectCount || 0,
      hasRedirects: (redirectCount || 0) > 0,
      excessive: (redirectCount || 0) > 3
    };
  }

  analyzeStatusCode(statusCode) {
    return {
      code: statusCode,
      success: statusCode >= 200 && statusCode < 300,
      redirect: statusCode >= 300 && statusCode < 400,
      clientError: statusCode >= 400 && statusCode < 500,
      serverError: statusCode >= 500
    };
  }

  analyzeResponsive($) {
    const viewportMeta = $('meta[name="viewport"]').first();
    const viewportContent = viewportMeta.attr('content') || '';
    
    return {
      hasViewportMeta: viewportMeta.length > 0,
      viewportContent,
      hasWidthDevice: viewportContent.includes('width=device-width'),
      hasInitialScale: viewportContent.includes('initial-scale=1'),
      optimal: viewportContent.includes('width=device-width') && viewportContent.includes('initial-scale=1')
    };
  }

  analyzeStructuredData($) {
    const jsonLdScripts = [];
    const microdataElements = [];

    // JSON-LD structured data
    $('script[type="application/ld+json"]').each((index, element) => {
      const content = $(element).html();
      try {
        const data = JSON.parse(content);
        jsonLdScripts.push({
          type: data['@type'] || 'Unknown',
          context: data['@context'] || 'Unknown',
          valid: true,
          content: data
        });
      } catch (error) {
        jsonLdScripts.push({
          type: 'Invalid',
          valid: false,
          error: error.message
        });
      }
    });

    // Microdata
    $('[itemscope]').each((index, element) => {
      const itemType = $(element).attr('itemtype') || '';
      const itemProps = [];
      
      $(element).find('[itemprop]').each((i, prop) => {
        itemProps.push($(prop).attr('itemprop'));
      });

      microdataElements.push({
        itemType,
        properties: itemProps
      });
    });

    return {
      hasJsonLd: jsonLdScripts.length > 0,
      hasMicrodata: microdataElements.length > 0,
      jsonLdCount: jsonLdScripts.length,
      microdataCount: microdataElements.length,
      jsonLd: jsonLdScripts,
      microdata: microdataElements
    };
  }

  analyzeRobotsMeta($) {
    const robotsMeta = $('meta[name="robots"]').first();
    const content = robotsMeta.attr('content') || '';
    
    const directives = content.split(',').map(d => d.trim().toLowerCase());
    
    return {
      exists: robotsMeta.length > 0,
      content,
      directives,
      noindex: directives.includes('noindex'),
      nofollow: directives.includes('nofollow'),
      noarchive: directives.includes('noarchive'),
      nosnippet: directives.includes('nosnippet')
    };
  }

  calculateScore(results) {
    let score = 0;
    let maxScore = 0;

    // HTTPS (25 points)
    maxScore += 25;
    if (results.https.isHTTPS) {
      score += 25;
    }

    // Load time (25 points)
    maxScore += 25;
    if (results.loadTime.fast) {
      score += 25;
    } else if (results.loadTime.acceptable) {
      score += 15;
    } else if (results.loadTime.time) {
      score += 5;
    }

    // Status code (20 points)
    maxScore += 20;
    if (results.statusCode.success) {
      score += 20;
    } else if (results.statusCode.redirect) {
      score += 10;
    }

    // Responsive (15 points)
    maxScore += 15;
    if (results.responsive.optimal) {
      score += 15;
    } else if (results.responsive.hasViewportMeta) {
      score += 10;
    }

    // Redirects (10 points)
    maxScore += 10;
    if (results.redirects.count === 0) {
      score += 10;
    } else if (!results.redirects.excessive) {
      score += 5;
    }

    // Structured data (5 points)
    maxScore += 5;
    if (results.structuredData.hasJsonLd || results.structuredData.hasMicrodata) {
      score += 5;
    }

    return Math.round((score / maxScore) * 100);
  }

  collectIssues(results) {
    const issues = [];

    // HTTPS issues
    if (!results.https.isHTTPS) {
      issues.push({
        type: 'technical',
        severity: 'critical',
        message: 'HTTPSが使用されていません'
      });
    }

    // Load time issues
    if (results.loadTime.slow) {
      issues.push({
        type: 'technical',
        severity: 'warning',
        message: `ページの読み込みが遅いです (${results.loadTime.time}ms、推奨: 3秒以内)`
      });
    } else if (!results.loadTime.fast && results.loadTime.time) {
      issues.push({
        type: 'technical',
        severity: 'info',
        message: `ページの読み込み時間を改善できます (${results.loadTime.time}ms、理想: 1秒以内)`
      });
    }

    // Status code issues
    if (results.statusCode.clientError) {
      issues.push({
        type: 'technical',
        severity: 'critical',
        message: `クライアントエラーが発生しています (${results.statusCode.code})`
      });
    } else if (results.statusCode.serverError) {
      issues.push({
        type: 'technical',
        severity: 'critical',
        message: `サーバーエラーが発生しています (${results.statusCode.code})`
      });
    } else if (results.statusCode.redirect) {
      issues.push({
        type: 'technical',
        severity: 'info',
        message: `リダイレクトが発生しています (${results.statusCode.code})`
      });
    }

    // Redirect issues
    if (results.redirects.excessive) {
      issues.push({
        type: 'technical',
        severity: 'warning',
        message: `リダイレクトが多すぎます (${results.redirects.count}回、推奨: 3回以内)`
      });
    } else if (results.redirects.hasRedirects) {
      issues.push({
        type: 'technical',
        severity: 'info',
        message: `リダイレクトが発生しています (${results.redirects.count}回)`
      });
    }

    // Responsive issues
    if (!results.responsive.hasViewportMeta) {
      issues.push({
        type: 'technical',
        severity: 'warning',
        message: 'viewportメタタグが設定されていません'
      });
    } else if (!results.responsive.optimal) {
      issues.push({
        type: 'technical',
        severity: 'info',
        message: 'viewportメタタグの設定を最適化できます'
      });
    }

    // Robots meta issues
    if (results.robotsMeta.noindex) {
      issues.push({
        type: 'technical',
        severity: 'warning',
        message: 'robots meta tagでnoindexが設定されています'
      });
    }

    // Structured data info
    if (!results.structuredData.hasJsonLd && !results.structuredData.hasMicrodata) {
      issues.push({
        type: 'technical',
        severity: 'info',
        message: '構造化データが設定されていません'
      });
    }

    return issues;
  }
}

module.exports = new TechnicalRules();