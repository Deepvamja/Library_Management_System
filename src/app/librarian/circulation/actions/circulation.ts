'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'

// Issue a book to a patron
export async function issueBook(patronId: number, itemId: number) {
  try {
    // Check if the item is available
    const item = await prisma.item.findUnique({
      where: { itemId }
    })

    if (!item) {
      return { success: false, error: 'Item not found' }
    }

    if (item.availableCopies <= 0) {
      return { success: false, error: 'No available copies' }
    }

    // Check if patron exists
    const patron = await prisma.patron.findUnique({
      where: { patronId }
    })

    if (!patron) {
      return { success: false, error: 'Patron not found' }
    }

    // Get library settings for loan period
    const settings = await prisma.librarySettings.findFirst()
    const loanPeriodDays = settings?.loanPeriodDays || 14

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + loanPeriodDays)

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        patronId,
        itemId,
        dueDate,
        isReturned: false
      },
      include: {
        item: true,
        patron: true
      }
    })

    // Update available copies
    await prisma.item.update({
      where: { itemId },
      data: {
        availableCopies: item.availableCopies - 1
      }
    })

    revalidatePath('/librarian/circulation')
    return { success: true, transaction }
  } catch (error) {
    console.error('Error issuing book:', error)
    return { success: false, error: 'Failed to issue book' }
  }
}

// Return a book
export async function returnBook(transactionId: number) {
  try {
    // Get the transaction
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      include: { item: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.isReturned) {
      return { success: false, error: 'Book already returned' }
    }

    // Calculate fine if overdue
    let fine = 0
    const currentDate = new Date()
    if (currentDate > transaction.dueDate) {
      const settings = await prisma.librarySettings.findFirst()
      const finePerDay = settings?.finePerDay || 1.0
      const daysOverdue = Math.floor(
        (currentDate.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      fine = daysOverdue * finePerDay
    }

    // Update transaction
    const updatedTransaction = await prisma.transaction.update({
      where: { transactionId },
      data: {
        isReturned: true,
        returnedAt: currentDate,
        finePaid: fine > 0 ? fine : null
      },
      include: {
        item: true,
        patron: true
      }
    })

    // Update available copies
    await prisma.item.update({
      where: { itemId: transaction.itemId },
      data: {
        availableCopies: transaction.item.availableCopies + 1
      }
    })

    revalidatePath('/librarian/circulation')
    return { success: true, transaction: updatedTransaction, fine }
  } catch (error) {
    console.error('Error returning book:', error)
    return { success: false, error: 'Failed to return book' }
  }
}

// Renew a book
export async function renewBook(transactionId: number) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      include: { item: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    if (transaction.isReturned) {
      return { success: false, error: 'Book already returned' }
    }

    // Check if book is overdue
    const currentDate = new Date()
    if (currentDate > transaction.dueDate) {
      return { success: false, error: 'Cannot renew overdue book. Please return and pay fine first.' }
    }

    // Get library settings for loan period
    const settings = await prisma.librarySettings.findFirst()
    const loanPeriodDays = settings?.loanPeriodDays || 14

    // Extend due date
    const newDueDate = new Date(transaction.dueDate)
    newDueDate.setDate(newDueDate.getDate() + loanPeriodDays)

    const renewedTransaction = await prisma.transaction.update({
      where: { transactionId },
      data: {
        dueDate: newDueDate
      },
      include: {
        item: true,
        patron: true
      }
    })

    revalidatePath('/librarian/circulation')
    return { success: true, transaction: renewedTransaction }
  } catch (error) {
    console.error('Error renewing book:', error)
    return { success: false, error: 'Failed to renew book' }
  }
}

// Get all active transactions
export async function getActiveTransactions() {
  console.log('🔍 [SERVER] Getting active transactions...')
  
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        isReturned: false
      },
      include: {
        item: true,
        patron: true
      },
      orderBy: {
        borrowedAt: 'desc'
      }
    })
    
    console.log(`✅ [SERVER] Found ${transactions.length} active transactions`)

    // Add overdue status and fine calculation
    const currentDate = new Date()
    const settings = await prisma.librarySettings.findFirst()
    const finePerDay = settings?.finePerDay || 1.0

    const transactionsWithStatus = transactions.map(transaction => {
      const isOverdue = currentDate > transaction.dueDate
      let calculatedFine = 0

      if (isOverdue) {
        const daysOverdue = Math.floor(
          (currentDate.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        calculatedFine = daysOverdue * finePerDay
      }

      return {
        ...transaction,
        isOverdue,
        calculatedFine,
        daysUntilDue: isOverdue ? 0 : Math.floor(
          (transaction.dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      }
    })

    return { success: true, transactions: transactionsWithStatus }
  } catch (error) {
    console.error('Error fetching active transactions:', error)
    return { success: false, error: 'Failed to fetch active transactions' }
  }
}

// Get overdue transactions
export async function getOverdueTransactions() {
  try {
    const currentDate = new Date()
    const transactions = await prisma.transaction.findMany({
      where: {
        isReturned: false,
        dueDate: {
          lt: currentDate
        }
      },
      include: {
        item: true,
        patron: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    // Calculate fines
    const settings = await prisma.librarySettings.findFirst()
    const finePerDay = settings?.finePerDay || 1.0

    const overdueTransactions = transactions.map(transaction => {
      const daysOverdue = Math.floor(
        (currentDate.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const calculatedFine = daysOverdue * finePerDay

      return {
        ...transaction,
        daysOverdue,
        calculatedFine
      }
    })

    return { success: true, transactions: overdueTransactions }
  } catch (error) {
    console.error('Error fetching overdue transactions:', error)
    return { success: false, error: 'Failed to fetch overdue transactions' }
  }
}

// Search patrons
export async function searchPatrons(query: string) {
  console.log(`🔍 [SERVER] Searching for patrons with query: "${query}"`)
  
  try {
    const patrons = await prisma.patron.findMany({
      where: {
        OR: [
          { patronFirstName: { contains: query } },
          { patronLastName: { contains: query } },
          { patronEmail: { contains: query } }
        ]
      },
      include: {
        studentProfile: true,
        facultyProfile: true
      },
      take: 10
    })

    console.log(`✅ [SERVER] Found ${patrons.length} patrons for query "${query}"`)
    if (patrons.length > 0) {
      console.log(`[SERVER] First few results:`, patrons.slice(0, 3).map(p => `${p.patronFirstName} ${p.patronLastName} (${p.patronEmail})`).join(', '))
    }

    return { success: true, patrons }
  } catch (error) {
    console.error('❌ [SERVER] Error searching patrons:', error)
    return { success: false, error: 'Failed to search patrons' }
  }
}

// Search items
export async function searchItems(query: string) {
  try {
    const items = await prisma.item.findMany({
      where: {
        isVisible: true,
        OR: [
          { title: { contains: query } },
          { author: { contains: query } },
          { isbn: { contains: query } }
        ]
      },
      take: 10
    })

    return { success: true, items }
  } catch (error) {
    console.error('Error searching items:', error)
    return { success: false, error: 'Failed to search items' }
  }
}

// Collect fine
export async function collectFine(transactionId: number, amount: number) {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { transactionId },
      include: { item: true, patron: true }
    })

    if (!transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { transactionId },
      data: {
        finePaid: amount
      },
      include: {
        item: true,
        patron: true
      }
    })

    revalidatePath('/librarian/circulation')
    return { success: true, transaction: updatedTransaction }
  } catch (error) {
    console.error('Error collecting fine:', error)
    return { success: false, error: 'Failed to collect fine' }
  }
}
