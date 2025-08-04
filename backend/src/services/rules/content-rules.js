class ContentRules {
  analyze($, url) {
    const results = {
      textLength: this.analyzeTextLength($),
      headings: this.analyzeHeadings($),
      images: this.analyzeImages($),
      links: this.analyzeLinks($, url),
      keywords: this.analyzeKeywordDensity($),
      score: 0,
      issues: []
    };

    results.score = this.calculateScore(results);
    results.issues = this.collectIssues(results);

    return results;
  }

  analyzeTextLength($) {
    // Remove script and style content
    $('script, style').remove();
    
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    const length = textContent.length;
    
    return {
      total: length,
      tooShort: length < 300,
      optimal: length >= 300,
      content: textContent.substring(0, 200) + (textContent.length > 200 ? '...' : '')
    };
  }

  analyzeHeadings($) {
    const headings = {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: []
    };

    for (let i = 1; i <= 6; i++) {
      $(`h${i}`).each((index, element) => {
        const text = $(element).text().trim();
        headings[`h${i}`].push({
          text,
          length: text.length,
          isEmpty: !text
        });
      });
    }

    return {
      ...headings,
      h1Count: headings.h1.length,
      hasH1: headings.h1.length > 0,
      multipleH1: headings.h1.length > 1,
      hierarchyValid: this.validateHeadingHierarchy(headings),
      emptyHeadings: this.countEmptyHeadings(headings)
    };
  }

  validateHeadingHierarchy(headings) {
    // Simple hierarchy validation - check if H1 exists before other headings
    if (headings.h1.length === 0 && (
      headings.h2.length > 0 || 
      headings.h3.length > 0 || 
      headings.h4.length > 0 || 
      headings.h5.length > 0 || 
      headings.h6.length > 0
    )) {
      return false;
    }
    return true;
  }

  countEmptyHeadings(headings) {
    let count = 0;
    for (let i = 1; i <= 6; i++) {
      headings[`h${i}`].forEach(heading => {
        if (heading.isEmpty) count++;
      });
    }
    return count;
  }

  analyzeImages($) {
    const images = [];
    let withoutAlt = 0;
    let withEmptyAlt = 0;

    $('img').each((index, element) => {
      const src = $(element).attr('src') || '';
      const alt = $(element).attr('alt');
      const title = $(element).attr('title') || '';
      
      const imageData = {
        src,
        alt: alt || '',
        title,
        hasAlt: alt !== undefined,
        hasEmptyAlt: alt === '',
        hasMeaningfulAlt: alt && alt.trim().length > 0
      };

      images.push(imageData);

      if (!imageData.hasAlt) {
        withoutAlt++;
      } else if (imageData.hasEmptyAlt) {
        withEmptyAlt++;
      }
    });

    return {
      total: images.length,
      withoutAlt,
      withEmptyAlt,
      withAlt: images.length - withoutAlt - withEmptyAlt,
      images
    };
  }

  analyzeLinks($, url) {
    const internal = [];
    const external = [];
    
    try {
      const baseUrl = new URL(url);
      
      $('a[href]').each((index, element) => {
        const href = $(element).attr('href');
        const text = $(element).text().trim();
        
        if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:')) {
          return;
        }

        try {
          const linkUrl = new URL(href, url);
          const linkData = {
            href,
            text,
            isEmpty: !text,
            url: linkUrl.href
          };

          if (linkUrl.hostname === baseUrl.hostname) {
            internal.push(linkData);
          } else {
            external.push(linkData);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });
    } catch (e) {
      // Invalid base URL
    }

    return {
      internal: {
        count: internal.length,
        links: internal
      },
      external: {
        count: external.length,
        links: external
      },
      total: internal.length + external.length,
      emptyAnchors: internal.filter(l => l.isEmpty).length + external.filter(l => l.isEmpty).length
    };
  }

  analyzeKeywordDensity($) {
    $('script, style').remove();
    const text = $('body').text().toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
    const words = text.split(' ').filter(word => word.length > 2);
    
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Get top 10 most frequent words
    const sortedWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word, count]) => ({
        word,
        count,
        density: (count / words.length * 100).toFixed(2)
      }));

    return {
      totalWords: words.length,
      uniqueWords: Object.keys(wordCount).length,
      topKeywords: sortedWords,
      highDensityWords: sortedWords.filter(w => parseFloat(w.density) > 3)
    };
  }

  calculateScore(results) {
    let score = 0;
    let maxScore = 0;

    // Text length (20 points)
    maxScore += 20;
    if (results.textLength.optimal) {
      score += 20;
    } else if (results.textLength.total > 100) {
      score += 10;
    }

    // H1 tag (20 points)
    maxScore += 20;
    if (results.headings.hasH1 && !results.headings.multipleH1) {
      score += 20;
    } else if (results.headings.hasH1) {
      score += 10;
    }

    // Heading hierarchy (10 points)
    maxScore += 10;
    if (results.headings.hierarchyValid) {
      score += 10;
    }

    // Images with alt text (20 points)
    maxScore += 20;
    if (results.images.total > 0) {
      const altRatio = results.images.withAlt / results.images.total;
      score += Math.round(20 * altRatio);
    } else {
      score += 20; // No images is fine
    }

    // Internal links (15 points)
    maxScore += 15;
    if (results.links.internal.count > 0) {
      score += 15;
    } else if (results.links.internal.count >= 3) {
      score += 15;
    } else {
      score += Math.round(results.links.internal.count * 5);
    }

    // Keyword density balance (15 points)
    maxScore += 15;
    if (results.keywords.highDensityWords.length === 0) {
      score += 15; // No keyword stuffing is good
    } else if (results.keywords.highDensityWords.length <= 2) {
      score += 10;
    } else {
      score += 5;
    }

    return Math.round((score / maxScore) * 100);
  }

  collectIssues(results) {
    const issues = [];

    // Text length issues
    if (results.textLength.tooShort) {
      issues.push({
        type: 'content',
        severity: 'warning',
        message: `コンテンツが短すぎます (${results.textLength.total}文字、推奨: 300文字以上)`
      });
    }

    // H1 issues
    if (!results.headings.hasH1) {
      issues.push({
        type: 'content',
        severity: 'critical',
        message: 'H1タグが設定されていません'
      });
    } else if (results.headings.multipleH1) {
      issues.push({
        type: 'content',
        severity: 'warning',
        message: `H1タグが複数設定されています (${results.headings.h1Count}個)`
      });
    }

    // Heading hierarchy issues
    if (!results.headings.hierarchyValid) {
      issues.push({
        type: 'content',
        severity: 'warning',
        message: '見出しの階層構造が不適切です（H1が存在せずにH2以下が使用されています）'
      });
    }

    // Empty headings
    if (results.headings.emptyHeadings > 0) {
      issues.push({
        type: 'content',
        severity: 'warning',
        message: `空の見出しタグがあります (${results.headings.emptyHeadings}個)`
      });
    }

    // Image alt text issues
    if (results.images.withoutAlt > 0) {
      const imagesWithoutAlt = results.images.images
        .filter(img => !img.hasAlt)
        .slice(0, 10)
        .map(img => img.src)
        .join(', ');
      
      issues.push({
        type: 'content',
        severity: 'warning',
        message: `alt属性が設定されていない画像があります (${results.images.withoutAlt}/${results.images.total}枚)`,
        details: `例: ${imagesWithoutAlt}${results.images.withoutAlt > 10 ? ' など' : ''}`
      });
    }

    if (results.images.withEmptyAlt > 0) {
      const imagesWithEmptyAlt = results.images.images
        .filter(img => img.hasEmptyAlt)
        .slice(0, 10)
        .map(img => img.src)
        .join(', ');
      
      issues.push({
        type: 'content',
        severity: 'info',
        message: `alt属性が空の画像があります (${results.images.withEmptyAlt}/${results.images.total}枚)`,
        details: `例: ${imagesWithEmptyAlt}${results.images.withEmptyAlt > 10 ? ' など' : ''}`
      });
    }

    // Link issues
    if (results.links.internal.count === 0) {
      issues.push({
        type: 'content',
        severity: 'info',
        message: '内部リンクが設定されていません'
      });
    }

    if (results.links.emptyAnchors > 0) {
      const allLinks = [...results.links.internal.links, ...results.links.external.links];
      const emptyAnchorLinks = allLinks
        .filter(link => link.isEmpty)
        .slice(0, 10)
        .map(link => link.href)
        .join(', ');
      
      issues.push({
        type: 'content',
        severity: 'info',
        message: `アンカーテキストが空のリンクがあります (${results.links.emptyAnchors}個)`,
        details: `例: ${emptyAnchorLinks}${results.links.emptyAnchors > 10 ? ' など' : ''}`
      });
    }

    // Keyword density issues
    if (results.keywords.highDensityWords.length > 0) {
      const topWord = results.keywords.highDensityWords[0];
      issues.push({
        type: 'content',
        severity: 'warning',
        message: `キーワード密度が高すぎる可能性があります ("${topWord.word}": ${topWord.density}%)`
      });
    }

    return issues;
  }
}

module.exports = new ContentRules();