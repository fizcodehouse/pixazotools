import { useState } from 'react';

export default function AsyncForm({ title, fields, onStart, polling, layout = 'single' }) {
  const [form, setForm] = useState(() => {
    const init = {};
    fields.forEach(f => { init[f.key] = f.default ?? ''; });
    return init;
  });
  const [error, setError] = useState(null);

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    polling.stopPolling();
    try {
      const data = await onStart(form);
      if (data.polling_url) {
        polling.startPolling(data.polling_url);
      } else {
        setError('No polling_url in response');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const getMediaUrl = () => {
    if (!polling.result) return null;
    // Try various response shapes
    if (polling.result.output?.media_url) {
      return Array.isArray(polling.result.output.media_url)
        ? polling.result.output.media_url[0]
        : polling.result.output.media_url;
    }
    if (polling.result.output?.url) return polling.result.output.url;
    if (polling.result.media_url) return polling.result.media_url;
    if (polling.result.url) return polling.result.url;
    return null;
  };

  const mediaUrl = getMediaUrl();
  const isVideo = mediaUrl && (mediaUrl.endsWith('.mp4') || mediaUrl.includes('video'));
  const isAudio = mediaUrl && (mediaUrl.endsWith('.mp3') || mediaUrl.endsWith('.wav') || mediaUrl.includes('audio') || mediaUrl.includes('tracks'));

  const renderField = (f) => (
    <div className={`form-group ${f.type === 'textarea' ? 'form-group-textarea' : ''}`} key={f.key}>
      <label htmlFor={f.key}>
        {f.label}
        {f.required && <span className="required"> *</span>}
      </label>
      {f.type === 'number' ? (
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
      ) : f.type === 'boolean' ? (
        <select
          id={f.key}
          value={form[f.key]}
          onChange={e => handleChange(f.key, e.target.value === 'true')}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      ) : f.type === 'select' ? (
        <select
          id={f.key}
          value={form[f.key]}
          onChange={e => handleChange(f.key, e.target.value)}
        >
          {f.options.map(o => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      ) : f.type === 'textarea' ? (
        <textarea
          id={f.key}
          value={form[f.key]}
          onChange={e => handleChange(f.key, e.target.value)}
          placeholder={f.placeholder ?? ''}
          rows={f.rows ?? 16}
          spellCheck={f.spellCheck ?? false}
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
  );

  const wideFields = fields.filter(f => f.type === 'textarea');
  const narrowFields = fields.filter(f => f.type !== 'textarea');
  const isTwoColumn = layout === 'two-column' && wideFields.length > 0;

  return (
    <div className="tab-content">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} className={`sync-form ${isTwoColumn ? 'sync-form-two-col' : ''}`}>
        {isTwoColumn ? (
          <>
            <div className="sync-form-left">
              {wideFields.map(renderField)}
            </div>
            <div className="sync-form-right">
              {narrowFields.map(renderField)}
              <button type="submit" disabled={polling.status === 'queued' || polling.status === 'processing'} className="btn-generate">
                {polling.status === 'idle' ? 'Generate' : 'Re-generate'}
              </button>
            </div>
          </>
        ) : (
          <>
            {fields.map(renderField)}
            <button type="submit" disabled={polling.status === 'queued' || polling.status === 'processing'} className="btn-generate">
              {polling.status === 'idle' ? 'Generate' : 'Re-generate'}
            </button>
          </>
        )}
      </form>

      {/* Progress indicator */}
      {(polling.status === 'queued' || polling.status === 'processing') && (
        <div className="polling-status">
          <div className="progress-bar">
            <div className="progress-fill indeterminate" />
          </div>
          <p className="status-text">
            {polling.status === 'queued' ? '⏳ Queued — waiting in line…' : '⚙️ Processing — generating your media…'}
          </p>
        </div>
      )}

      {/* Completed */}
      {polling.status === 'completed' && mediaUrl && (
        <div className="result-box">
          {isVideo ? (
            <video controls className="result-video" src={mediaUrl} />
          ) : isAudio ? (
            <audio controls className="result-audio" src={mediaUrl} />
          ) : (
            <img src={mediaUrl} alt="Generated" className="result-image" />
          )}
          <a href={mediaUrl} download className="btn-download" target="_blank" rel="noreferrer">
            Download
          </a>
        </div>
      )}

      {/* Completed but no URL */}
      {polling.status === 'completed' && !mediaUrl && (
        <div className="result-box">
          <pre className="raw-response">{JSON.stringify(polling.result, null, 2)}</pre>
          <p className="hint">Raw response above. Check for media URL.</p>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {polling.status === 'failed' && <div className="error-box">{polling.error || 'Generation failed'}</div>}

      {polling.status === 'error' && <div className="error-box">{polling.error}</div>}
    </div>
  );
}
