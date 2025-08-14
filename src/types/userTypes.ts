// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  LIBRARIAN = 'librarian',
  PATRON = 'patron'
}

export interface UserData {
  id?: number
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isStudent?: boolean
  isFaculty?: boolean
  department?: string
  semester?: number
  rollNo?: number
  enrollmentNumber?: number
  createdAt?: Date | null
}
