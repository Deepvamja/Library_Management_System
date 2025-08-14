"use server"

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getItems() {
    const items = await prisma.item.findMany({
        include: {
            transactions: true,
            reservations: true,
        },
    });

    return items.map(item => {
        const isIssued = item.transactions.some(t => t.isReturned === false);
        const isReserved = !isIssued && item.reservations.length > 0;

        let status = "Available";
        if (isIssued) status = "Issued";
        else if (isReserved) status = "Reserved";

        return {
            ...item,
            status,
        };
    });
}

// Add new item
export async function addItem(data: {
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
}) {
  try {
    const item = await prisma.item.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn || null,
        subject: data.subject || null,
        keywords: data.keywords || null,
        itemType: data.itemType,
        price: data.price,
        imageUrl: data.imageUrl || null,
        totalCopies: data.totalCopies,
        availableCopies: data.availableCopies,
        isVisible: true
      }
    })

    revalidatePath('/librarian/catalog')
    return { success: true, item }
  } catch (error) {
    console.error('Error adding item:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add item" 
    }
  }
}

// Update existing item
export async function updateItem(itemId: number, data: {
  title?: string
  author?: string
  isbn?: string
  subject?: string
  keywords?: string
  itemType?: string
  price?: number
  imageUrl?: string
  totalCopies?: number
  availableCopies?: number
  isVisible?: boolean
}) {
  try {
    const item = await prisma.item.update({
      where: { itemId },
      data: {
        ...data,
        isbn: data.isbn || null,
        subject: data.subject || null,
        keywords: data.keywords || null,
        imageUrl: data.imageUrl || null
      }
    })

    revalidatePath('/librarian/catalog')
    return { success: true, item }
  } catch (error) {
    console.error('Error updating item:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update item" 
    }
  }
}

// Update item status
export async function updateItemStatus(itemId: number, status: 'available' | 'lost' | 'damaged' | 'under_repair' | 'withdrawn') {
  try {
    // For now, we'll use the isVisible field to manage some statuses
    const updateData: any = {}
    
    if (status === 'withdrawn') {
      updateData.isVisible = false
    } else {
      updateData.isVisible = true
    }
    
    // If lost or damaged, set available copies to 0
    if (status === 'lost' || status === 'damaged') {
      updateData.availableCopies = 0
    }

    const item = await prisma.item.update({
      where: { itemId },
      data: updateData
    })

    revalidatePath('/librarian/catalog')
    return { success: true, item }
  } catch (error) {
    console.error('Error updating item status:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update item status" 
    }
  }
}

// Get single item by ID
export async function getItemById(itemId: number) {
  try {
    const item = await prisma.item.findUnique({
      where: { itemId },
      include: {
        transactions: true,
        reservations: true
      }
    })

    if (!item) {
      return { success: false, error: "Item not found" }
    }

    // Calculate status
    const isIssued = item.transactions.some(t => t.isReturned === false)
    const isReserved = !isIssued && item.reservations.length > 0
    
    let status = "Available"
    if (!item.isVisible) status = "Withdrawn"
    else if (isIssued) status = "Issued"
    else if (isReserved) status = "Reserved"

    return {
      success: true,
      item: {
        ...item,
        status
      }
    }
  } catch (error) {
    console.error('Error fetching item:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch item" 
    }
  }
}

export async function deleteItem(itemId: number) {
    try {
        // Check if item has active transactions or reservations
        const item = await prisma.item.findUnique({
            where: { itemId },
            include: {
                transactions: {
                    where: { isReturned: false }
                },
                reservations: true
            }
        });

        if (!item) {
            throw new Error("Item not found");
        }

        if (item.transactions.length > 0) {
            throw new Error("Cannot delete item with active loans");
        }

        if (item.reservations.length > 0) {
            throw new Error("Cannot delete item with active reservations");
        }

        // Delete the item
        await prisma.item.delete({
            where: { itemId }
        });

        revalidatePath('/librarian/catalog')
        return { success: true };
    } catch (error) {
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Unknown error" 
        };
    }
}
