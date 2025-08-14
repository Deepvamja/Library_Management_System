'use server'

import { PrismaClient } from "../../generated/prisma";
import { redirect } from "next/navigation";
import { createSession } from "../../lib/session";

const prisma = new PrismaClient();

export interface FormState {
  error: string;
}

export async function loginCheck(previousState: FormState,formdata : FormData) {
    const email = formdata.get('email') as string;
    const password = formdata.get('password') as string;
    
    if(!email || !password){
        return{error:'Please enter both email and password.'};
    }

    // Check for patron login
    const patron = await prisma.patron.findUnique({
        where: {
            patronEmail: email
        },
        include: {
            studentProfile: true,
            facultyProfile: true
        }
    });
    
    if (patron && patron.patronPassword === password) {
        // Create session for patron
        await createSession({
            userId: patron.patronId,
            email: patron.patronEmail,
            firstName: patron.patronFirstName,
            lastName: patron.patronLastName,
            role: 'patron',
            userType: patron.isStudent ? 'student' : 'faculty'
        });
        redirect('/patron');
    }

    // Check for librarian login
    const librarian = await prisma.librarian.findUnique({
        where: {
            librarianEmail: email,
        }
    });
    
    if (librarian && librarian.librarianPassword === password) {
        // Create session for librarian
        await createSession({
            userId: librarian.librarianId,
            email: librarian.librarianEmail,
            firstName: librarian.librarianFirstName,
            lastName: librarian.librarianLastName,
            role: 'librarian'
        });
        redirect('/librarian');
    }

    // Check for admin login
    const admin = await prisma.admin.findUnique({
        where: {
            adminEmail: email,
        }
    });
    
    if (admin && admin.adminPassword === password) {
        // Create session for admin
        await createSession({
            userId: admin.adminId,
            email: admin.adminEmail,
            firstName: admin.adminFirstName,
            lastName: admin.adminLastName,
            role: 'admin'
        });
        redirect('/admin');
    }
    return {error: 'Invalid credentials. Please try again.'};
}