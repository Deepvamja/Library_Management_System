'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { UserRole, UserData } from '@/types/userTypes'

const prisma = new PrismaClient()

// Get all users with their roles
export async function getAllUsers() {
  try {
    const [admins, librarians, patrons] = await Promise.all([
      prisma.admin.findMany({
        select: {
          adminId: true,
          adminEmail: true,
          adminFirstName: true,
          adminLastName: true
        }
      }),
      prisma.librarian.findMany({
        select: {
          librarianId: true,
          librarianEmail: true,
          librarianFirstName: true,
          librarianLastName: true
        }
      }),
      prisma.patron.findMany({
        include: {
          studentProfile: {
            select: {
              studentDepartment: true,
              studentSemester: true,
              studentRollNo: true,
              studentEnrollmentNumber: true
            }
          },
          facultyProfile: {
            select: {
              facultyDepartment: true
            }
          }
        }
      })
    ])

    const allUsers = [
      ...admins.map(admin => ({
        id: admin.adminId,
        email: admin.adminEmail,
        firstName: admin.adminFirstName,
        lastName: admin.adminLastName,
        role: UserRole.ADMIN,
        createdAt: null
      })),
      ...librarians.map(librarian => ({
        id: librarian.librarianId,
        email: librarian.librarianEmail,
        firstName: librarian.librarianFirstName,
        lastName: librarian.librarianLastName,
        role: UserRole.LIBRARIAN,
        createdAt: null
      })),
      ...patrons.map(patron => ({
        id: patron.patronId,
        email: patron.patronEmail,
        firstName: patron.patronFirstName,
        lastName: patron.patronLastName,
        role: UserRole.PATRON,
        isStudent: patron.isStudent,
        isFaculty: patron.isFaculty,
        department: patron.studentProfile?.studentDepartment || patron.facultyProfile?.facultyDepartment,
        semester: patron.studentProfile?.studentSemester,
        rollNo: patron.studentProfile?.studentRollNo,
        enrollmentNumber: patron.studentProfile?.studentEnrollmentNumber,
        createdAt: patron.patronCreatedAt
      }))
    ]

    return {
      success: true,
      data: allUsers
    }
  } catch (error) {
    console.error('Error fetching users:', error)
    return {
      success: false,
      error: 'Failed to fetch users'
    }
  }
}

// Create a new user
export async function createUser(userData: UserData) {
  try {
    let newUser

    switch (userData.role) {
      case UserRole.ADMIN:
        newUser = await prisma.admin.create({
          data: {
            adminEmail: userData.email,
            adminFirstName: userData.firstName,
            adminLastName: userData.lastName,
            adminPassword: 'defaultPassword123' // In production, this should be hashed
          }
        })
        break

      case UserRole.LIBRARIAN:
        newUser = await prisma.librarian.create({
          data: {
            librarianEmail: userData.email,
            librarianFirstName: userData.firstName,
            librarianLastName: userData.lastName,
            librarianPassword: 'defaultPassword123' // In production, this should be hashed
          }
        })
        break

      case UserRole.PATRON:
        const patronData = {
          patronEmail: userData.email,
          patronFirstName: userData.firstName,
          patronLastName: userData.lastName,
          patronPassword: 'defaultPassword123', // In production, this should be hashed
          isStudent: userData.isStudent || false,
          isFaculty: userData.isFaculty || false
        }

        newUser = await prisma.patron.create({
          data: patronData
        })

        // Create student or faculty profile if needed
        if (userData.isStudent && userData.department) {
          await prisma.student.create({
            data: {
              patronId: newUser.patronId,
              studentDepartment: userData.department,
              studentSemester: userData.semester,
              studentRollNo: userData.rollNo,
              studentEnrollmentNumber: userData.enrollmentNumber
            }
          })
        } else if (userData.isFaculty && userData.department) {
          await prisma.faculty.create({
            data: {
              patronId: newUser.patronId,
              facultyDepartment: userData.department
            }
          })
        }
        break

      default:
        throw new Error('Invalid user role')
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `${userData.role} created successfully`,
      data: newUser
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: `Failed to create ${userData.role}`
    }
  }
}

// Update user information
export async function updateUser(userId: number, userData: UserData) {
  try {
    let updatedUser

    switch (userData.role) {
      case UserRole.ADMIN:
        updatedUser = await prisma.admin.update({
          where: { adminId: userId },
          data: {
            adminEmail: userData.email,
            adminFirstName: userData.firstName,
            adminLastName: userData.lastName
          }
        })
        break

      case UserRole.LIBRARIAN:
        updatedUser = await prisma.librarian.update({
          where: { librarianId: userId },
          data: {
            librarianEmail: userData.email,
            librarianFirstName: userData.firstName,
            librarianLastName: userData.lastName
          }
        })
        break

      case UserRole.PATRON:
        updatedUser = await prisma.patron.update({
          where: { patronId: userId },
          data: {
            patronEmail: userData.email,
            patronFirstName: userData.firstName,
            patronLastName: userData.lastName,
            isStudent: userData.isStudent || false,
            isFaculty: userData.isFaculty || false
          }
        })

        // Update or create student profile
        if (userData.isStudent && userData.department) {
          await prisma.student.upsert({
            where: { patronId: userId },
            update: {
              studentDepartment: userData.department,
              studentSemester: userData.semester,
              studentRollNo: userData.rollNo,
              studentEnrollmentNumber: userData.enrollmentNumber
            },
            create: {
              patronId: userId,
              studentDepartment: userData.department,
              studentSemester: userData.semester,
              studentRollNo: userData.rollNo,
              studentEnrollmentNumber: userData.enrollmentNumber
            }
          })
        }

        // Update or create faculty profile
        if (userData.isFaculty && userData.department) {
          await prisma.faculty.upsert({
            where: { patronId: userId },
            update: {
              facultyDepartment: userData.department
            },
            create: {
              patronId: userId,
              facultyDepartment: userData.department
            }
          })
        }
        break

      default:
        throw new Error('Invalid user role')
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `${userData.role} updated successfully`,
      data: updatedUser
    }
  } catch (error) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: `Failed to update ${userData.role}`
    }
  }
}

// Delete a user
export async function deleteUser(userId: number, role: UserRole) {
  try {
    switch (role) {
      case UserRole.ADMIN:
        // Check if this is the last admin
        const adminCount = await prisma.admin.count()
        if (adminCount <= 1) {
          return {
            success: false,
            error: 'Cannot delete the last admin account'
          }
        }
        
        await prisma.admin.delete({
          where: { adminId: userId }
        })
        break

      case UserRole.LIBRARIAN:
        await prisma.librarian.delete({
          where: { librarianId: userId }
        })
        break

      case UserRole.PATRON:
        // Delete associated student/faculty profiles first
        await prisma.student.deleteMany({
          where: { patronId: userId }
        })
        await prisma.faculty.deleteMany({
          where: { patronId: userId }
        })
        
        // Delete reservations
        await prisma.reservation.deleteMany({
          where: { patronId: userId }
        })
        
        // Check for active transactions
        const activeTransactions = await prisma.transaction.count({
          where: {
            patronId: userId,
            isReturned: false
          }
        })
        
        if (activeTransactions > 0) {
          return {
            success: false,
            error: 'Cannot delete patron with active book loans'
          }
        }
        
        // Delete the patron (transactions will remain for history)
        await prisma.patron.delete({
          where: { patronId: userId }
        })
        break

      default:
        throw new Error('Invalid user role')
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `${role} deleted successfully`
    }
  } catch (error) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: `Failed to delete ${role}`
    }
  }
}

// Change user role (Admin only)
export async function changeUserRole(userId: number, fromRole: UserRole, toRole: UserRole, userData: UserData) {
  try {
    if (fromRole === toRole) {
      return {
        success: false,
        error: 'User already has this role'
      }
    }

    // First delete from old role table
    await deleteUser(userId, fromRole)
    
    // Then create in new role table
    const result = await createUser({
      ...userData,
      role: toRole
    })

    revalidatePath('/admin/users')
    return {
      success: result.success,
      message: result.success ? `User role changed from ${fromRole} to ${toRole}` : result.error
    }
  } catch (error) {
    console.error('Error changing user role:', error)
    return {
      success: false,
      error: 'Failed to change user role'
    }
  }
}

// Get user statistics
export async function getUserStatistics() {
  try {
    const [adminCount, librarianCount, patronCount, studentCount, facultyCount] = await Promise.all([
      prisma.admin.count(),
      prisma.librarian.count(),
      prisma.patron.count(),
      prisma.patron.count({ where: { isStudent: true } }),
      prisma.patron.count({ where: { isFaculty: true } })
    ])

    return {
      success: true,
      data: {
        admins: adminCount,
        librarians: librarianCount,
        patrons: patronCount,
        students: studentCount,
        faculty: facultyCount,
        totalUsers: adminCount + librarianCount + patronCount
      }
    }
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    return {
      success: false,
      error: 'Failed to fetch user statistics'
    }
  }
}

// Reset user password (Admin only)
export async function resetUserPassword(userId: number, role: UserRole) {
  try {
    const newPassword = 'tempPassword123' // In production, generate secure password
    
    switch (role) {
      case UserRole.ADMIN:
        await prisma.admin.update({
          where: { adminId: userId },
          data: { adminPassword: newPassword } // Should be hashed in production
        })
        break

      case UserRole.LIBRARIAN:
        await prisma.librarian.update({
          where: { librarianId: userId },
          data: { librarianPassword: newPassword } // Should be hashed in production
        })
        break

      case UserRole.PATRON:
        await prisma.patron.update({
          where: { patronId: userId },
          data: { patronPassword: newPassword } // Should be hashed in production
        })
        break

      default:
        throw new Error('Invalid user role')
    }

    return {
      success: true,
      message: 'Password reset successfully',
      data: { temporaryPassword: newPassword }
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    return {
      success: false,
      error: 'Failed to reset password'
    }
  }
}
