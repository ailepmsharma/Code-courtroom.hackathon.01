import { useEffect, useRef, useState } from 'react'
import { detectLanguage, languageOptions } from '../data/languages.js'

const InputPanel = ({ code, onCodeChange, onSubmit, onLoadSample, isSubmitting, isValid, overLimit, textareaRef, language, onLanguageChange }) => {
  const [copyFeedback, setCopyFeedback] = useState('')
  const [showEmptyHint, setShowEmptyHint] = useState(false)
  const [attemptFeedback, setAttemptFeedback] = useState('')
  const [sampleFeedback, setSampleFeedback] = useState('')
  const [sampleHighlight, setSampleHighlight] = useState('')
  const [submitFeedback, setSubmitFeedback] = useState('')
  const attemptTimeoutRef = useRef(null)
  const sampleFeedbackTimeoutRef = useRef(null)
  const submitFeedbackTimeoutRef = useRef(null)
  const lineCount = code.trim() ? code.split(/\r\n|\r|\n/).length : 0
  const detectedLanguage = detectLanguage(code)
  const selectedLanguage = languageOptions.find((option) => option.value === language) ?? languageOptions[0]
  const languageStatus = language === 'auto'
    ? `Auto-detect · ${code.trim() ? detectedLanguage?.label ?? 'Unspecified' : 'Unspecified'}`
    : selectedLanguage.label

  useEffect(() => () => {
    window.clearTimeout(attemptTimeoutRef.current)
    window.clearTimeout(sampleFeedbackTimeoutRef.current)
    window.clearTimeout(submitFeedbackTimeoutRef.current)
  }, [])

  const handleEmptyAttempt = () => {
    if (isValid || isSubmitting) {
      return
    }

    setShowEmptyHint(true)
    setAttemptFeedback((current) => (current === 'attempt-a' ? 'attempt-b' : 'attempt-a'))
    window.clearTimeout(attemptTimeoutRef.current)
    attemptTimeoutRef.current = window.setTimeout(() => setAttemptFeedback(''), 280)
  }

  const handleFormSubmit = (event) => {
    event.preventDefault()

    if (!isValid || isSubmitting) {
      handleEmptyAttempt()
      return
    }

    onSubmit()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopyFeedback('Copied')
    } catch {
      setCopyFeedback('Unavailable')
    }
  }

  const handleSampleLoad = (variant) => {
    onLoadSample(variant)
    setCopyFeedback('')
    setShowEmptyHint(false)
    setSampleHighlight(variant)
    setSampleFeedback(variant === 'buggy' ? 'Buggy sample loaded' : 'Clean sample loaded')
    window.clearTimeout(sampleFeedbackTimeoutRef.current)
    sampleFeedbackTimeoutRef.current = window.setTimeout(() => {
      setSampleFeedback('')
      setSampleHighlight('')
    }, 1800)
  }

  const handleSubmitClick = (event) => {
    if (!isValid) {
      event.preventDefault()
      handleEmptyAttempt()
      return
    }

    setSubmitFeedback((current) => (current === 'commit-a' ? 'commit-b' : 'commit-a'))
    window.clearTimeout(submitFeedbackTimeoutRef.current)
    submitFeedbackTimeoutRef.current = window.setTimeout(() => setSubmitFeedback(''), 240)
  }

  return (
    <form
      className="panel input-panel"
      onSubmit={handleFormSubmit}
    >
      <div className="section-header-row">
        <div>
          <div className="eyebrow subtle">Evidence file · 01</div>
          <h2>Code evidence</h2>
        </div>
        <div className="language-control">
          <label className="language-control-label" htmlFor="language-select">Review language</label>
          <select
            id="language-select"
            className="language-select"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            disabled={isSubmitting}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="quick-samples" aria-label="Sample code quick-fill options">
        <button type="button" className="sample-button" onClick={() => handleSampleLoad('buggy')}>
          <span className="sample-glyph" aria-hidden="true">🐛</span>
          <span>Try Buggy Code</span>
        </button>
        <button type="button" className="sample-button" onClick={() => handleSampleLoad('clean')}>
          <span className="sample-glyph" aria-hidden="true">✨</span>
          <span>Try Clean Code</span>
        </button>
      </div>

      <div className={`code-workbench ${sampleHighlight ? 'sample-loaded' : ''}`}>
        <div className="code-toolbar">
          <div className="editor-heading">
            <span className="editor-led" aria-hidden="true" />
            <label htmlFor="code-input" className="editor-label">Exhibit A · Source code</label>
            <span className="language-status" aria-live="polite">Language · {languageStatus}</span>
          </div>
          <button type="button" className="copy-button" onClick={handleCopy} disabled={!isValid} aria-live="polite">
            {copyFeedback || 'Copy code'}
          </button>
        </div>
        <textarea
          ref={textareaRef}
          id="code-input"
          className="code-input"
          value={code}
          onChange={(event) => {
            onCodeChange(event.target.value)
            setCopyFeedback('')
            setShowEmptyHint(!event.target.value.trim())
          }}
          onFocus={() => {
            if (!isValid) {
              setShowEmptyHint(true)
            }
          }}
          placeholder="// Paste the code you'd like to put on trial…"
          aria-describedby="code-help code-count code-empty-hint"
          spellCheck="false"
          disabled={isSubmitting}
        />
        <div className="code-footer">
          <span className="sample-feedback" role="status" aria-live="polite" aria-atomic="true">
            {sampleFeedback}
          </span>
          <div id="code-count" className={`counter ${overLimit ? 'warning' : ''}`}>
            {lineCount} {lineCount === 1 ? 'line' : 'lines'} · {code.length} chars
          </div>
        </div>
      </div>

      <p id="code-help" className="code-instructions">
        Paste a snippet for examination. This demo currently reviews cart-checkout patterns.
      </p>

      <div className="input-meta">
        <div
          id="code-empty-hint"
          className={`field-hint ${showEmptyHint && !isValid ? 'visible' : ''}`}
          role="status"
          aria-live="polite"
          aria-hidden={!showEmptyHint || isValid}
        >
          Add some code before you put it on trial
        </div>
      </div>

      {overLimit && (
        <div className="warning-banner" role="status">
          Large evidence submission · Review may take longer. Your code is unchanged.
        </div>
      )}

      <div className="submit-row">
        <button
          type="submit"
          className={`primary-button ${attemptFeedback} ${submitFeedback}`}
          disabled={isSubmitting}
          aria-disabled={!isValid || isSubmitting}
          aria-describedby={!isValid ? 'code-empty-hint' : undefined}
          onFocus={() => {
            if (!isValid) {
              setShowEmptyHint(true)
            }
          }}
          onClick={handleSubmitClick}
        >
          <svg className="trial-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
            <path d="M20 6v24M11 11h18M20 9l-8 13m8-13 8 13M8 22h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5Zm16 0h8c-.5 3.2-2 5-4 5s-3.5-1.8-4-5ZM14 33h12M17 30h6" />
          </svg>
          <span>{isSubmitting ? 'Reviewing evidence...' : 'Put It On Trial'}</span>
        </button>
      </div>
    </form>
  )
}

export default InputPanel
