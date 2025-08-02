import React, { useState } from 'react';

const UrlInput = ({ onAnalyze, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return 'HTTPまたはHTTPSのURLを入力してください';
      }
      return null;
    } catch {
      return '正しいURL形式で入力してください（例: https://example.com）';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    const validationError = validateUrl(url.trim());
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    onAnalyze(url.trim());
  };

  const handleInputChange = (e) => {
    setUrl(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="hero-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            <div className="text-center mb-4">
              <h1 className="display-4 fw-bold mb-3">
                <i className="bi bi-search me-3"></i>
                SEO診断ツール
              </h1>
              <p className="lead mb-4">
                WebサイトのSEO状況を無料で診断します。URLを入力するだけで、詳細な分析結果をご確認いただけます。
              </p>
            </div>

            <div className="card card-custom p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="url-input" className="form-label fw-semibold text-muted">
                    診断したいWebサイトのURLを入力してください
                  </label>
                  <div className="input-group input-group-lg">
                    <span className="input-group-text bg-light border-end-0">
                      <i className="bi bi-globe text-muted"></i>
                    </span>
                    <input
                      id="url-input"
                      type="text"
                      className={`form-control url-input border-start-0 ${error ? 'is-invalid' : ''}`}
                      placeholder="https://example.com"
                      value={url}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                  {error && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {error}
                    </div>
                  )}
                </div>

                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-lg btn-primary-custom"
                    disabled={isLoading || !url.trim()}
                  >
                    {isLoading ? (
                      <>
                        <span className="loading-spinner me-2"></span>
                        分析中...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-play-circle me-2"></i>
                        SEO診断を開始
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-3 text-center">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  入力されたURLの情報は保存されません
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UrlInput;