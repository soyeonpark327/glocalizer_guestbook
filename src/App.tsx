import { useEffect, useState, type FormEvent } from 'react'
import { supabase, type Entry } from './supabase'
import Pond from './Pond'

const MAX_MESSAGE = 200
const MAX_NAME = 30

export default function App() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [freshId, setFreshId] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setLoadError(true)
      setLoading(false)
      return
    }
    supabase
      .from('entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
      .then(({ data, error }) => {
        if (error) {
          console.error(error)
          setLoadError(true)
        } else {
          setEntries(data ?? [])
        }
        setLoading(false)
      })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = message.trim()
    if (!text || submitting) return

    // 봇이 숨김 필드를 채웠으면 저장하지 않고 조용히 성공한 척
    if (honeypot) {
      setName('')
      setMessage('')
      return
    }

    if (!supabase) {
      setSubmitError('사이트 설정이 아직 끝나지 않았어요. 잠시 후 다시 시도해주세요.')
      return
    }

    setSubmitting(true)
    setSubmitError('')
    const { data, error } = await supabase
      .from('entries')
      .insert({ name: name.trim() || null, message: text })
      .select()
      .single()
    setSubmitting(false)

    if (error || !data) {
      console.error(error)
      setSubmitError('앗, 저장에 실패했어요. 잠시 후 다시 시도해주세요.')
      return
    }
    setEntries((prev) => [data, ...prev])
    setFreshId(data.id)
    setName('')
    setMessage('')
  }

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <img className="logo" src="/logo.png" alt="" width={96} height={96} />
          <h1 className="wordmark">GLOCALIZER</h1>
          <p className="tagline">다녀가신 분들의 한마디를 남겨주세요</p>
        </div>
      </header>

      <main className="container">
        <form className="write" onSubmit={handleSubmit}>
          <label className="field">
            <span className="label">이름 <em>(선택)</em></span>
            <input
              type="text"
              value={name}
              maxLength={MAX_NAME}
              placeholder="비우면 귀여운 닉네임이 붙어요"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="label">메시지</span>
            <textarea
              value={message}
              maxLength={MAX_MESSAGE}
              rows={4}
              required
              placeholder="따뜻한 한마디를 남겨주세요 :)"
              onChange={(e) => setMessage(e.target.value)}
            />
            <span className="counter">
              {message.length} / {MAX_MESSAGE}
            </span>
          </label>

          {/* honeypot: 사람에게는 보이지 않는 필드 */}
          <div className="hp" aria-hidden="true">
            <label>
              웹사이트
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>

          {submitError && <p className="error">{submitError}</p>}

          <button className="submit" type="submit" disabled={submitting || !message.trim()}>
            {submitting ? '남기는 중…' : '방명록 남기기'}
          </button>
        </form>

        {loading ? (
          <p className="status">불러오는 중이에요…</p>
        ) : loadError ? (
          <p className="status">방명록을 불러오지 못했어요. 새로고침 해주세요.</p>
        ) : entries.length === 0 ? (
          <p className="status">아직 남겨진 글이 없어요.<br />첫 번째 한마디의 주인공이 되어주세요!</p>
        ) : null}
      </main>

      <Pond entries={entries} freshId={freshId} />
    </>
  )
}
