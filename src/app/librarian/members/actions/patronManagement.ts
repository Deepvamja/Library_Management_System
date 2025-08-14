'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// Get all patrons with their profiles and basic stats
export async function getAllPatrons() {
  try {
    const patrons = await prisma.patron.findMany({
      include: {
        studentProfile: true,
        facultyProfile: true,
        borrowedItems: {
          where: { isReturned: false },
          include: { item: true }
        },
        reservations: {
          include: { item: true }
        },
        _count: {
          select: {
            borrowedItems: true,
            reservations: true
          }
        }
      },
      orderBy: {
        patronCreatedAt: 'desc'
      }
    })

    return { success: true, patrons }
  } catch (error) {
    console.error('Error fetching patrons:', error)
    return { success: false, error: 'Failed to fetch patrons' }
  }
}

// Search patrons by name, email, or ID
export async function searchPatrons(query: string) {
  try {
    const patrons = await prisma.patron.findMany({
      where: {
        OR: [
          { patronFirstName: { contains: query, mode: 'insensitive' } },
          { patronLastName: { contains: query, mode: 'insensitive' } },
          { patronEmail: { contains: query, mode: 'insensitive' } },
          { patronId: { equals: isNaN(parseInt(query)) ? undefined : parseInt(query) } }
        ]
      },
      include: {
        studentProfile: true,
        facultyProfile: true,
        borrowedItems: {
          where: { isReturned: false },
          include: { item: true }
        },
        reservations: {
          include: { item: true }
        }
      }
    })

    return { success: true, patrons }
  } catch (error) {
    console.error('Error searching patrons:', error)
    return { success: false, error: 'Failed to search patrons' }
  }
}

// Register new patron (librarian function)
export async function registerPatron(data: {
  patronFirstName: string
  patronLastName: string
  patronEmail: string
  patronPassword: string
  patronType: 'student' | 'faculty' | 'general'
  // Student fields
  studentDepartment?: string
  studentSemester?: number
  studentRollNo?: number
  studentEnrollmentNumber?: number
  // Faculty fields
  facultyDepartment?: string
}) {
  try {
    // Check if email already exists
    const existingPatron = await prisma.patron.findUnique({
      where: { patronEmail: data.patronEmail }
    })

    if (existingPatron) {
      return { success: false, error: 'Email address already registered' }
    }

    let patronData: any = {
      patronFirstName: data.patronFirstName,
      patronLastName: data.patronLastName,
      patronEmail: data.patronEmail,
      patronPassword: data.patronPassword,
      isStudent: data.patronType === 'student',
      isFaculty: data.patronType === 'faculty'
    }

    if (data.patronType === 'student') {
      patronData.studentProfile = {
        create: {
          studentDepartment: data.studentDepartment,
          studentSemester: data.studentSemester,
          studentRollNo: data.studentRollNo,
          studentEnrollmentNumber: data.studentEnrollmentNumber
        }
      }
    } else if (data.patronType === 'faculty') {
      patronData.facultyProfile = {
        create: {
          facultyDepartment: data.facultyDepartment
        }
      }
    }

    const newPatron = await prisma.patron.create({
      data: patronData,
      include: {
        studentProfile: true,
        facultyProfile: true
      }
    })

    revalidatePath('/librarian/members')
    return { success: true, patron: newPatron }
  } catch (error) {
    console.error('Error registering patron:', error)
    return { success: false, error: 'Failed to register patron' }
  }
}

// Update patron information
export async function updatePatron(patronId: number, data: {
  patronFirstName?: string
  patronLastName?: string
  patronEmail?: string
  // Student fields (new structure)
  studentProfile?: {
    studentId?: string
    program?: string
    year?: number
  } | null
  // Faculty fields (new structure)
  facultyProfile?: {
    department?: string
  } | null
  // Legacy student fields (for backward compatibility)
  studentDepartment?: string
  studentSemester?: number
  studentRollNo?: number
  studentEnrollmentNumber?: number
  // Legacy faculty fields (for backward compatibility)
  facultyDepartment?: string
}) {
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

    // Update patron basic info
    let updateData: any = {}
    if (data.patronFirstName !== undefined) updateData.patronFirstName = data.patronFirstName
    if (data.patronLastName !== undefined) updateData.patronLastName = data.patronLastName
    if (data.patronEmail !== undefined) updateData.patronEmail = data.patronEmail

    const updatedPatron = await prisma.patron.update({
      where: { patronId },
      data: updateData,
      include: {
        studentProfile: true,
        facultyProfile: true,
        borrowedItems: {
          include: { item: true },
          orderBy: { borrowedAt: 'desc' }
        },
        reservations: {
          include: { item: true },
          orderBy: { reservedAt: 'desc' }
        }
      }
    })

    // Update student profile if exists and new data provided
    if (patron.studentProfile && data.studentProfile) {
      await prisma.student.update({
        where: { patronId },
        data: {
          // Map to existing database fields only
          studentDepartment: data.studentProfile.program,
          studentSemester: data.studentProfile.year,
          studentEnrollmentNumber: data.studentProfile.studentId ? parseInt(data.studentProfile.studentId) : undefined
        }
      })
    }
    // Legacy student profile update
    else if (patron.studentProfile && (
      data.studentDepartment !== undefined ||
      data.studentSemester !== undefined ||
      data.studentRollNo !== undefined ||
      data.studentEnrollmentNumber !== undefined
    )) {
      await prisma.student.update({
        where: { patronId },
        data: {
          studentDepartment: data.studentDepartment,
          studentSemester: data.studentSemester,
          studentRollNo: data.studentRollNo,
          studentEnrollmentNumber: data.studentEnrollmentNumber
        }
      })
    }

    // Update faculty profile if exists and new data provided
    if (patron.facultyProfile && data.facultyProfile) {
      await prisma.faculty.update({
        where: { patronId },
        data: {
          // Map to legacy field if needed
          facultyDepartment: data.facultyProfile.department
        }
      })
    }
    // Legacy faculty profile update
    else if (patron.facultyProfile && data.facultyDepartment !== undefined) {
      await prisma.faculty.update({
        where: { patronId },
        data: {
          facultyDepartment: data.facultyDepartment
        }
      })
    }

    // Fetch the fully updated patron with all relations
    const finalPatron = await prisma.patron.findUnique({
      where: { patronId },
      include: {
        studentProfile: true,
        facultyProfile: true,
        borrowedItems: {
          include: { item: true },
          orderBy: { borrowedAt: 'desc' }
        },
        reservations: {
          include: { item: true },
          orderBy: { reservedAt: 'desc' }
        }
      }
    })

    revalidatePath('/librarian/members')
    return { success: true, patron: finalPatron }
  } catch (error) {
    console.error('Error updating patron:', error)
    return { success: false, error: 'Failed to update patron' }
  }
}

// Get detailed patron information with borrowing history
export async function getPatronDetails(patronId: number) {
  try {
    console.log('🔍 getPatronDetails called with patronId:', patronId)
    
    // First try the simplest query possible
    const patron = await prisma.patron.findUnique({
      where: { patronId: parseInt(patronId.toString()) }
    })

    console.log('🔍 Basic patron found:', patron ? `${patron.patronFirstName} ${patron.patronLastName}` : 'null')

    if (!patron) {
      console.log('❌ Patron not found')
      return { success: false, error: 'Patron not found' }
    }

    // Now try to get additional data safely
    let studentProfile = null
    let facultyProfile = null
    let borrowedItems = []
    let reservations = []

    try {
      if (patron.isStudent) {
        studentProfile = await prisma.student.findUnique({
          where: { patronId: patron.patronId }
        })
      }
      
      if (patron.isFaculty) {
        facultyProfile = await prisma.faculty.findUnique({
          where: { patronId: patron.patronId }
        })
      }
      
      borrowedItems = await prisma.transaction.findMany({
        where: { patronId: patron.patronId },
        include: { item: true },
        orderBy: { borrowedAt: 'desc' }
      })
      
      reservations = await prisma.reservation.findMany({
        where: { patronId: patron.patronId },
        include: { item: true },
        orderBy: { reservedAt: 'desc' }
      })
    } catch (relatedError) {
      console.log('⚠️ Error loading related data, continuing with basic patron info:', relatedError)
    }

    // Simple result structure
    const result = {
      success: true,
      patron: {
        ...patron,
        studentProfile,
        facultyProfile,
        borrowedItems: borrowedItems.map(item => ({ ...item, calculatedFine: 0 })),
        reservations,
        overdueItems: 0,
        totalFines: 0
      }
    }

    console.log('✅ getPatronDetails successful with patron:', patron.patronFirstName, patron.patronLastName)
    return result
  } catch (error) {
    console.error('💥 Error fetching patron details:', error)
    return { success: false, error: 'Failed to fetch patron details: ' + error.message }
  }
}

// Generate library card ID (simple implementation)
export async function generateLibraryCard(patronId: number) {
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

    // Generate a card ID based on patron type and ID
    let cardPrefix = 'LIB'
    if (patron.isStudent) cardPrefix = 'STU'
    else if (patron.isFaculty) cardPrefix = 'FAC'
    
    const cardNumber = `${cardPrefix}${patron.patronId.toString().padStart(6, '0')}`
    
    // In a real system, you might want to store this card number in the database
    // For now, we'll just return it
    const libraryCard = {
      cardNumber,
      patronName: `${patron.patronFirstName} ${patron.patronLastName}`,
      patronType: patron.isStudent ? 'Student' : patron.isFaculty ? 'Faculty' : 'General',
      department: patron.studentProfile?.studentDepartment || patron.facultyProfile?.facultyDepartment || 'N/A',
      issueDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 year validity
      patronId: patron.patronId
    }

    return { success: true, libraryCard }
  } catch (error) {
    console.error('Error generating library card:', error)
    return { success: false, error: 'Failed to generate library card' }
  }
}

// Get patron statistics for dashboard
export async function getPatronStatistics() {
  try {
    const totalPatrons = await prisma.patron.count()
    const students = await prisma.patron.count({
      where: { isStudent: true }
    })
    const faculty = await prisma.patron.count({
      where: { isFaculty: true }
    })
    const general = totalPatrons - students - faculty

    const activePatrons = await prisma.patron.count({
      where: {
        borrowedItems: {
          some: { isReturned: false }
        }
      }
    })

    const patronsWithOverdueItems = await prisma.patron.count({
      where: {
        borrowedItems: {
          some: {
            isReturned: false,
            dueDate: { lt: new Date() }
          }
        }
      }
    })

    return {
      success: true,
      stats: {
        totalPatrons,
        students,
        faculty,
        general,
        activePatrons,
        patronsWithOverdueItems
      }
    }
  } catch (error) {
    console.error('Error fetching patron statistics:', error)
    return { success: false, error: 'Failed to fetch statistics' }
  }
}

// Delete patron with proper cleanup
export async function deletePatron(patronId: number) {
  try {
    // Check if patron exists
    const patron = await prisma.patron.findUnique({
      where: { patronId },
      include: {
        studentProfile: true,
        facultyProfile: true,
        borrowedItems: true,
        reservations: true
      }
    })

    if (!patron) {
      return { success: false, error: 'Patron not found' }
    }

    // Check if patron has active borrows
    const activeBorrows = patron.borrowedItems.filter(item => !item.isReturned)
    if (activeBorrows.length > 0) {
      return { success: false, error: 'Cannot delete patron with active borrowed items. Please return all books first.' }
    }

    // Use transaction to ensure all deletes succeed or fail together
    await prisma.$transaction(async (tx) => {
      // Delete reservations first (these are current, not historical)
      if (patron.reservations.length > 0) {
        await tx.reservation.deleteMany({
          where: { patronId }
        })
      }

      // Delete student profile if exists
      if (patron.studentProfile) {
        await tx.student.delete({
          where: { patronId }
        })
      }

      // Delete faculty profile if exists
      if (patron.facultyProfile) {
        await tx.faculty.delete({
          where: { patronId }
        })
      }

      // Note: We keep historical transactions for record-keeping
      // but set patronId to null to maintain referential integrity
      // However, since patronId is required in the schema, we'll delete the patron anyway
      // In a production system, you might want to archive this data

      // Finally delete the patron
      await tx.patron.delete({
        where: { patronId }
      })
    })

    revalidatePath('/librarian/members')
    return { success: true }
  } catch (error) {
    console.error('Error deleting patron:', error)
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return { success: false, error: 'Cannot delete patron due to existing records. Please contact system administrator.' }
      }
    }
    
    return { success: false, error: 'Failed to delete patron. Please try again or contact support.' }
  }
}
