import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Rate limit store ──
const rateLimitStore = new Map<string, { count: number; windowStart: number }>()
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_WINDOW = 60000
const MAX_BATCH_SIZE = 50

function isRateLimited(userId: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(userId)
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(userId, { count: 1, windowStart: now })
    return false
  }
  if (record.count >= RATE_LIMIT_MAX) return true
  record.count++
  return false
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const openAIKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIKey) throw new Error('OpenAI API key not configured')

    // ── Extract user ID from JWT ──
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    let userId = 'anonymous'
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userId = payload.sub || 'anonymous'
    } catch {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Rate limit check ──
    if (isRateLimited(userId)) {
      return new Response(JSON.stringify({
        error: 'Rate limit exceeded. You can make up to 10 generation requests per minute. Please wait before trying again.'
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── Batch size guard ──
    const batchSize = Math.min(body.batchSize || 10, MAX_BATCH_SIZE)

    let messages = []

    if (body.messages && body.systemPrompt) {
      messages = [
        { role: 'system', content: body.systemPrompt },
        ...body.messages,
      ]
    } else if (body.prompt) {
      messages = [{ role: 'user', content: body.prompt }]
    } else {
      throw new Error('Invalid request body')
    }

    // ── Scale tokens by batch size ──
    const maxTokens = Math.min(
      batchSize <= 10 ? 4000 :
      batchSize <= 20 ? 8000 :
      batchSize <= 35 ? 12000 : 16000,
      16000
    )

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${openAIKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.85,
        max_tokens: maxTokens,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({
          error: 'OpenAI rate limit reached. Please wait a moment and try again.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      throw new Error(data.error?.message || 'OpenAI error')
    }

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