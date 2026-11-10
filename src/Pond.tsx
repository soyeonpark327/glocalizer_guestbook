import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties } from 'react'
import type { Entry } from './supabase'
import { displayName } from './nickname'

// 화면에 동시에 떠다니는 글 수
const MAX_SWIMMERS = typeof window !== 'undefined' && window.innerWidth < 640 ? 6 : 10

type Fish = {
  key: number
  entry: Entry
  lane: number // 세로 위치 칸 (temp 물고기는 -1)
  temp: boolean // 칸이 꽉 찼을 때 새 글을 보여주려고 한 번만 헤엄치는 물고기
  fresh: boolean // 방금 쓴 글 → 진하게 강조
  top: number // %
  x: number // 움직임 줄이기 설정일 때 고정 가로 위치 %
  depth: number // 0.75(멀리, 작고 흐림) ~ 1.05(가까이)
  duration: number
  delay: number
  rtl: boolean
  bobDelay: number
}

let seq = 0

function makeFish(entry: Entry, lane: number, lanes: number, opts: { initial?: boolean; fresh?: boolean; temp?: boolean } = {}): Fish {
  const depth = opts.fresh ? 1.05 : 0.75 + Math.random() * 0.3
  const duration = (opts.fresh ? 20 : 18 + Math.random() * 14) / depth
  const slot = lane >= 0 ? lane : Math.random() * lanes
  return {
    key: ++seq,
    entry,
    lane,
    temp: !!opts.temp,
    fresh: !!opts.fresh,
    top: ((slot + 0.1 + Math.random() * 0.8) / Math.max(lanes, 1)) * 64 + 2,
    x: 4 + Math.random() * 70,
    depth,
    duration,
    // 처음 로딩 땐 이미 헤엄치는 중인 것처럼 음수 딜레이, 이후엔 살짝 쉬었다 등장
    delay: opts.initial ? -Math.random() * duration : opts.fresh ? 0 : Math.random() * 1.5,
    rtl: Math.random() < 0.5,
    bobDelay: -Math.random() * 4,
  }
}

export default function Pond({ entries, freshId }: { entries: Entry[]; freshId: string | null }) {
  const [fish, setFish] = useState<Fish[]>([])
  const cursor = useRef(0)
  const entriesRef = useRef(entries)
  entriesRef.current = entries
  const lanes = Math.min(entries.length, MAX_SWIMMERS)

  // 아직 화면에 없는 글을 최신순으로 돌아가며 고른다
  function pickNext(visible: Set<string>, fallback?: Entry) {
    const list = entriesRef.current
    for (let k = 0; k < list.length; k++) {
      const idx = (cursor.current + k) % list.length
      if (!visible.has(list[idx].id)) {
        cursor.current = idx + 1
        return list[idx]
      }
    }
    return fallback
  }

  // 방금 쓴 글은 바로 헤엄쳐 나온다
  useEffect(() => {
    if (!freshId) return
    const entry = entriesRef.current.find((e) => e.id === freshId)
    if (!entry) return
    setFish((prev) => {
      const laneFish = prev.filter((f) => !f.temp)
      const n = Math.min(entriesRef.current.length, MAX_SWIMMERS)
      return laneFish.length < n
        ? [...prev, makeFish(entry, laneFish.length, n, { fresh: true })]
        : [...prev, makeFish(entry, -1, n, { fresh: true, temp: true })]
    })
  }, [freshId])

  // 칸 수만큼 물고기 채우기
  useEffect(() => {
    setFish((prev) => {
      const laneFish = prev.filter((f) => !f.temp)
      if (laneFish.length >= lanes) return prev
      const initial = prev.length === 0
      const visible = new Set(prev.map((f) => f.entry.id))
      const added: Fish[] = []
      for (let lane = laneFish.length; lane < lanes; lane++) {
        const entry = pickNext(visible)
        if (!entry) break
        visible.add(entry.id)
        added.push(makeFish(entry, lane, lanes, { initial }))
      }
      return [...prev, ...added]
    })
  }, [lanes])

  // 화면 끝까지 헤엄치면 다음 글로 교체
  function handleEnd(done: Fish, e: AnimationEvent) {
    if (e.target !== e.currentTarget) return
    setFish((prev) => {
      const rest = prev.filter((f) => f.key !== done.key)
      if (done.temp) return rest
      const visible = new Set(rest.map((f) => f.entry.id))
      const next = pickNext(visible, done.entry)!
      return [...rest, makeFish(next, done.lane, lanes)]
    })
  }

  return (
    <section className="pond" aria-label="방명록">
      {entries.length === 0 ? null : (
        <>
          {fish.map((f) => (
            <div
              key={f.key}
              className={`fish ${f.rtl ? 'rtl' : 'ltr'}${f.fresh ? ' fresh' : ''}`}
              style={
                {
                  top: `${f.top}%`,
                  '--x': `${f.x}%`,
                  '--depth': f.depth,
                  animationDuration: `${f.duration}s`,
                  animationDelay: `${f.delay}s`,
                } as CSSProperties
              }
              onAnimationEnd={(e) => handleEnd(f, e)}
              tabIndex={0}
              aria-hidden="true"
            >
              <div className="fish-body" style={{ animationDelay: `${f.bobDelay}s` }}>
                <p className="fish-message">{f.entry.message}</p>
                <span className="fish-name">{displayName(f.entry)}</span>
              </div>
            </div>
          ))}

          {/* 화면낭독기용: 전체 글 목록 */}
          <ul className="sr-only">
            {entries.map((e) => (
              <li key={e.id}>
                {displayName(e)}: {e.message}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
