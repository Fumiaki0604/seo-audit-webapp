class MetaRules {
  analyze($, url) {
    const results = {
      title: this.analyzeTitle($),
      description: this.analyzeDescription($),
      keywords: this.analyzeKeywords($),
      canonical: this.analyzeCanonical($, url),
      openGraph: this.analyzeOpenGraph($),
      twitterCard: this.analyzeTwitterCard($),
      score: 0,
      issues: []
    };

    results.score = this.calculateScore(results);
    results.issues = this.collectIssues(results);

    return results;
  }

  analyzeTitle($) {
    const titleElement = $('title').first();
    const title = titleElement.text().trim();
    
    return {
      exists: titleElement.length > 0,
      content: title,
      length: title.length,
      isEmpty: !title,
      tooShort: title.length < 30,
      tooLong: title.length > 60,
      optimal: title.length >= 30 && title.length <= 60
    };
  }

  analyzeDescription($) {
    const descElement = $('meta[name="description"]').first();
    const description = descElement.attr('content') || '';
    
    return {
      exists: descElement.length > 0,
      content: description,
      length: description.length,
      isEmpty: !description,
      tooShort: description.length < 120,
      tooLong: description.length > 160,
      optimal: description.length >= 120 && description.length <= 160
    };
  }

  analyzeKeywords($) {
    const keywordsElement = $('meta[name="keywords"]').first();
    const keywords = keywordsElement.attr('content') || '';
    
    return {
      exists: keywordsElement.length > 0,
      content: keywords,
      count: keywords ? keywords.split(',').length : 0
    };
  }

  analyzeCanonical($, url) {
    const canonicalElement = $('link[rel="canonical"]').first();
    const canonical = canonicalElement.attr('href') || '';
    
    return {
      exists: canonicalElement.length > 0,
      url: canonical,
      selfReferencing: canonical === url
    };
  }

  analyzeOpenGraph($) {
    const ogTags = {};
    $('meta[property^="og:"]').each((i, element) => {
      const property = $(element).attr('property');
      const content = $(element).attr('content');
      ogTags[property] = content;
    });

    return {
      exists: Object.keys(ogTags).length > 0,
      tags: ogTags,
      hasTitle: !!ogTags['og:title'],
      hasDescription: !!ogTags['og:description'],
      hasImage: !!ogTags['og:image'],
      hasUrl: !!ogTags['og:url']
    };
  }

  analyzeTwitterCard($) {
    const twitterTags = {};
    $('meta[name^="twitter:"]').each((i, element) => {
      const name = $(element).attr('name');
      const content = $(element).attr('content');
      twitterTags[name] = content;
    });

    return {
      exists: Object.keys(twitterTags).length > 0,
      tags: twitterTags,
      hasCard: !!twitterTags['twitter:card'],
      hasTitle: !!twitterTags['twitter:title'],
      hasDescription: !!twitterTags['twitter:description'],
      hasImage: !!twitterTags['twitter:image']
    };
  }

  calculateScore(results) {
    let score = 0;
    let maxScore = 0;

    // Title (25 points)
    maxScore += 25;
    if (results.title.exists && !results.title.isEmpty) {
      if (results.title.optimal) {
        score += 25;
      } else if (results.title.tooShort || results.title.tooLong) {
        score += 15;
      } else {
        score += 20;
      }
    }

    // Description (25 points)
    maxScore += 25;
    if (results.description.exists && !results.description.isEmpty) {
      if (results.description.optimal) {
        score += 25;
      } else if (results.description.tooShort || results.description.tooLong) {
        score += 15;
      } else {
        score += 20;
      }
    }

    // Canonical (10 points)
    maxScore += 10;
    if (results.canonical.exists) {
      score += 10;
    }

    // Open Graph (20 points)
    maxScore += 20;
    if (results.openGraph.exists) {
      let ogScore = 5; // Base points for existence
      if (results.openGraph.hasTitle) ogScore += 5;
      if (results.openGraph.hasDescription) ogScore += 5;
      if (results.openGraph.hasImage) ogScore += 5;
      score += ogScore;
    }

    // Twitter Card (20 points)
    maxScore += 20;
    if (results.twitterCard.exists) {
      let twitterScore = 5; // Base points for existence
      if (results.twitterCard.hasCard) twitterScore += 5;
      if (results.twitterCard.hasTitle) twitterScore += 5;
      if (results.twitterCard.hasDescription) twitterScore += 5;
      score += twitterScore;
    }

    return Math.round((score / maxScore) * 100);
  }

  collectIssues(results) {
    const issues = [];

    // Title issues
    if (!results.title.exists || results.title.isEmpty) {
      issues.push({
        type: 'meta',
        severity: 'critical',
        message: 'titleタグが設定されていません'
      });
    } else if (results.title.tooShort) {
      issues.push({
        type: 'meta',
        severity: 'warning',
        message: `titleタグが短すぎます (${results.title.length}文字、推奨: 30-60文字)`
      });
    } else if (results.title.tooLong) {
      issues.push({
        type: 'meta',
        severity: 'warning',
        message: `titleタグが長すぎます (${results.title.length}文字、推奨: 30-60文字)`
      });
    }

    // Description issues
    if (!results.description.exists || results.description.isEmpty) {
      issues.push({
        type: 'meta',
        severity: 'critical',
        message: 'meta descriptionが設定されていません'
      });
    } else if (results.description.tooShort) {
      issues.push({
        type: 'meta',
        severity: 'warning',
        message: `meta descriptionが短すぎます (${results.description.length}文字、推奨: 120-160文字)`
      });
    } else if (results.description.tooLong) {
      issues.push({
        type: 'meta',
        severity: 'warning',
        message: `meta descriptionが長すぎます (${results.description.length}文字、推奨: 120-160文字)`
      });
    }

    // Canonical issues
    if (!results.canonical.exists) {
      issues.push({
        type: 'meta',
        severity: 'info',
        message: 'canonicalタグが設定されていません'
      });
    }

    // Open Graph issues
    if (!results.openGraph.exists) {
      issues.push({
        type: 'meta',
        severity: 'info',
        message: 'Open Graphタグが設定されていません'
      });
    } else {
      if (!results.openGraph.hasTitle) {
        issues.push({
          type: 'meta',
          severity: 'info',
          message: 'og:titleが設定されていません'
        });
      }
      if (!results.openGraph.hasDescription) {
        issues.push({
          type: 'meta',
          severity: 'info',
          message: 'og:descriptionが設定されていません'
        });
      }
      if (!results.openGraph.hasImage) {
        issues.push({
          type: 'meta',
          severity: 'info',
          message: 'og:imageが設定されていません'
        });
      }
    }

    // Twitter Card issues
    if (!results.twitterCard.exists) {
      issues.push({
        type: 'meta',
        severity: 'info',
        message: 'Twitter Cardタグが設定されていません'
      });
    }

    return issues;
  }
}

module.exports = new MetaRules();