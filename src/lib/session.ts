import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const secretKey = 'your-secret-key-change-this-in-production'
const key = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  userId: number
  email: string
  firstName: string
  lastName: string
  role: 'patron' | 'librarian' | 'admin'
  userType?: 'student' | 'faculty' // For patrons
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  })
  return payload as SessionPayload
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const session = await encrypt(payload)
  
  cookies().set('session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = cookies().get('session')?.value
  if (!session) return null
  
  try {
    return await decrypt(session)
  } catch (error) {
    return null
  }
}

export async function deleteSession() {
  cookies().delete('session')
}

export async function updateSession() {
  const session = cookies().get('session')?.value
  if (!session) return
  
  try {
    const payload = await decrypt(session)
    await createSession(payload)
  } catch (error) {
    // Session is invalid, delete it
    deleteSession()
  }
}

// Auth guard functions
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession()
  if (!session) {
    redirect('/login')
  }
  return session
}

export async function requirePatron(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== 'patron') {
    redirect('/login')
  }
  return session
}

export async function requireLibrarian(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== 'librarian') {
    redirect('/login')
  }
  return session
}

export async function requireAdmin(): Promise<SessionPayload> {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    redirect('/login')
  }
  return session
}
