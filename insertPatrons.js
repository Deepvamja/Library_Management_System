const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const patrons = [
    // Students
    {
      patronEmail: 'john.doe@example.com',
      patronPassword: 'password1',
      patronFirstName: 'John',
      patronLastName: 'Doe',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Computer Science',
          studentSemester: 3,
          studentRollNo: 1001,
          studentEnrollmentNumber: 12345
        }
      }
    },
    {
      patronEmail: 'alice.johnson@example.com',
      patronPassword: 'password2',
      patronFirstName: 'Alice',
      patronLastName: 'Johnson',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Information Technology',
          studentSemester: 5,
          studentRollNo: 1002,
          studentEnrollmentNumber: 12346
        }
      }
    },
    {
      patronEmail: 'bob.wilson@example.com',
      patronPassword: 'password3',
      patronFirstName: 'Bob',
      patronLastName: 'Wilson',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Electrical Engineering',
          studentSemester: 2,
          studentRollNo: 1003,
          studentEnrollmentNumber: 12347
        }
      }
    },
    {
      patronEmail: 'charlie.brown@example.com',
      patronPassword: 'password4',
      patronFirstName: 'Charlie',
      patronLastName: 'Brown',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Mechanical Engineering',
          studentSemester: 4,
          studentRollNo: 1004,
          studentEnrollmentNumber: 12348
        }
      }
    },
    {
      patronEmail: 'diana.clark@example.com',
      patronPassword: 'password5',
      patronFirstName: 'Diana',
      patronLastName: 'Clark',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Computer Science',
          studentSemester: 6,
          studentRollNo: 1005,
          studentEnrollmentNumber: 12349
        }
      }
    },
    {
      patronEmail: 'edward.davis@example.com',
      patronPassword: 'password6',
      patronFirstName: 'Edward',
      patronLastName: 'Davis',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Mathematics',
          studentSemester: 1,
          studentRollNo: 1006,
          studentEnrollmentNumber: 12350
        }
      }
    },
    {
      patronEmail: 'fiona.garcia@example.com',
      patronPassword: 'password7',
      patronFirstName: 'Fiona',
      patronLastName: 'Garcia',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Physics',
          studentSemester: 3,
          studentRollNo: 1007,
          studentEnrollmentNumber: 12351
        }
      }
    },
    {
      patronEmail: 'george.miller@example.com',
      patronPassword: 'password8',
      patronFirstName: 'George',
      patronLastName: 'Miller',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Chemistry',
          studentSemester: 5,
          studentRollNo: 1008,
          studentEnrollmentNumber: 12352
        }
      }
    },
    {
      patronEmail: 'hannah.martinez@example.com',
      patronPassword: 'password9',
      patronFirstName: 'Hannah',
      patronLastName: 'Martinez',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Biology',
          studentSemester: 2,
          studentRollNo: 1009,
          studentEnrollmentNumber: 12353
        }
      }
    },
    {
      patronEmail: 'ivan.rodriguez@example.com',
      patronPassword: 'password10',
      patronFirstName: 'Ivan',
      patronLastName: 'Rodriguez',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Civil Engineering',
          studentSemester: 4,
          studentRollNo: 1010,
          studentEnrollmentNumber: 12354
        }
      }
    },
    {
      patronEmail: 'julia.anderson@example.com',
      patronPassword: 'password11',
      patronFirstName: 'Julia',
      patronLastName: 'Anderson',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Information Technology',
          studentSemester: 6,
          studentRollNo: 1011,
          studentEnrollmentNumber: 12355
        }
      }
    },
    {
      patronEmail: 'kevin.thomas@example.com',
      patronPassword: 'password12',
      patronFirstName: 'Kevin',
      patronLastName: 'Thomas',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Computer Science',
          studentSemester: 1,
          studentRollNo: 1012,
          studentEnrollmentNumber: 12356
        }
      }
    },
    {
      patronEmail: 'laura.jackson@example.com',
      patronPassword: 'password13',
      patronFirstName: 'Laura',
      patronLastName: 'Jackson',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Psychology',
          studentSemester: 3,
          studentRollNo: 1013,
          studentEnrollmentNumber: 12357
        }
      }
    },
    {
      patronEmail: 'mike.white@example.com',
      patronPassword: 'password14',
      patronFirstName: 'Mike',
      patronLastName: 'White',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Business Administration',
          studentSemester: 5,
          studentRollNo: 1014,
          studentEnrollmentNumber: 12358
        }
      }
    },
    {
      patronEmail: 'nina.lee@example.com',
      patronPassword: 'password15',
      patronFirstName: 'Nina',
      patronLastName: 'Lee',
      isStudent: true,
      isFaculty: false,
      studentProfile: {
        create: {
          studentDepartment: 'Art and Design',
          studentSemester: 2,
          studentRollNo: 1015,
          studentEnrollmentNumber: 12359
        }
      }
    },
    
    // Faculty
    {
      patronEmail: 'dr.jane.smith@example.com',
      patronPassword: 'faculty1',
      patronFirstName: 'Jane',
      patronLastName: 'Smith',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Computer Science'
        }
      }
    },
    {
      patronEmail: 'prof.robert.taylor@example.com',
      patronPassword: 'faculty2',
      patronFirstName: 'Robert',
      patronLastName: 'Taylor',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Mathematics'
        }
      }
    },
    {
      patronEmail: 'dr.sarah.moore@example.com',
      patronPassword: 'faculty3',
      patronFirstName: 'Sarah',
      patronLastName: 'Moore',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Physics'
        }
      }
    },
    {
      patronEmail: 'prof.michael.harris@example.com',
      patronPassword: 'faculty4',
      patronFirstName: 'Michael',
      patronLastName: 'Harris',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Electrical Engineering'
        }
      }
    },
    {
      patronEmail: 'dr.lisa.martin@example.com',
      patronPassword: 'faculty5',
      patronFirstName: 'Lisa',
      patronLastName: 'Martin',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Chemistry'
        }
      }
    },
    {
      patronEmail: 'prof.david.thompson@example.com',
      patronPassword: 'faculty6',
      patronFirstName: 'David',
      patronLastName: 'Thompson',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Biology'
        }
      }
    },
    {
      patronEmail: 'dr.jennifer.walker@example.com',
      patronPassword: 'faculty7',
      patronFirstName: 'Jennifer',
      patronLastName: 'Walker',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Literature'
        }
      }
    },
    {
      patronEmail: 'prof.james.hall@example.com',
      patronPassword: 'faculty8',
      patronFirstName: 'James',
      patronLastName: 'Hall',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Mechanical Engineering'
        }
      }
    },
    {
      patronEmail: 'dr.amy.allen@example.com',
      patronPassword: 'faculty9',
      patronFirstName: 'Amy',
      patronLastName: 'Allen',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Psychology'
        }
      }
    },
    {
      patronEmail: 'prof.william.young@example.com',
      patronPassword: 'faculty10',
      patronFirstName: 'William',
      patronLastName: 'Young',
      isStudent: false,
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: 'Business Administration'
        }
      }
    }
  ];

  for (let patron of patrons) {
    await prisma.patron.create({
      data: patron,
    });
  }

  console.log('Patrons added successfully!');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
