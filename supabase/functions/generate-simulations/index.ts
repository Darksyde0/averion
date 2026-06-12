import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) throw new Error('OpenAI API key not configured')

    let messages = []

    if (body.messages && body.systemPrompt) {
      // ── Conversational mode (ARIA) ──
      messages = [
        { role: 'system', content: body.systemPrompt },
        ...body.messages,
      ]
    } else if (body.prompt) {
      // ── Legacy single-prompt mode ──
      messages = [{ role: 'user', content: body.prompt }]
    } else {
      throw new Error('Invalid request body')
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAIKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.85,
        max_tokens: 4000,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI error')

    const content = data.choices[0].message.content
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})