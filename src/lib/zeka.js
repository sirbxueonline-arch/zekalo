export async function streamZekaResponse({ messages, systemPrompt, onChunk }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      stream: true,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullContent = ''
  let displayContent = ''
  let buffer = ''
  let charQueue = []
  let typing = true

  // Typewriter effect: drain queue char by char at ~30ms per char
  const typewriter = setInterval(() => {
    if (charQueue.length > 0) {
      // Drain faster if queue is large (catch up)
      const batch = Math.min(charQueue.length, charQueue.length > 20 ? 5 : 2)
      displayContent += charQueue.splice(0, batch).join('')
      onChunk(displayContent)
    } else if (!typing) {
      clearInterval(typewriter)
    }
  }, 20)

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const jsonStr = line.slice(6).trim()
      if (jsonStr === '[DONE]') continue
      try {
        const data = JSON.parse(jsonStr)
        if (data.type === 'content_block_delta' && data.delta?.text) {
          fullContent += data.delta.text
          charQueue.push(...data.delta.text.split(''))
        }
      } catch {}
    }
  }

  typing = false

  // Flush remaining chars
  await new Promise(resolve => {
    const flush = setInterval(() => {
      if (charQueue.length > 0) {
        displayContent += charQueue.splice(0, 10).join('')
        onChunk(displayContent)
      } else {
        clearInterval(flush)
        resolve()
      }
    }, 10)
  })

  onChunk(fullContent)
  return fullContent
}

export function buildStudentSystemPrompt(profile, subject, language, assignments = []) {
  const langName = language === 'az' ? 'Azərbaycan' : language === 'ru' ? 'Rus' : 'İngilis'
  const editionText = profile?.edition === 'ib' ? `IB ${profile?.ib_programme?.toUpperCase() || 'MYP'}` : 'dövlət məktəbi'
  const criteriaText = profile?.edition === 'ib'
    ? 'IB kriteriyalarına (A, B, C, D) əsasən rəy ver. MYP üçün hər kriteriya 0-8 arasındadır.'
    : 'Dövlət kurikulumu mövzularına əsasən izah et. Qiymətlər 1-10 şkala üzrədir.'

  let assignmentContext = ''
  if (assignments.length > 0) {
    assignmentContext = `\n\nŞagirdin aktiv tapşırıqları:\n${assignments.map(a =>
      `- "${a.title}" (Fənn: ${a.subject?.name || 'N/A'}, Son tarix: ${a.due_date ? new Date(a.due_date).toLocaleDateString('az-AZ') : 'yoxdur'}, Təsvir: ${a.description || 'yoxdur'}, Maks bal: ${a.max_score || 'N/A'})`
    ).join('\n')}

Əgər şagird tapşırıq adını və ya mövzusunu qeyd edərsə, yuxarıdakı siyahıdan uyğun tapşırığı tap və ona kömək et. Tapşırığın təsvirini, fənnini və tələblərini nəzərə al. Cavabı birbaşa verməmək — şagirdi düşünməyə və özü yazmağa yönəlt. Addım-addım izah et, nümunələr göstər, amma hazır cavab vermə.`
  }

  return `Sənin adın Zəka. Sən Zekalo məktəb platformasının AI müəllimisən. Azərbaycanın ${editionText} sistemi üzrə ixtisaslaşmışsan. Özünü təqdim edəndə "Mən Zəkayam" de.

Şagird: ${profile?.full_name || 'Şagird'} | Məktəb: ${profile?.school?.name || 'Məktəb'} | Mövzu: ${subject || 'Ümumi'}

Qaydalar:
- Həmişə ${langName} dilində cavab ver
- ${criteriaText}
- Həvəsləndirici, səmimi və konstruktiv ol
- Aydın strukturla cavab ver — başlıqlar, nöqtələr, nümunələr
- Suala birbaşa cavab ver
- Plagiat etməyi tövsiyə etmə — həmişə öz sözləri ilə yazmağı dəstəklə${assignmentContext}`
}
