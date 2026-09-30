import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET

  if (!SIGNING_SECRET) {
    throw new Error('Error: Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env or .env.local')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(SIGNING_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error: Could not verify webhook:', err)
    return new Response('Error: Verification failed', { status: 400 })
  }

  const { type } = evt

  if (type === 'user.created' || type === 'user.updated') {
 
	const { id, email_addresses, first_name, last_name, primary_email_address_id } = evt.data

    // Trouver l'email principal
    const primaryEmail = email_addresses.find(
      email => email.id === primary_email_address_id
    ) || email_addresses[0]

    const userData = {
      clerkId: id,
      email: primaryEmail?.email_address || '',
      nom: last_name || null,
      prenom: first_name || null,
      role: 'ELEVE',
    }

    try {
      await db.user.upsert({
        where: { clerkId: id },
        update: userData,
        create: userData,
      })
      console.log(`User ${type === 'user.created' ? 'created' : 'updated'}: ${id}`)
    } catch (error) {
      console.error('Error upserting user:', error)
    }
  }

  return new Response('Webhook received', { status: 200 })
}