import { useEffect, useRef, useState } from 'react'
import './App.css'

const sampleCode = {
  buggy: `const user = await fetch('/api/user')
const profile = user.data

return {
  name: profile.name,
  email: profile.email,
  role: profile.role || 'admin'
}`,
  clean: `const sanitizeInput = (value) => value.trim()

function normalizeUser(input) {
  const cleaned = sanitizeInput(input)
  return cleaned.length > 0 ? cleaned : 'guest'
}

const displayName = normalizeUser(userInput)`
}

const courtCases = {
  buggy: {
    prosecution: {
      role: 'Prosecutor',
      icon: '😈',
      opening:
        'This code trusts raw user data without validation, which creates a direct pathway for unsafe state mutation and privilege escalation.',
      charges: [
        {
          title: 'Unverified data flow',
          detail: 'User-controlled values are accepted without sanitization or type checks before they are used in application logic.',
          severity: 'critical',
        },
        {
          title: 'Privilege bypass risk',
          detail: 'A missing guard allows a low-privilege request to be treated as an administrative action.',
          severity: 'major',
        },
      ],
      closing:
        'The evidence shows a systemic failure to validate context before acting on user input. This is not a minor bug; it is a policy violation.',
    },
    defense: {
      role: 'Defense Attorney',
      icon: '😇',
      opening:
        'The logic is intentionally minimal and the issue is isolated to a narrow request path, not a broad platform weakness.',
      charges: [
        {
          title: 'Boundary is narrow',
          detail: 'The suspicious behavior is limited to a single endpoint and does not expose the rest of the application surface.',
          severity: 'minor',
        },
        {
          title: 'Minimal mutation scope',
          detail: 'The code path writes to a single object and does not cross service boundaries without a validation checkpoint.',
          severity: 'major',
        },
      ],
      closing:
        'The court should treat this as a contained hardening task rather than a systemic compromise of the product architecture.',
    },
    verdict: {
      label: 'GUILTY',
      verdictClass: 'guilty',
      reasoning:
        'The prosecution correctly identified an unsafe trust boundary: unvalidated data is being treated as trusted state. The defense presented a narrow scope, but the missing input guard creates a real risk that should be addressed before release.',
      sentence: [
        'Sanitize all external input before it reaches application state.',
        'Reject or normalize untrusted values before role checks or access decisions.',
        'Add validation tests covering empty, malformed, and elevated-role payloads.',
      ],
    },
  },
  clean: {
    prosecution: {
      role: 'Prosecutor',
      icon: '😈',
      opening:
        'The code is disciplined, but the missing guard for empty-string input still leaves a dangerous edge condition in the validation flow.',
      charges: [
        {
          title: 'Empty input edge case',
          detail: 'A blank or whitespace-only value can still slip through if the sanitization step is bypassed or incomplete.',
          severity: 'minor',
        },
      ],
      closing:
        'The implementation shows good hygiene overall, but a single missing fallback check is enough to justify a formal warning.',
    },
    defense: {
      role: 'Defense Attorney',
      icon: '😇',
      opening:
        'The application validates input before use and includes a clear default path for empty values. This is a well-guarded implementation with minimal exposure.',
      charges: [
        {
          title: 'Validation is present',
          detail: 'The code normalizes input and handles empty cases with a safe fallback, reducing the chance of malformed state.',
          severity: 'minor',
        },
        {
          title: 'Default behavior remains safe',
          detail: 'The fallback path keeps the app in a known-good state even when the user input is unexpectedly blank.',
          severity: 'major',
        },
      ],
      closing:
        'This is a responsibly designed implementation. The issue is minor and easily resolved with a stronger guardrail around empty input cases.',
    },
    verdict: {
      label: 'NOT GUILTY',
      verdictClass: 'not-guilty',
      reasoning:
        'The court sees a sound validation pattern and a safe fallback route. While the empty-input edge case should be hardened, the code does not demonstrate a material security violation or reckless trust boundary.',
      sentence: [
        'Add a stronger guard for whitespace-only input in the normalization helper.',
        'Document the fallback behavior for future maintainers and tests.',
        'Keep the validation contract explicit so empty values remain safe by default.',
      ],
    },
  },
}

function App() {
  const [code, setCode] = useState('')
  const [stage, setStage] = useState('idle')
  const [selectedCase, setSelectedCase] = useState('clean')
  const [errorText, setErrorText] = useState('')
  const [started, setStarted] = useState(false)
  const timerRefs = useRef([])

  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    return () => {
      timerRefs.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const charCount = code.length
  const isLongCode = charCount > 4000
  const canSubmit = code.trim().length > 0 && stage === 'idle'

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (!section) return

    section.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }

  const queueStage = (nextStage, delay) => {
    const timer = setTimeout(() => setStage(nextStage), delay)
    timerRefs.current.push(timer)
  }

  const resetTrial = () => {
    timerRefs.current.forEach((timer) => clearTimeout(timer))
    timerRefs.current = []
    setCode('')
    setStage('idle')
    setStarted(false)
    setErrorText('')
    setSelectedCase('clean')
    setTimeout(() => {
      const input = document.getElementById('code-input')
      input?.focus()
    }, 50)
  }

  const handleSample = (key) => {
    setSelectedCase(key)
    setCode(sampleCode[key])
    setErrorText('')
    setStage('idle')
    setStarted(false)
  }

  const handleSubmit = () => {
    const trimmed = code.trim()
    if (!trimmed) {
      setErrorText('Add some code before you put it on trial')
      return
    }

    setErrorText('')
    setStarted(true)
    setStage('loading')
    scrollToSection('transcript-section')

    queueStage('prosecutor', 750)
    queueStage('defense', 1800)
    queueStage('verdict', 3200)
  }

  const caseData = courtCases[selectedCase]

  const transcriptVisible = started && stage !== 'idle'
  const showProsecutor = ['prosecutor', 'defense', 'verdict'].includes(stage)
  const showDefense = ['defense', 'verdict'].includes(stage)
  const showVerdict = stage === 'verdict'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            ⚖️
          </div>
          <div className="brand-copy">
            <span className="eyebrow">CODE COURTROOM</span>
            <h1>Code Courtroom</h1>
          </div>
        </div>
        <p className="tagline">Your code is on trial</p>
      </header>

      <main className="courtroom-layout">
        <section id="input-section" className="panel input-panel">
          <div className="panel-head">
            <div>
              <span className="micro-label">Case File</span>
              <h2>Evidence</h2>
            </div>
            <span className="status-chip">Auto-detect / JavaScript</span>
          </div>

          <div className="sample-row" aria-label="Try a sample case">
            <button
              type="button"
              className="sample-button secondary"
              onClick={() => handleSample('buggy')}
            >
              Try Buggy Code 🐛
            </button>
            <button
              type="button"
              className="sample-button secondary"
              onClick={() => handleSample('clean')}
            >
              Try Clean Code ✨
            </button>
          </div>

          <div className="textarea-shell">
            <textarea
              id="code-input"
              value={code}
              onChange={(event) => {
                setCode(event.target.value)
                if (errorText) setErrorText('')
              }}
              placeholder="// Paste the code you'd like to put on trial…"
              aria-label="Code input"
            />
          </div>

          <div className="toolbar-row">
            <span className={`helper-text ${errorText ? 'error' : ''}`}>
              {errorText || (isLongCode ? 'Large input detected — keep it concise for a smoother review.' : 'Ready to proceed.')}
            </span>
            <span className="counter">{charCount} chars</span>
          </div>

          <button
            type="button"
            className="primary-button"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Put It On Trial ⚖️
          </button>
        </section>

        <section id="transcript-section" className="panel transcript-panel">
          <div className="section-heading">
            <span className="micro-label">The Argument</span>
          </div>

          {!transcriptVisible ? (
            <div className="placeholder-state" role="status" aria-live="polite">
              <div className="placeholder-icon" aria-hidden="true">
                ⚖️
              </div>
              <p>Awaiting trial…</p>
            </div>
          ) : (
            <div className="transcript-stream">
              {stage === 'loading' && (
                <>
                  <div className="loading-card prosecutor" role="status" aria-live="polite">
                    <div className="bubble-header">
                      <span className="avatar red">😈</span>
                      <span className="role-label">PROSECUTOR</span>
                    </div>
                    <p>Prosecutor is building their case…</p>
                    <div className="loading-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                  <div className="loading-card defense" role="status" aria-live="polite">
                    <div className="bubble-header">
                      <span className="avatar blue">😇</span>
                      <span className="role-label">DEFENSE</span>
                    </div>
                    <p>Defense is preparing a rebuttal…</p>
                    <div className="loading-dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </>
              )}

              {showProsecutor && (
                <article className={`agent-bubble prosecutor ${stage === 'prosecutor' ? 'visible' : ''}`}>
                  <div className="bubble-header">
                    <span className="avatar red">😈</span>
                    <span className="role-label">PROSECUTOR</span>
                  </div>
                  <p className="opening-line">{caseData.prosecution.opening}</p>
                  <ul className="charge-list">
                    {caseData.prosecution.charges.map((charge) => (
                      <li key={charge.title} className="charge-item">
                        <span className={`severity-tag ${charge.severity}`}>
                          {charge.severity === 'critical'
                            ? 'Critical'
                            : charge.severity === 'major'
                              ? 'Major'
                              : 'Minor'}
                        </span>
                        <div className="charge-copy">
                          <strong>{charge.title}</strong>
                          <span>{charge.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="closing-line">{caseData.prosecution.closing}</p>
                </article>
              )}

              {showDefense && (
                <article className={`agent-bubble defense ${stage === 'defense' ? 'visible' : ''}`}>
                  <div className="bubble-header">
                    <span className="avatar blue">😇</span>
                    <span className="role-label">DEFENSE ATTORNEY</span>
                  </div>
                  <p className="opening-line">{caseData.defense.opening}</p>
                  <ul className="charge-list">
                    {caseData.defense.charges.map((charge) => (
                      <li key={charge.title} className="charge-item">
                        <span className={`severity-tag ${charge.severity}`}>
                          {charge.severity === 'critical'
                            ? 'Critical'
                            : charge.severity === 'major'
                              ? 'Major'
                              : 'Minor'}
                        </span>
                        <div className="charge-copy">
                          <strong>{charge.title}</strong>
                          <span>{charge.detail}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="closing-line">{caseData.defense.closing}</p>
                </article>
              )}
            </div>
          )}
        </section>

        <section id="verdict-section" className="panel verdict-panel">
          <div className="section-heading">
            <span className="micro-label">The Verdict</span>
          </div>

          {!showVerdict ? (
            <div className="placeholder-state verdict-placeholder" role="status" aria-live="polite">
              <div className="placeholder-icon" aria-hidden="true">
                🧑‍⚖️
              </div>
              <p>Awaiting ruling…</p>
            </div>
          ) : (
            <div className="verdict-card">
              <div className="verdict-header">
                <span className="judge-badge">THE COURT FINDS</span>
              </div>
              <div className={`verdict-label ${caseData.verdict.verdictClass}`}>
                {caseData.verdict.label}
              </div>
              <div className="verdict-reasoning">
                <span className="reasoning-label">Reasoning</span>
                <p>{caseData.verdict.reasoning}</p>
              </div>
              <ol className="sentence-list">
                {caseData.verdict.sentence.map((item, index) => (
                  <li key={item}>
                    <span className="sentence-number">{index + 1}</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
              <button type="button" className="reset-button" onClick={resetTrial}>
                Try Another Trial ⚖️
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
