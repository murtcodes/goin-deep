import { createClient } from '@supabase/supabase-js'

const s = createClient(
  'https://ywiatifembpcmydvjdzh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3aWF0aWZlbWJwY215ZHZqZHpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMDA0NzQsImV4cCI6MjA5MTc3NjQ3NH0.cg1s4ptTXaDPfyRbnDfB0mN51-BMnclKhZmFcjLWNlM'
)

const { error: m } = await s.from('managers').update({ season: 20242025 }).in('name', ['Ben','KG','Train','Hass','Mike'])
console.log('managers:', m?.message || '✓')

const { error: p } = await s.from('player_stats').update({ season: 20242025 }).eq('season', 20252026)
console.log('player_stats:', p?.message || '✓')
