import React from 'react';

const ResultDisplay = ({ result, onNewAnalysis }) => {
  if (!result) return null;

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  const getScoreStars = (score) => {
    const stars = Math.ceil(score / 20);
    return '⭐'.repeat(Math.max(1, Math.min(5, stars)));
  };

  const getCategoryScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  };

  const getIssueIcon = (severity) => {
    switch (severity) {
      case 'critical': return 'bi-exclamation-triangle-fill text-danger';
      case 'warning': return 'bi-exclamation-circle-fill text-warning';
      case 'info': return 'bi-info-circle-fill text-info';
      default: return 'bi-info-circle text-muted';
    }
  };

  const getIssueClass = (severity) => {
    switch (severity) {
      case 'critical': return 'issue-critical';
      case 'warning': return 'issue-warning';
      case 'info': return 'issue-info';
      default: return 'issue-info';
    }
  };

  const getSeverityText = (severity) => {
    switch (severity) {
      case 'critical': return '重要';
      case 'warning': return '警告';
      case 'info': return '情報';
      default: return '情報';
    }
  };

  const criticalIssues = result.data.issues.filter(issue => issue.severity === 'critical');
  const warningIssues = result.data.issues.filter(issue => issue.severity === 'warning');
  const infoIssues = result.data.issues.filter(issue => issue.severity === 'info');

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="row">
        <div className="col-12">
          <div className="card card-custom mb-4">
            <div className="card-body text-center">
              <h2 className="h4 mb-3">
                <i className="bi bi-clipboard-data me-2"></i>
                SEO診断結果
              </h2>
              <p className="mb-2">
                <i className="bi bi-globe me-1"></i>
                <strong>{result.data.finalUrl}</strong>
              </p>
              <div className="row text-center">
                <div className="col-md-4">
                  <small className="text-muted">ステータス</small>
                  <div className="fw-bold text-success">{result.data.statusCode}</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">読み込み時間</small>
                  <div className="fw-bold">{result.data.loadTime}ms</div>
                </div>
                <div className="col-md-4">
                  <small className="text-muted">分析日時</small>
                  <div className="fw-bold">
                    {new Date(result.data.timestamp).toLocaleString('ja-JP')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Score */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body text-center py-4">
              <div className={`score-circle ${getScoreClass(result.data.score)} mx-auto mb-3`}>
                {result.data.score}
                <small className="d-block" style={{ fontSize: '0.7rem' }}>/ 100</small>
              </div>
              <h3 className="h4 mb-2">総合スコア</h3>
              <div className="h5 mb-0">{getScoreStars(result.data.score)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body">
              <h4 className="card-title mb-4">
                <i className="bi bi-bar-chart me-2"></i>
                カテゴリ別スコア
              </h4>
              
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">メタタグ</span>
                  <span className="fw-bold">{result.data.meta.score}/100</span>
                </div>
                <div className="progress progress-custom">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${result.data.meta.score}%`,
                      backgroundColor: getCategoryScoreColor(result.data.meta.score)
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">コンテンツ</span>
                  <span className="fw-bold">{result.data.content.score}/100</span>
                </div>
                <div className="progress progress-custom">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${result.data.content.score}%`,
                      backgroundColor: getCategoryScoreColor(result.data.content.score)
                    }}
                  ></div>
                </div>
              </div>

              <div className="mb-0">
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-semibold">技術的要素</span>
                  <span className="fw-bold">{result.data.technical.score}/100</span>
                </div>
                <div className="progress progress-custom">
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${result.data.technical.score}%`,
                      backgroundColor: getCategoryScoreColor(result.data.technical.score)
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="row">
        <div className="col-12">
          <div className="card card-custom">
            <div className="card-body">
              <h4 className="card-title mb-4">
                <i className="bi bi-list-check me-2"></i>
                改善点と提案
              </h4>

              {result.data.issues.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-success">素晴らしいです！</h5>
                  <p className="text-muted">大きな問題は見つかりませんでした。</p>
                </div>
              ) : (
                <>
                  {criticalIssues.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-danger fw-bold mb-3">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        重要な問題 ({criticalIssues.length}件)
                      </h6>
                      {criticalIssues.map((issue, index) => (
                        <div key={index} className={`issue-item ${getIssueClass(issue.severity)}`}>
                          <i className={`${getIssueIcon(issue.severity)} me-2`}></i>
                          <div>
                            <div>{issue.message}</div>
                            {issue.details && <div className="text-muted small mt-1">{issue.details}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {warningIssues.length > 0 && (
                    <div className="mb-4">
                      <h6 className="text-warning fw-bold mb-3">
                        <i className="bi bi-exclamation-circle-fill me-2"></i>
                        警告 ({warningIssues.length}件)
                      </h6>
                      {warningIssues.map((issue, index) => (
                        <div key={index} className={`issue-item ${getIssueClass(issue.severity)}`}>
                          <i className={`${getIssueIcon(issue.severity)} me-2`}></i>
                          <div>
                            <div>{issue.message}</div>
                            {issue.details && <div className="text-muted small mt-1">{issue.details}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {infoIssues.length > 0 && (
                    <div className="mb-0">
                      <h6 className="text-info fw-bold mb-3">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        参考情報 ({infoIssues.length}件)
                      </h6>
                      {infoIssues.map((issue, index) => (
                        <div key={index} className={`issue-item ${getIssueClass(issue.severity)}`}>
                          <i className={`${getIssueIcon(issue.severity)} me-2`}></i>
                          <div>
                            <div>{issue.message}</div>
                            {issue.details && <div className="text-muted small mt-1">{issue.details}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Analysis Button */}
      <div className="row mt-4">
        <div className="col-12 text-center">
          <button 
            className="btn btn-lg btn-primary-custom"
            onClick={onNewAnalysis}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            別のサイトを診断する
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;