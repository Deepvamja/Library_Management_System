'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get comprehensive dashboard statistics
export async function getDashboardStats() {
  try {
    const [
      totalPatrons,
      totalItems,
      totalTransactions,
      totalReservations,
      totalAdmins,
      totalLibrarians,
      activeTransactions,
      overdueTransactions,
      availableItems,
      totalRevenue
    ] = await Promise.all([
      prisma.patron.count(),
      prisma.item.count(),
      prisma.transaction.count(),
      prisma.reservation.count(),
      prisma.admin.count(),
      prisma.librarian.count(),
      prisma.transaction.count({ where: { isReturned: false } }),
      prisma.transaction.count({ 
        where: { 
          isReturned: false,
          dueDate: { lt: new Date() }
        } 
      }),
      prisma.item.aggregate({ _sum: { availableCopies: true } }),
      prisma.transaction.aggregate({ _sum: { finePaid: true } })
    ])

    return {
      success: true,
      data: {
        totalPatrons,
        totalItems,
        totalTransactions,
        totalReservations,
        totalAdmins,
        totalLibrarians,
        activeTransactions,
        overdueTransactions,
        availableItems: availableItems._sum.availableCopies || 0,
        totalRevenue: totalRevenue._sum.finePaid || 0,
        totalUsers: totalPatrons + totalAdmins + totalLibrarians
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

// Get recent activities
export async function getRecentActivities() {
  try {
    const [recentTransactions, recentReservations] = await Promise.all([
      prisma.transaction.findMany({
        take: 5,
        orderBy: { borrowedAt: 'desc' },
        include: {
          patron: true,
          item: true
        }
      }),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { reservedAt: 'desc' },
        include: {
          patron: true,
          item: true
        }
      })
    ])

    const activities = [
      ...recentTransactions.map(t => ({
        id: `transaction-${t.transactionId}`,
        type: 'transaction',
        action: t.isReturned ? 'returned' : 'borrowed',
        user: `${t.patron.patronFirstName} ${t.patron.patronLastName}`,
        item: t.item.title,
        timestamp: t.isReturned ? t.returnedAt : t.borrowedAt,
        status: t.isReturned ? 'completed' : 'active'
      })),
      ...recentReservations.map(r => ({
        id: `reservation-${r.reservationId}`,
        type: 'reservation',
        action: 'reserved',
        user: `${r.patron.patronFirstName} ${r.patron.patronLastName}`,
        item: r.item.title,
        timestamp: r.reservedAt,
        status: 'pending'
      }))
    ]

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return {
      success: true,
      data: activities.slice(0, 10) // Return top 10 most recent activities
    }
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    return {
      success: false,
      error: 'Failed to fetch recent activities'
    }
  }
}

// Get popular items
export async function getPopularItems() {
  try {
    const popularItems = await prisma.item.findMany({
      include: {
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: {
        transactions: {
          _count: 'desc'
        }
      },
      take: 5
    })

    return {
      success: true,
      data: popularItems.map(item => ({
        itemId: item.itemId,
        title: item.title,
        author: item.author,
        itemType: item.itemType,
        borrowCount: item._count.transactions,
        availableCopies: item.availableCopies,
        totalCopies: item.totalCopies
      }))
    }
  } catch (error) {
    console.error('Error fetching popular items:', error)
    return {
      success: false,
      error: 'Failed to fetch popular items'
    }
  }
}

// Get monthly statistics for charts
export async function getMonthlyStats() {
  try {
    const currentDate = new Date()
    const sixMonthsAgo = new Date(currentDate.getFullYear(), currentDate.getMonth() - 5, 1)

    const monthlyTransactions = await prisma.transaction.groupBy({
      by: ['borrowedAt'],
      where: {
        borrowedAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        transactionId: true
      }
    })

    const monthlyReservations = await prisma.reservation.groupBy({
      by: ['reservedAt'],
      where: {
        reservedAt: {
          gte: sixMonthsAgo
        }
      },
      _count: {
        reservationId: true
      }
    })

    // Process data by month
    const monthlyData = {}
    const months = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      months.push(monthName)
      monthlyData[monthKey] = {
        month: monthName,
        transactions: 0,
        reservations: 0
      }
    }

    // Count transactions by month
    monthlyTransactions.forEach(t => {
      const date = new Date(t.borrowedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].transactions += t._count.transactionId
      }
    })

    // Count reservations by month
    monthlyReservations.forEach(r => {
      const date = new Date(r.reservedAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].reservations += r._count.reservationId
      }
    })

    return {
      success: true,
      data: Object.values(monthlyData)
    }
  } catch (error) {
    console.error('Error fetching monthly stats:', error)
    return {
      success: false,
      error: 'Failed to fetch monthly statistics'
    }
  }
}

// Get item type distribution
export async function getItemTypeDistribution() {
  try {
    const itemTypes = await prisma.item.groupBy({
      by: ['itemType'],
      _count: {
        itemId: true
      },
      orderBy: {
        _count: {
          itemId: 'desc'
        }
      }
    })

    return {
      success: true,
      data: itemTypes.map(type => ({
        type: type.itemType,
        count: type._count.itemId
      }))
    }
  } catch (error) {
    console.error('Error fetching item type distribution:', error)
    return {
      success: false,
      error: 'Failed to fetch item type distribution'
    }
  }
}

// Get overdue items
export async function getOverdueItems() {
  try {
    const overdueItems = await prisma.transaction.findMany({
      where: {
        isReturned: false,
        dueDate: {
          lt: new Date()
        }
      },
      include: {
        patron: true,
        item: true
      },
      orderBy: {
        dueDate: 'asc'
      },
      take: 10
    })

    return {
      success: true,
      data: overdueItems.map(transaction => ({
        transactionId: transaction.transactionId,
        patronName: `${transaction.patron.patronFirstName} ${transaction.patron.patronLastName}`,
        patronEmail: transaction.patron.patronEmail,
        itemTitle: transaction.item.title,
        dueDate: transaction.dueDate,
        daysOverdue: Math.ceil((new Date().getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      }))
    }
  } catch (error) {
    console.error('Error fetching overdue items:', error)
    return {
      success: false,
      error: 'Failed to fetch overdue items'
    }
  }
}

// Get system health metrics
export async function getSystemHealth() {
  try {
    const [
      databaseSize,
      totalTables,
      recentBackups
    ] = await Promise.all([
      // Get approximate database size by counting all records
      Promise.all([
        prisma.patron.count(),
        prisma.item.count(),
        prisma.transaction.count(),
        prisma.reservation.count(),
        prisma.admin.count(),
        prisma.librarian.count()
      ]).then(counts => counts.reduce((sum, count) => sum + count, 0)),
      
      // Count of main tables (approximation)
      Promise.resolve(6), // patron, item, transaction, reservation, admin, librarian
      
      // This would typically check backup files, but for now we'll return a placeholder
      Promise.resolve(0)
    ])

    const health = {
      databaseConnection: true,
      totalRecords: databaseSize,
      totalTables,
      lastBackup: null,
      uptime: process.uptime ? Math.floor(process.uptime()) : 0,
      memoryUsage: process.memoryUsage ? process.memoryUsage() : null
    }

    return {
      success: true,
      data: health
    }
  } catch (error) {
    console.error('Error fetching system health:', error)
    return {
      success: false,
      error: 'Failed to fetch system health metrics',
      data: {
        databaseConnection: false,
        totalRecords: 0,
        totalTables: 0,
        lastBackup: null,
        uptime: 0,
        memoryUsage: null
      }
    }
  }
}
