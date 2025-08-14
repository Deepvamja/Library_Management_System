'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

// Get all visible items with search and filtering
export async function getItems(searchParams?: {
  query?: string
  searchType?: string
  subject?: string
  itemType?: string
  availability?: string
}) {
  try {
    const { query = '', searchType = 'all', subject = '', itemType = '', availability = '' } = searchParams || {}

    let whereClause: any = {
      isVisible: true
    }

    // Add search filter
    if (query) {
      switch (searchType) {
        case 'title':
          whereClause.title = { contains: query }
          break
        case 'author':
          whereClause.author = { contains: query }
          break
        case 'isbn':
          whereClause.isbn = { contains: query }
          break
        case 'subject':
          whereClause.subject = { contains: query }
          break
        case 'keywords':
          whereClause.keywords = { contains: query }
          break
        default:
          whereClause.OR = [
            { title: { contains: query } },
            { author: { contains: query } },
            { subject: { contains: query } },
            { keywords: { contains: query } }
          ]
      }
    }

    // Add additional filters
    if (subject) {
      whereClause.subject = subject
    }

    if (itemType) {
      whereClause.itemType = itemType
    }

    if (availability === 'available') {
      whereClause.availableCopies = { gt: 0 }
    } else if (availability === 'unavailable') {
      whereClause.availableCopies = 0
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      orderBy: {
        title: 'asc'
      }
    })

    return { success: true, items }
  } catch (error) {
    console.error('Error fetching items:', error)
    return { success: false, error: 'Failed to fetch items' }
  }
}

// Get patron profile by ID
export async function getPatronProfile(patronId: number) {
  try {
    const patron = await prisma.patron.findUnique({
      where: { patronId },
      include: {
        studentProfile: true,
        facultyProfile: true
      }
    })

    if (!patron) {
      return { success: false, error: 'Patron not found' }
    }

    return { success: true, patron }
  } catch (error) {
    console.error('Error fetching patron profile:', error)
    return { success: false, error: 'Failed to fetch patron profile' }
  }
}

// Update patron profile
export async function updatePatronProfile(patronId: number, data: {
  patronFirstName?: string
  patronLastName?: string
  patronEmail?: string
}) {
  try {
    const updatedPatron = await prisma.patron.update({
      where: { patronId },
      data: {
        patronFirstName: data.patronFirstName,
        patronLastName: data.patronLastName,
        patronEmail: data.patronEmail,
      },
      include: {
        studentProfile: true,
        facultyProfile: true
      }
    })

    revalidatePath('/patron')
    return { success: true, patron: updatedPatron }
  } catch (error) {
    console.error('Error updating patron profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

// Get patron's borrowing history
export async function getPatronBorrowingHistory(patronId: number) {
  try {
    console.log('getPatronBorrowingHistory called with patronId:', patronId)
    const transactions = await prisma.transaction.findMany({
      where: { patronId },
      include: {
        item: true
      },
      orderBy: {
        borrowedAt: 'desc'
      }
    })
    console.log('Found transactions:', transactions.length)
    return { success: true, transactions }
  } catch (error) {
    console.error('Error fetching borrowing history:', error)
    return { success: false, error: `Failed to fetch borrowing history: ${error instanceof Error ? error.message : String(error)}` }
  }
}

// Get patron's current borrowed items
export async function getCurrentBorrowedItems(patronId: number) {
  try {
    console.log('getCurrentBorrowedItems called with patronId:', patronId)
    const transactions = await prisma.transaction.findMany({
      where: { 
        patronId,
        isReturned: false
      },
      include: {
        item: true
      },
      orderBy: {
        borrowedAt: 'desc'
      }
    })
    console.log('Found current borrowed items:', transactions.length)
    return { success: true, transactions }
  } catch (error) {
    console.error('Error fetching current borrowed items:', error)
    return { success: false, error: `Failed to fetch current borrowed items: ${error instanceof Error ? error.message : String(error)}` }
  }
}

// Get patron's reservations
export async function getPatronReservations(patronId: number) {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { patronId },
      include: {
        item: true
      },
      orderBy: {
        reservedAt: 'desc'
      }
    })

    return { success: true, reservations }
  } catch (error) {
    console.error('Error fetching reservations:', error)
    return { success: false, error: 'Failed to fetch reservations' }
  }
}

// Calculate patron's pending fines
export async function getPatronFines(patronId: number) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        patronId,
        OR: [
          { isReturned: false, dueDate: { lt: new Date() } }, // Overdue items
          { finePaid: { gt: 0 } } // Items with recorded fines
        ]
      }
    })

    const librarySettings = await prisma.librarySettings.findFirst()
    const finePerDay = librarySettings?.finePerDay || 1.0

    let totalFines = 0

    transactions.forEach(transaction => {
      if (transaction.finePaid && transaction.finePaid > 0) {
        totalFines += transaction.finePaid
      } else if (!transaction.isReturned && transaction.dueDate && transaction.dueDate < new Date()) {
        // Calculate overdue fine
        const daysOverdue = Math.floor(
          (new Date().getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (daysOverdue > 0) {
          totalFines += daysOverdue * finePerDay
        }
      }
    })

    return { success: true, totalFines }
  } catch (error) {
    console.error('Error calculating fines:', error)
    return { success: false, error: 'Failed to calculate fines' }
  }
}

// Create a reservation
export async function createReservation(patronId: number, itemId: number) {
  try {
    // Check if item is available
    const item = await prisma.item.findUnique({
      where: { itemId }
    })

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    if (item.availableCopies > 0) {
      return { success: false, error: 'Item is currently available, no need to reserve' }
    }

    // Check if patron already has a reservation for this item
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        itemId_patronId: {
          itemId,
          patronId
        }
      }
    })

    if (existingReservation) {
      return { success: false, error: 'You already have a reservation for this item' }
    }

    const reservation = await prisma.reservation.create({
      data: {
        patronId,
        itemId
      },
      include: {
        item: true
      }
    })

    revalidatePath('/patron')
    return { success: true, reservation }
  } catch (error) {
    console.error('Error creating reservation:', error)
    return { success: false, error: 'Failed to create reservation' }
  }
}

// Cancel a reservation
export async function cancelReservation(patronId: number, itemId: number) {
  try {
    await prisma.reservation.delete({
      where: {
        itemId_patronId: {
          itemId,
          patronId
        }
      }
    })

    revalidatePath('/patron')
    return { success: true }
  } catch (error) {
    console.error('Error canceling reservation:', error)
    return { success: false, error: 'Failed to cancel reservation' }
  }
}

// Get item by ID
export async function getItemById(itemId: number) {
  try {
    const item = await prisma.item.findUnique({
      where: { itemId }
    })

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    return { success: true, item }
  } catch (error) {
    console.error('Error fetching item:', error)
    return { success: false, error: 'Failed to fetch item' }
  }
}

// Get unique subjects for filtering
export async function getUniqueSubjects() {
  try {
    const subjects = await prisma.item.findMany({
      where: {
        isVisible: true,
        subject: { not: null }
      },
      select: {
        subject: true
      },
      distinct: ['subject']
    })

    return { success: true, subjects: subjects.map(s => s.subject).filter(Boolean) }
  } catch (error) {
    console.error('Error fetching subjects:', error)
    return { success: false, error: 'Failed to fetch subjects' }
  }
}

// Get unique item types for filtering
export async function getUniqueItemTypes() {
  try {
    const itemTypes = await prisma.item.findMany({
      where: {
        isVisible: true
      },
      select: {
        itemType: true
      },
      distinct: ['itemType']
    })

    return { success: true, itemTypes: itemTypes.map(i => i.itemType) }
  } catch (error) {
    console.error('Error fetching item types:', error)
    return { success: false, error: 'Failed to fetch item types' }
  }
}

// Create a purchase request
export async function createPurchaseRequest(patronId: number, requestData: {
  title: string
  author: string
  isbn?: string
  subject?: string
  itemType: string
  justification: string
  urgency?: string
  estimatedPrice?: number
  preferredVendor?: string
  additionalNotes?: string
}) {
  try {
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        patronId,
        title: requestData.title,
        author: requestData.author,
        isbn: requestData.isbn || null,
        subject: requestData.subject || null,
        itemType: requestData.itemType,
        justification: requestData.justification,
        urgency: requestData.urgency || 'NORMAL',
        estimatedPrice: requestData.estimatedPrice || null,
        preferredVendor: requestData.preferredVendor || null,
        additionalNotes: requestData.additionalNotes || null,
      }
    })

    revalidatePath('/patron')
    return { success: true, purchaseRequest }
  } catch (error) {
    console.error('Error creating purchase request:', error)
    return { success: false, error: 'Failed to create purchase request' }
  }
}

// Get patron's purchase requests
export async function getPatronPurchaseRequests(patronId: number) {
  try {
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      where: { patronId },
      orderBy: {
        requestedAt: 'desc'
      }
    })

    return { success: true, purchaseRequests }
  } catch (error) {
    console.error('Error fetching purchase requests:', error)
    return { success: false, error: 'Failed to fetch purchase requests' }
  }
}

// Cancel a purchase request (only if status is PENDING)
export async function cancelPurchaseRequest(patronId: number, purchaseRequestId: number) {
  try {
    // Check if the request exists and belongs to the patron
    const existingRequest = await prisma.purchaseRequest.findFirst({
      where: {
        purchaseRequestId,
        patronId,
        status: 'PENDING' // Only pending requests can be cancelled by patrons
      }
    })

    if (!existingRequest) {
      return { success: false, error: 'Purchase request not found or cannot be cancelled' }
    }

    await prisma.purchaseRequest.delete({
      where: { purchaseRequestId }
    })

    revalidatePath('/patron')
    return { success: true }
  } catch (error) {
    console.error('Error cancelling purchase request:', error)
    return { success: false, error: 'Failed to cancel purchase request' }
  }
}

// Borrow an item
export async function borrowItem(patronId: number, itemId: number) {
  try {
    // Get library settings for loan period and borrowing limit
    const librarySettings = await prisma.librarySettings.findFirst()
    const loanPeriodDays = librarySettings?.loanPeriodDays || 14
    const borrowingLimit = librarySettings?.borrowingLimit || 5

    // Check if patron exists
    const patron = await prisma.patron.findUnique({
      where: { patronId },
      include: {
        borrowedItems: {
          where: { isReturned: false }
        }
      }
    })

    if (!patron) {
      return { success: false, error: 'Patron not found' }
    }

    // Check borrowing limit
    if (patron.borrowedItems.length >= borrowingLimit) {
      return { success: false, error: `You have reached the maximum borrowing limit of ${borrowingLimit} items. Please return some items before borrowing more.` }
    }

    // Check if item exists and is available
    const item = await prisma.item.findUnique({
      where: { itemId }
    })

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    if (!item.isVisible) {
      return { success: false, error: 'This item is not available for borrowing' }
    }

    if (item.availableCopies <= 0) {
      return { success: false, error: 'No copies of this item are currently available' }
    }

    // Check if patron already has this item borrowed
    const existingBorrow = await prisma.transaction.findFirst({
      where: {
        patronId,
        itemId,
        isReturned: false
      }
    })

    if (existingBorrow) {
      return { success: false, error: 'You already have this item borrowed' }
    }

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + loanPeriodDays)

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the borrowing transaction
      const transaction = await tx.transaction.create({
        data: {
          patronId,
          itemId,
          borrowedAt: new Date(),
          dueDate,
          isReturned: false,
          finePaid: 0
        },
        include: {
          item: true,
          patron: true
        }
      })

      // Decrease available copies
      await tx.item.update({
        where: { itemId },
        data: {
          availableCopies: {
            decrement: 1
          }
        }
      })

      // If patron had a reservation for this item, remove it
      await tx.reservation.deleteMany({
        where: {
          patronId,
          itemId
        }
      })

      return transaction
    })

    revalidatePath('/patron')
    return { 
      success: true, 
      transaction: result,
      message: `Successfully borrowed "${result.item.title}". Due date: ${result.dueDate.toLocaleDateString()}` 
    }
  } catch (error) {
    console.error('Error borrowing item:', error)
    return { success: false, error: 'Failed to borrow item. Please try again.' }
  }
}
