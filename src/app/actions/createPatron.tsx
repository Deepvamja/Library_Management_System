'use server'

import { PrismaClient } from "../../generated/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export default async function createPatron(formdata: FormData) {
    const prisma = new PrismaClient();
    
    try {
        // Extract form data matching the schema field names
        const patronType = formdata.get('patronType') as string;
        const patronFirstName = formdata.get('patronFirstName') as string;
        const patronLastName = formdata.get('patronLastName') as string;
        const patronEmail = formdata.get('patronEmail') as string;
        const patronPassword = formdata.get('patronPassword') as string;
        
        // Create the patron with conditional profile creation
        if (patronType === 'student') {
            const studentEnrollmentNumber = formdata.get('studentEnrollmentNumber') as string;
            const studentDepartment = formdata.get('studentDepartment') as string;
            const studentSemester = formdata.get('studentSemester') as string;
            const studentRollNo = formdata.get('studentRollNo') as string;
            
            await prisma.patron.create({
                data: {
                    patronEmail,
                    patronPassword,
                    patronFirstName,
                    patronLastName,
                    isStudent: true,
                    isFaculty: false,
                    studentProfile: {
                        create: {
                            studentDepartment,
                            studentEnrollmentNumber: studentEnrollmentNumber ? parseInt(studentEnrollmentNumber) : null,
                            studentSemester: studentSemester ? parseInt(studentSemester) : null,
                            studentRollNo: studentRollNo ? parseInt(studentRollNo) : null,
                        }
                    }
                }
            });
        } else if (patronType === 'faculty') {
            const facultyDepartment = formdata.get('facultyDepartment') as string;
            
            await prisma.patron.create({
                data: {
                    patronEmail,
                    patronPassword,
                    patronFirstName,
                    patronLastName,
                    isStudent: false,
                    isFaculty: true,
                    facultyProfile: {
                        create: {
                            facultyDepartment,
                        }
                    }
                }
            });
        }
        
        console.log('Patron created successfully');
        
        // Revalidate the signup page
        revalidatePath('/signup');
        
        // Return success (no redirect since client handles it)
        return { success: true };
        
    } catch (error) {
        console.error('Error creating patron:', error);
        throw new Error('Failed to create patron account');
    } finally {
        await prisma.$disconnect();
    }
}
