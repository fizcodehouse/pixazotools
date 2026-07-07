import { useState } from 'react';

export default function SyncForm({ title, fields, onGenerate }) {
  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach(f => { init[f.key] = f.default ?? ''; });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultUrl(null);
    setError(null);
    try {
      const data = await onGenerate(form);
      // data can be { output: "https://..." } or { imageUrl: "https://..." }
      const url = data.output || data.imageUrl;
      if (url) {
        setResultUrl(url);
      } else {
        setError('No image URL in response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} className="sync-form">
        {fields.map(f => (
          <div className="form-group" key={f.key}>
            <label htmlFor={f.key}>
              {f.label}
              {f.required && <span className="required"> *</span>}
            </label>
            {f.type === 'number' || f.type === 'range' ? (
              <input
                id={f.key}
                type="number"
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder ?? ''}
                min={f.min}
                max={f.max}
                step={f.step}
              />
            ) : (
              <input
                id={f.key}
                type="text"
                value={form[f.key]}
                onChange={e => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder ?? ''}
              />
            )}
            {f.hint && <span className="hint">{f.hint}</span>}
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-generate">
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </form>

      {loading && <div className="progress-bar"><div className="progress-fill indeterminate" /></div>}

      {error && <div className="error-box">{error}</div>}

      {resultUrl && (
        <div className="result-box">
          <img src={resultUrl} alt="Generated" className="result-image" />
          <a href={resultUrl} download className="btn-download" target="_blank" rel="noreferrer">
            Download
          </a>
        </div>
      )}
    </div>
  );
}
