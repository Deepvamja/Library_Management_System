import React from 'react'
import { requirePatron } from '../../lib/session'
import PatronPageClient from './PatronPageClient'

export default async function PatronPage() {
  // Get the logged-in patron's session
  const session = await requirePatron()
  
  return <PatronPageClient session={session} />
}
