'use server'

import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()
const execAsync = promisify(exec)

// Define backup directory
const getBackupDir = () => {
  const backupDir = path.join(process.cwd(), 'backups')
  return backupDir
}

// Ensure backup directory exists
async function ensureBackupDir() {
  const backupDir = getBackupDir()
  try {
    await fs.access(backupDir)
  } catch {
    await fs.mkdir(backupDir, { recursive: true })
  }
  return backupDir
}

// Generate backup filename
function generateBackupFilename() {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `library_backup_${timestamp}.sql`
}

// Create database backup
export async function createDatabaseBackup() {
  try {
    const backupDir = await ensureBackupDir()
    const filename = generateBackupFilename()
    const filepath = path.join(backupDir, filename)
    
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return {
        success: false,
        error: 'Database URL not found in environment variables'
      }
    }
    
    // Parse database URL to get connection details
    const urlParts = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/)
    if (!urlParts) {
      return {
        success: false,
        error: 'Invalid database URL format'
      }
    }
    
    const [, username, password, host, port, database] = urlParts
    
    // Create mysqldump command
    const mysqldumpCmd = `mysqldump -h ${host} -P ${port} -u ${username} ${password ? `-p${password}` : ''} --routines --triggers --single-transaction ${database}`
    
    try {
      const { stdout } = await execAsync(mysqldumpCmd)
      await fs.writeFile(filepath, stdout)
      
      // Get file stats
      const stats = await fs.stat(filepath)
      const fileSizeKB = Math.round(stats.size / 1024)
      
      return {
        success: true,
        message: 'Database backup created successfully',
        data: {
          filename,
          filepath,
          size: fileSizeKB,
          createdAt: new Date().toISOString()
        }
      }
    } catch (execError) {
      return {
        success: false,
        error: `Backup failed: ${execError.message}`
      }
    }
  } catch (error) {
    console.error('Error creating backup:', error)
    return {
      success: false,
      error: 'Failed to create database backup'
    }
  }
}

// Get list of available backups
export async function getBackupList() {
  try {
    const backupDir = await ensureBackupDir()
    const files = await fs.readdir(backupDir)
    
    const backupFiles = files.filter(file => file.endsWith('.sql'))
    
    const backupsWithDetails = await Promise.all(
      backupFiles.map(async (file) => {
        const filepath = path.join(backupDir, file)
        const stats = await fs.stat(filepath)
        
        return {
          filename: file,
          filepath,
          size: Math.round(stats.size / 1024), // Size in KB
          createdAt: stats.birthtime.toISOString(),
          modifiedAt: stats.mtime.toISOString()
        }
      })
    )
    
    // Sort by creation date (newest first)
    backupsWithDetails.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return {
      success: true,
      data: backupsWithDetails
    }
  } catch (error) {
    console.error('Error getting backup list:', error)
    return {
      success: false,
      error: 'Failed to get backup list'
    }
  }
}

// Delete a backup file
export async function deleteBackup(filename: string) {
  try {
    const backupDir = getBackupDir()
    const filepath = path.join(backupDir, filename)
    
    // Security check: ensure the file is in the backup directory and has .sql extension
    if (!filename.endsWith('.sql') || filename.includes('..')) {
      return {
        success: false,
        error: 'Invalid filename'
      }
    }
    
    await fs.unlink(filepath)
    
    return {
      success: true,
      message: 'Backup deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting backup:', error)
    return {
      success: false,
      error: 'Failed to delete backup file'
    }
  }
}

// Restore database from backup
export async function restoreDatabase(filename: string) {
  try {
    const backupDir = getBackupDir()
    const filepath = path.join(backupDir, filename)
    
    // Security check
    if (!filename.endsWith('.sql') || filename.includes('..')) {
      return {
        success: false,
        error: 'Invalid filename'
      }
    }
    
    // Check if backup file exists
    try {
      await fs.access(filepath)
    } catch {
      return {
        success: false,
        error: 'Backup file not found'
      }
    }
    
    // Get database URL from environment
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      return {
        success: false,
        error: 'Database URL not found in environment variables'
      }
    }
    
    // Parse database URL
    const urlParts = dbUrl.match(/mysql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/(.+)/)
    if (!urlParts) {
      return {
        success: false,
        error: 'Invalid database URL format'
      }
    }
    
    const [, username, password, host, port, database] = urlParts
    
    // Create mysql restore command
    const mysqlCmd = `mysql -h ${host} -P ${port} -u ${username} ${password ? `-p${password}` : ''} ${database} < "${filepath}"`
    
    try {
      await execAsync(mysqlCmd)
      
      return {
        success: true,
        message: 'Database restored successfully from backup'
      }
    } catch (execError) {
      return {
        success: false,
        error: `Restore failed: ${execError.message}`
      }
    }
  } catch (error) {
    console.error('Error restoring database:', error)
    return {
      success: false,
      error: 'Failed to restore database'
    }
  }
}

// Create automatic backup (can be scheduled)
export async function createAutomaticBackup() {
  try {
    const result = await createDatabaseBackup()
    
    if (result.success) {
      // Log the automatic backup
      console.log(`Automatic backup created: ${result.data?.filename}`)
    }
    
    return result
  } catch (error) {
    console.error('Error creating automatic backup:', error)
    return {
      success: false,
      error: 'Automatic backup failed'
    }
  }
}

// Test database connection
export async function testDatabaseConnection() {
  try {
    await prisma.$connect()
    // Try a simple query to verify connection works
    await prisma.$queryRaw`SELECT 1 as test`
    await prisma.$disconnect()
    
    return {
      success: true,
      message: 'Database connection successful'
    }
  } catch (error) {
    console.error('Database connection failed:', error)
    
    let errorMessage = 'Database connection failed'
    
    if (error.message.includes('ECONNREFUSED')) {
      errorMessage = 'MySQL server is not running. Please start your MySQL server.'
    } else if (error.message.includes('Access denied')) {
      errorMessage = 'Database authentication failed. Check your MySQL credentials.'
    } else if (error.message.includes('Unknown database')) {
      errorMessage = 'Database "lib" does not exist. Please create the database first.'
    }
    
    return {
      success: false,
      error: errorMessage,
      details: error.message
    }
  }
}

// Get database statistics for backup info
export async function getDatabaseStats() {
  try {
    // First test connection
    const connectionTest = await testDatabaseConnection()
    if (!connectionTest.success) {
      return connectionTest
    }
    
    const [
      patronCount,
      itemCount,
      transactionCount,
      reservationCount,
      adminCount,
      librarianCount
    ] = await Promise.all([
      prisma.patron.count(),
      prisma.item.count(),
      prisma.transaction.count(),
      prisma.reservation.count(),
      prisma.admin.count(),
      prisma.librarian.count()
    ])
    
    return {
      success: true,
      data: {
        patrons: patronCount,
        items: itemCount,
        transactions: transactionCount,
        reservations: reservationCount,
        admins: adminCount,
        librarians: librarianCount,
        totalRecords: patronCount + itemCount + transactionCount + reservationCount + adminCount + librarianCount
      }
    }
  } catch (error) {
    console.error('Error getting database stats:', error)
    return {
      success: false,
      error: 'Failed to get database statistics',
      details: error.message
    }
  }
}

// Validate backup file integrity
export async function validateBackup(filename: string) {
  try {
    const backupDir = getBackupDir()
    const filepath = path.join(backupDir, filename)
    
    // Security check
    if (!filename.endsWith('.sql') || filename.includes('..')) {
      return {
        success: false,
        error: 'Invalid filename'
      }
    }
    
    // Read first few lines to check if it's a valid SQL dump
    const content = await fs.readFile(filepath, 'utf8')
    const lines = content.split('\n').slice(0, 10)
    
    const hasValidHeader = lines.some(line => 
      line.includes('mysqldump') || 
      line.includes('MySQL dump') ||
      line.includes('-- Host:')
    )
    
    const hasValidSQL = content.includes('CREATE TABLE') || content.includes('INSERT INTO')
    
    return {
      success: true,
      data: {
        isValid: hasValidHeader && hasValidSQL,
        hasHeader: hasValidHeader,
        hasSQL: hasValidSQL,
        size: content.length
      }
    }
  } catch (error) {
    console.error('Error validating backup:', error)
    return {
      success: false,
      error: 'Failed to validate backup file'
    }
  }
}
