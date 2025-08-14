'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Dashboard Statistics
export async function getDashboardStats() {
  try {
    const [
      totalBooks,
      totalPatrons,
      activeLoans,
      overdueLoans,
      totalReservations,
      availableBooks,
      totalFines
    ] = await Promise.all([
      // Total books
      prisma.item.count({
        where: { isVisible: true }
      }),
      
      // Total patrons
      prisma.patron.count(),
      
      // Active loans
      prisma.transaction.count({
        where: { isReturned: false }
      }),
      
      // Overdue loans
      prisma.transaction.count({
        where: {
          isReturned: false,
          dueDate: { lt: new Date() }
        }
      }),
      
      // Total reservations
      prisma.reservation.count(),
      
      // Available books
      prisma.item.aggregate({
        _sum: { availableCopies: true },
        where: { isVisible: true }
      }),
      
      // Total fines (approximate)
      prisma.transaction.aggregate({
        _sum: { finePaid: true }
      })
    ])

    return {
      success: true,
      data: {
        totalBooks,
        totalPatrons,
        activeLoans,
        overdueLoans,
        totalReservations,
        availableBooks: availableBooks._sum.availableCopies || 0,
        totalFines: totalFines._sum.finePaid || 0
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      success: false,
      error: 'Failed to fetch dashboard statistics'
    }
  }
}

// Popular Books Report
export async function getPopularBooksReport(limit: number = 10) {
  try {
    const popularBooks = await prisma.item.findMany({
      include: {
        transactions: {
          select: { transactionId: true }
        },
        reservations: {
          select: { reservationId: true }
        }
      },
      where: { isVisible: true }
    })

    const booksWithStats = popularBooks.map(book => ({
      itemId: book.itemId,
      title: book.title,
      author: book.author,
      subject: book.subject,
      totalCopies: book.totalCopies,
      availableCopies: book.availableCopies,
      timesLost: book.transactions.length,
      currentReservations: book.reservations.length,
      popularityScore: book.transactions.length + (book.reservations.length * 0.5)
    }))

    const sortedBooks = booksWithStats
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit)

    return {
      success: true,
      data: sortedBooks
    }
  } catch (error) {
    console.error('Error fetching popular books:', error)
    return {
      success: false,
      error: 'Failed to fetch popular books report'
    }
  }
}

// Patron Activity Report
export async function getPatronActivityReport() {
  try {
    const patronStats = await prisma.patron.findMany({
      include: {
        borrowedItems: {
          where: { isReturned: false }
        },
        reservations: true,
        _count: {
          select: {
            borrowedItems: true
          }
        }
      }
    })

    const patronActivity = patronStats.map(patron => ({
      patronId: patron.patronId,
      name: `${patron.patronFirstName} ${patron.patronLastName}`,
      email: patron.patronEmail,
      currentLoans: patron.borrowedItems.length,
      totalBorrowings: patron._count.borrowedItems,
      activeReservations: patron.reservations.length,
      isStudent: patron.isStudent,
      isFaculty: patron.isFaculty,
      memberSince: patron.patronCreatedAt
    }))

    const sortedByActivity = patronActivity.sort((a, b) => b.totalBorrowings - a.totalBorrowings)

    return {
      success: true,
      data: sortedByActivity
    }
  } catch (error) {
    console.error('Error fetching patron activity:', error)
    return {
      success: false,
      error: 'Failed to fetch patron activity report'
    }
  }
}

// Overdue Items Report
export async function getOverdueItemsReport() {
  try {
    const overdueItems = await prisma.transaction.findMany({
      where: {
        isReturned: false,
        dueDate: { lt: new Date() }
      },
      include: {
        item: true,
        patron: true
      },
      orderBy: {
        dueDate: 'asc'
      }
    })

    const librarySettings = await prisma.librarySettings.findFirst()
    const finePerDay = librarySettings?.finePerDay || 1.0

    const overdueWithFines = overdueItems.map(transaction => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      const calculatedFine = daysOverdue * finePerDay

      return {
        transactionId: transaction.transactionId,
        bookTitle: transaction.item.title,
        bookAuthor: transaction.item.author,
        patronName: `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`,
        patronEmail: transaction.patron.patronEmail,
        borrowedAt: transaction.borrowedAt,
        dueDate: transaction.dueDate,
        daysOverdue,
        calculatedFine
      }
    })

    return {
      success: true,
      data: overdueWithFines
    }
  } catch (error) {
    console.error('Error fetching overdue items:', error)
    return {
      success: false,
      error: 'Failed to fetch overdue items report'
    }
  }
}

// Monthly Circulation Report
export async function getMonthlyCirculationReport(months: number = 6) {
  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const transactions = await prisma.transaction.findMany({
      where: {
        borrowedAt: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        borrowedAt: true,
        isReturned: true,
        returnedAt: true
      }
    })

    // Group by month
    const monthlyData = {}
    transactions.forEach(transaction => {
      const month = transaction.borrowedAt.toISOString().slice(0, 7) // YYYY-MM format
      if (!monthlyData[month]) {
        monthlyData[month] = {
          month,
          borrowed: 0,
          returned: 0
        }
      }
      monthlyData[month].borrowed++
      if (transaction.isReturned) {
        monthlyData[month].returned++
      }
    })

    const sortedData = Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    )

    return {
      success: true,
      data: sortedData
    }
  } catch (error) {
    console.error('Error fetching circulation report:', error)
    return {
      success: false,
      error: 'Failed to fetch circulation report'
    }
  }
}

// Subject-wise Distribution Report
export async function getSubjectDistributionReport() {
  try {
    const subjects = await prisma.item.groupBy({
      by: ['subject'],
      where: {
        isVisible: true,
        subject: { not: null }
      },
      _count: {
        subject: true
      },
      _sum: {
        totalCopies: true,
        availableCopies: true
      }
    })

    const subjectStats = subjects.map(subject => ({
      subject: subject.subject,
      totalBooks: subject._count.subject,
      totalCopies: subject._sum.totalCopies || 0,
      availableCopies: subject._sum.availableCopies || 0,
      circulationRate: ((subject._sum.totalCopies || 0) - (subject._sum.availableCopies || 0)) / (subject._sum.totalCopies || 1) * 100
    }))

    const sortedByCount = subjectStats.sort((a, b) => b.totalBooks - a.totalBooks)

    return {
      success: true,
      data: sortedByCount
    }
  } catch (error) {
    console.error('Error fetching subject distribution:', error)
    return {
      success: false,
      error: 'Failed to fetch subject distribution report'
    }
  }
}

// Fine Collection Report
export async function getFineCollectionReport() {
  try {
    const fineTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { finePaid: { gt: 0 } },
          {
            isReturned: false,
            dueDate: { lt: new Date() }
          }
        ]
      },
      include: {
        patron: true,
        item: true
      }
    })

    const librarySettings = await prisma.librarySettings.findFirst()
    const finePerDay = librarySettings?.finePerDay || 1.0

    let totalCollected = 0
    let totalPending = 0

    const fineDetails = fineTransactions.map(transaction => {
      const fine = transaction.finePaid || 0
      totalCollected += fine

      let pendingFine = 0
      if (!transaction.isReturned && transaction.dueDate < new Date()) {
        const daysOverdue = Math.floor(
          (new Date().getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        pendingFine = daysOverdue * finePerDay
        totalPending += pendingFine
      }

      return {
        transactionId: transaction.transactionId,
        patronName: `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`,
        bookTitle: transaction.item.title,
        fineCollected: fine,
        finePending: pendingFine,
        dueDate: transaction.dueDate,
        status: transaction.isReturned ? 'Returned' : 'Active'
      }
    })

    return {
      success: true,
      data: {
        summary: {
          totalCollected,
          totalPending,
          totalFines: totalCollected + totalPending
        },
        details: fineDetails
      }
    }
  } catch (error) {
    console.error('Error fetching fine collection report:', error)
    return {
      success: false,
      error: 'Failed to fetch fine collection report'
    }
  }
}
