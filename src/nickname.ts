// 이름을 비운 글에 붙는 가상 닉네임. 글 id로 정해지므로 새로고침해도 같은 닉네임이 나온다.
const ADJECTIVES = [
  '수줍은', '반짝이는', '졸린', '용감한', '느긋한', '다정한', '말랑한', '신나는',
  '포근한', '상냥한', '엉뚱한', '동그란', '씩씩한', '몽글몽글한', '배고픈', '춤추는',
  '노래하는', '산책하는', '꿈꾸는', '두근두근', '수다쟁이', '보송보송한', '해맑은', '여행하는',
]

const CREATURES = [
  '해달', '펭귄', '고래', '해파리', '거북이', '돌고래', '문어', '복어',
  '수달', '고양이', '다람쥐', '판다', '여우', '토끼', '햄스터', '오리',
  '부엉이', '코알라', '알파카', '고슴도치', '너구리', '물범', '불가사리', '열대어',
]

function hash(text: string, seed: number) {
  let h = seed
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 2654435761)
  return (h ^ (h >>> 16)) >>> 0
}

export function displayName(entry: { id: string; name: string | null }) {
  if (entry.name) return entry.name
  const adj = ADJECTIVES[hash(entry.id, 7) % ADJECTIVES.length]
  const creature = CREATURES[hash(entry.id, 131) % CREATURES.length]
  return `${adj} ${creature}`
}
