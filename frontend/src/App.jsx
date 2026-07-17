import { useState } from 'react';
import { Sparkles, Database, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [sql, setSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const generateSql = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError('');
    setSql('');
    setCopied(false);

    try {
      const response = await fetch('http://localhost:5000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SQL');
      }

      const data = await response.json();
      setSql(data.sql);
    } catch (err) {
      setError(err.message || 'An error occurred while generating the query.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1 className="title">
          AI Query Generator
        </h1>
        <p className="subtitle">Powered by Llama 3 & Ollama</p>
      </div>

      <div className="input-section">
        <textarea
          placeholder="Describe the data you want to retrieve... (e.g., 'Find all users who signed up last month and ordered more than 3 items')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading}
        />
        <button 
          className="generate-btn"
          onClick={generateSql}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="spinner" size={20} />
              Generating Magic...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate SQL
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {sql && (
        <div className="result-section">
          <div className="result-header">
            <div className="result-title">
              <Database size={16} style={{ display: 'inline', marginRight: '8px' }}/>
              Generated Query
            </div>
            <button className="copy-btn" onClick={copyToClipboard} title="Copy to clipboard">
              {copied ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
            </button>
          </div>
          <pre className="result-content">
            {sql}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;
