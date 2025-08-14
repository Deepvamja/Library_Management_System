'use server'

import { PrismaClient } from "../../generated/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function studentSignUp(formdata : FormData){
    const prisma = new PrismaClient();
    
    const firstName = formdata.get('firstName') as string;
    const lastName = formdata.get('lastName') as string;
    const email = formdata.get('email') as string;
    const password = formdata.get('password') as string;
    
    const newPatron = await prisma.patron.create({
        data:{
            patronFirstName: firstName,
            patronLastName: lastName,
            patronEmail: email,
            patronPassword: password,
            isStudent: true,
            isFaculty: false,
        }
    });
    
    await prisma.$disconnect();
    return newPatron;
}

export { studentSignUp };
