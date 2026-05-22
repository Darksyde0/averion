import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export function useProfile() {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Fetch immediately
    fetchProfile()

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          fetchProfile()
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) return

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) setProfile(data)
  }

  return profile
}