import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    const items = await prisma.item.findMany({
      include: {
        transactions: true,
        reservations: true,
      },
    })

    console.log(`Found ${items.length} items`)

    const itemsWithStatus = items.map(item => {
      const isIssued = item.transactions.some(t => t.isReturned === false)
      const isReserved = !isIssued && item.reservations.length > 0

      let status = "Available"
      if (isIssued) status = "Issued"
      else if (isReserved) status = "Reserved"

      return {
        ...item,
        status,
      }
    })

    return NextResponse.json({ 
      success: true, 
      count: itemsWithStatus.length,
      items: itemsWithStatus 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
