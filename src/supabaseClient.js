import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ztpbvinhuxxxathkiteb.supabase.co'
const supabaseAnonKey = 'sb_publishable_vLpZr51FxmO_SnHD2pxd0g_UMT4Qbbn'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)