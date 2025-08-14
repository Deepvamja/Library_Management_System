'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const prisma = new PrismaClient()

export interface ItemData {
  itemId?: number
  title: string
  author: string
  isbn?: string
  subject?: string
  keywords?: string
  itemType: string
  price: number
  imageUrl?: string
  totalCopies: number
  availableCopies: number
  isVisible: boolean
}

// Get all catalog items
export async function getAllItems() {
  try {
    const items = await prisma.item.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return {
      success: true,
      data: items
    }
  } catch (error) {
    console.error('Error fetching catalog items:', error)
    return {
      success: false,
      error: 'Failed to fetch catalog items'
    }
  }
}

// Get visible catalog items (for public catalog)
export async function getVisibleItems() {
  try {
    const items = await prisma.item.findMany({
      where: {
        isVisible: true,
        availableCopies: {
          gt: 0
        }
      },
      orderBy: {
        title: 'asc'
      }
    })

    return {
      success: true,
      data: items
    }
  } catch (error) {
    console.error('Error fetching visible items:', error)
    return {
      success: false,
      error: 'Failed to fetch catalog items'
    }
  }
}

// Search items
export async function searchItems(searchTerm: string) {
  try {
    const items = await prisma.item.findMany({
      where: {
        OR: [
          { title: { contains: searchTerm } },
          { author: { contains: searchTerm } },
          { isbn: { contains: searchTerm } },
          { subject: { contains: searchTerm } },
          { keywords: { contains: searchTerm } }
        ],
        isVisible: true
      },
      orderBy: {
        title: 'asc'
      }
    })

    return {
      success: true,
      data: items
    }
  } catch (error) {
    console.error('Error searching items:', error)
    return {
      success: false,
      error: 'Failed to search catalog items'
    }
  }
}

// Create a new catalog item
export async function createItem(itemData: ItemData) {
  try {
    const newItem = await prisma.item.create({
      data: {
        title: itemData.title,
        author: itemData.author,
        isbn: itemData.isbn,
        subject: itemData.subject,
        keywords: itemData.keywords,
        itemType: itemData.itemType,
        price: itemData.price,
        imageUrl: itemData.imageUrl,
        totalCopies: itemData.totalCopies,
        availableCopies: itemData.availableCopies,
        isVisible: itemData.isVisible
      }
    })

    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: 'Item added to catalog successfully',
      data: newItem
    }
  } catch (error) {
    console.error('Error creating catalog item:', error)
    return {
      success: false,
      error: 'Failed to add item to catalog'
    }
  }
}

// Update a catalog item
export async function updateItem(itemId: number, itemData: ItemData) {
  try {
    const updatedItem = await prisma.item.update({
      where: { itemId },
      data: {
        title: itemData.title,
        author: itemData.author,
        isbn: itemData.isbn,
        subject: itemData.subject,
        keywords: itemData.keywords,
        itemType: itemData.itemType,
        price: itemData.price,
        imageUrl: itemData.imageUrl,
        totalCopies: itemData.totalCopies,
        availableCopies: itemData.availableCopies,
        isVisible: itemData.isVisible
      }
    })

    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    }
  } catch (error) {
    console.error('Error updating catalog item:', error)
    return {
      success: false,
      error: 'Failed to update catalog item'
    }
  }
}

// Delete a catalog item
export async function deleteItem(itemId: number) {
  try {
    // Check if item has active transactions
    const activeTransactions = await prisma.transaction.count({
      where: {
        itemId,
        isReturned: false
      }
    })

    if (activeTransactions > 0) {
      return {
        success: false,
        error: 'Cannot delete item with active loans'
      }
    }

    // Check if item has pending reservations
    const activeReservations = await prisma.reservation.count({
      where: { itemId }
    })

    if (activeReservations > 0) {
      return {
        success: false,
        error: 'Cannot delete item with pending reservations'
      }
    }

    await prisma.item.delete({
      where: { itemId }
    })

    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: 'Item deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting catalog item:', error)
    return {
      success: false,
      error: 'Failed to delete catalog item'
    }
  }
}

// Toggle item visibility
export async function toggleItemVisibility(itemId: number) {
  try {
    const item = await prisma.item.findUnique({
      where: { itemId }
    })

    if (!item) {
      return {
        success: false,
        error: 'Item not found'
      }
    }

    const updatedItem = await prisma.item.update({
      where: { itemId },
      data: {
        isVisible: !item.isVisible
      }
    })

    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: `Item ${updatedItem.isVisible ? 'shown' : 'hidden'} successfully`,
      data: updatedItem
    }
  } catch (error) {
    console.error('Error toggling item visibility:', error)
    return {
      success: false,
      error: 'Failed to update item visibility'
    }
  }
}

// Update item copies
export async function updateItemCopies(itemId: number, totalCopies: number) {
  try {
    const item = await prisma.item.findUnique({
      where: { itemId }
    })

    if (!item) {
      return {
        success: false,
        error: 'Item not found'
      }
    }

    // Calculate new available copies
    const borrowedCopies = item.totalCopies - item.availableCopies
    const newAvailableCopies = Math.max(0, totalCopies - borrowedCopies)

    const updatedItem = await prisma.item.update({
      where: { itemId },
      data: {
        totalCopies,
        availableCopies: newAvailableCopies
      }
    })

    revalidatePath('/admin/catalog')
    return {
      success: true,
      message: 'Item copies updated successfully',
      data: updatedItem
    }
  } catch (error) {
    console.error('Error updating item copies:', error)
    return {
      success: false,
      error: 'Failed to update item copies'
    }
  }
}

// Get catalog statistics
export async function getCatalogStatistics() {
  try {
    const [
      totalItems,
      visibleItems,
      totalCopies,
      availableCopies,
      borrowedCopies,
      uniqueAuthors,
      itemTypes
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { isVisible: true } }),
      prisma.item.aggregate({ _sum: { totalCopies: true } }),
      prisma.item.aggregate({ _sum: { availableCopies: true } }),
      prisma.transaction.count({ where: { isReturned: false } }),
      prisma.item.groupBy({
        by: ['author'],
        _count: { author: true }
      }),
      prisma.item.groupBy({
        by: ['itemType'],
        _count: { itemType: true }
      })
    ])

    return {
      success: true,
      data: {
        totalItems,
        visibleItems,
        hiddenItems: totalItems - visibleItems,
        totalCopies: totalCopies._sum.totalCopies || 0,
        availableCopies: availableCopies._sum.availableCopies || 0,
        borrowedCopies,
        uniqueAuthors: uniqueAuthors.length,
        itemTypes: itemTypes.map(type => ({
          type: type.itemType,
          count: type._count.itemType
        }))
      }
    }
  } catch (error) {
    console.error('Error fetching catalog statistics:', error)
    return {
      success: false,
      error: 'Failed to fetch catalog statistics'
    }
  }
}
