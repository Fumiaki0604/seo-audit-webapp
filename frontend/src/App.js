import React, { useState } from 'react';
import UrlInput from './components/UrlInput';
import ResultDisplay from './components/ResultDisplay';
import { seoAPI } from './services/api';

function App() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (url) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🔍 Starting SEO analysis for: ${url}`);
      const analysisResult = await seoAPI.analyze(url);
      console.log('✅ Analysis completed:', analysisResult);
      setResult(analysisResult);
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      setError(error.message || 'SEO分析中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAnalysis = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="App">
      {/* Header always visible */}
      {result && (
        <nav className="navbar navbar-light bg-light shadow-sm">
          <div className="container">
            <span className="navbar-brand mb-0 h1">
              <i className="bi bi-search me-2"></i>
              SEO診断ツール
            </span>
          </div>
        </nav>
      )}

      {/* Main Content */}
      {!result && (
        <>
          <UrlInput onAnalyze={handleAnalyze} isLoading={isLoading} />
          
          {/* Loading State */}
          {isLoading && (
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="card card-custom">
                    <div className="card-body text-center py-5">
                      <div className="mb-4">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                      <h4 className="mb-3">SEO分析を実行中...</h4>
                      <p className="text-muted mb-4">
                        Webサイトの内容を取得して、SEO状況を詳細に分析しています。
                        <br />
                        しばらくお待ちください。
                      </p>
                      <div className="progress progress-custom mb-3">
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated" 
                          style={{ width: '70%' }}
                        ></div>
                      </div>
                      <small className="text-muted">
                        <i className="bi bi-clock me-1"></i>
                        通常30秒程度で完了します
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-md-8">
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <strong>エラーが発生しました</strong>
                    <br />
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError(null)}
                    ></button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Results */}
      {result && (
        <ResultDisplay 
          result={result} 
          onNewAnalysis={handleNewAnalysis} 
        />
      )}

      {/* Footer */}
      <footer className="bg-light py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <p className="text-muted mb-2">
                <i className="bi bi-shield-check me-1"></i>
                無料でご利用いただけるSEO診断ツールです
              </p>
              <small className="text-muted">
                © 2024 SEO診断ツール. お客様のプライバシーを保護し、入力されたURLは保存されません。
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;