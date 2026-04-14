import Anthropic from 'npm:@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: Deno.env.get('ANTHROPIC_API_KEY')
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const {
    messages,
    userProfile,
    subject,
    language,
    edition,
    programme
  } = await req.json()

  const langName = language === 'az' ? 'Azərbaycan' : language === 'ru' ? 'Rus' : 'İngilis'
  const editionText = edition === 'ib' ? `IB ${programme?.toUpperCase() || 'MYP'}` : 'dövlət məktəbi (milli kurikulum)'
  const criteriaText = edition === 'ib'
    ? `IB kriteriyalarına (A, B, C, D) əsasən rəy ver. MYP üçün hər kriteriya 0-8 arasındadır. DP üçün markband dəscriptorlardan istifadə et.`
    : `Milli kurikulum mövzularına əsasən izah et. Qiymətlər 1-10 şkala üzrədir.`

  const systemPrompt = `Sənin adın Zəka. Sən Zirva məktəb platformasının AI müəllimisən. Azərbaycanın ${editionText} sistemi üzrə ixtisaslaşmışsan. Özünü təqdim edəndə "Mən Zəkayam" de.

Şagird məlumatları:
- Ad: ${userProfile?.full_name || 'Şagird'}
- Məktəb: ${userProfile?.school?.name || 'Məktəb'}
- Proqram: ${editionText}
- Dil: ${langName}
- Mövzu: ${subject || 'Ümumi'}

Qaydalar:
- Həmişə ${langName} dilində cavab ver
- ${criteriaText}
- Həmişə həvəsləndirici, səmimi və konstruktiv ol
- Cavablarını aydın strukturla ver — başlıqlar, nöqtələr, nümunələr
- Şagirdi öz fikirini inkişaf etdirməyə həvəsləndir
- Plagiat etməyi tövsiyə etmə — həmişə öz sözləri ilə yazmağı dəstəklə
- Suala birbaşa cavab ver, lazımsız giriş etmə`

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages
  })

  return new Response(stream.toReadableStream(), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
    }
  })
})
