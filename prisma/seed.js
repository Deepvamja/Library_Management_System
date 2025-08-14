const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Sample Books
  const books = [
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "9780743273565",
      subject: "American Literature",
      keywords: "classic, american, 1920s, jazz age",
      itemType: "Book",
      price: 12.99,
      imageUrl: "https://picsum.photos/400/600?random=1",
      totalCopies: 5,
      availableCopies: 3,
    },
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",  
      isbn: "9780061120084",
      subject: "American Literature",
      keywords: "classic, racism, justice, coming of age",
      itemType: "Book",
      price: 14.99,
      imageUrl: "https://picsum.photos/400/600?random=2",
      totalCopies: 4,
      availableCopies: 2,
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "9780451524935",
      subject: "Dystopian Fiction",
      keywords: "dystopia, surveillance, totalitarian, political",
      itemType: "Book",
      price: 13.99,
      imageUrl: "https://picsum.photos/400/600?random=3",
      totalCopies: 6,
      availableCopies: 4,
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "9780141439518",
      subject: "British Literature",
      keywords: "romance, regency, social commentary, classic",
      itemType: "Book",
      price: 11.99,
      imageUrl: "https://picsum.photos/400/600?random=4",
      totalCopies: 3,
      availableCopies: 1,
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "9780316769174",
      subject: "American Literature", 
      keywords: "coming of age, teenage, rebellion, classic",
      itemType: "Book",
      price: 13.50,
      imageUrl: "https://picsum.photos/400/600?random=5",
      totalCopies: 4,
      availableCopies: 0,
    },
    {
      title: "Harry Potter and the Sorcerer's Stone",
      author: "J.K. Rowling",
      isbn: "9780439708180",
      subject: "Fantasy Fiction",
      keywords: "magic, wizard, fantasy, children, adventure",
      itemType: "Book",
      price: 8.99,
      imageUrl: "https://picsum.photos/400/600?random=6",
      totalCopies: 8,
      availableCopies: 5,
    },
    {
      title: "The Lord of the Rings: The Fellowship of the Ring",
      author: "J.R.R. Tolkien",
      isbn: "9780544003415",
      subject: "Fantasy Fiction",
      keywords: "fantasy, epic, adventure, middle earth",
      itemType: "Book",
      price: 16.99,
      imageUrl: "https://picsum.photos/400/600?random=7",
      totalCopies: 3,
      availableCopies: 2,
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "9780547928227",
      subject: "Fantasy Fiction",
      keywords: "fantasy, adventure, dragon, treasure",
      itemType: "Book",
      price: 14.99,
      imageUrl: "https://picsum.photos/400/600?random=8",
      totalCopies: 5,
      availableCopies: 3,
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "9780441172719",
      subject: "Science Fiction",
      keywords: "sci-fi, space, desert planet, politics",
      itemType: "Book",
      price: 15.99,
      imageUrl: "https://picsum.photos/400/600?random=9",
      totalCopies: 2,
      availableCopies: 1,
    },
    {
      title: "The Hitchhiker's Guide to the Galaxy",
      author: "Douglas Adams",
      isbn: "9780345391803",
      subject: "Science Fiction",
      keywords: "comedy, sci-fi, space travel, humor",
      itemType: "Book",
      price: 12.99,
      imageUrl: "https://picsum.photos/400/600?random=10",
      totalCopies: 4,
      availableCopies: 4,
    },
    {
      title: "Introduction to Algorithms",
      author: "Thomas H. Cormen",
      isbn: "9780262033848",
      subject: "Computer Science",
      keywords: "algorithms, programming, computer science, textbook",
      itemType: "Book",
      price: 89.99,
      imageUrl: "https://picsum.photos/400/600?random=11",
      totalCopies: 2,
      availableCopies: 1,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "9780132350884",
      subject: "Software Engineering",
      keywords: "programming, software, coding practices, development",
      itemType: "Book",
      price: 49.99,
      imageUrl: "https://picsum.photos/400/600?random=12",
      totalCopies: 3,
      availableCopies: 2,
    }
  ]

  // Sample Magazines
  const magazines = [
    {
      title: "National Geographic - January 2024",
      author: "National Geographic Society",
      isbn: null,
      subject: "Geography and Nature",
      keywords: "nature, wildlife, geography, photography",
      itemType: "Magazine",
      price: 5.99,
      imageUrl: "https://images.unsplash.com/photo-1554844717-b9e95d43d40f?w=400&h=600&fit=crop",
      totalCopies: 10,
      availableCopies: 7,
    },
    {
      title: "Scientific American - February 2024",
      author: "Scientific American",
      isbn: null,
      subject: "Science",
      keywords: "science, research, technology, innovation",
      itemType: "Magazine",
      price: 6.99,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      totalCopies: 8,
      availableCopies: 5,
    },
    {
      title: "Time Magazine - March 2024",
      author: "Time Inc.",
      isbn: null,
      subject: "Current Affairs",
      keywords: "news, politics, current events, world affairs",
      itemType: "Magazine",
      price: 4.99,
      imageUrl: "https://images.unsplash.com/photo-1594736797933-d0d7c3b3b5db?w=400&h=600&fit=crop",
      totalCopies: 12,
      availableCopies: 9,
    },
    {
      title: "IEEE Computer - April 2024",
      author: "IEEE Computer Society",
      isbn: null,
      subject: "Computer Science",
      keywords: "computer science, technology, IEEE, research",
      itemType: "Magazine",
      price: 12.99,
      imageUrl: "https://images.unsplash.com/photo-1518481612222-68bbe828ecd1?w=400&h=600&fit=crop",
      totalCopies: 5,
      availableCopies: 3,
    },
    {
      title: "Harvard Business Review - May 2024",
      author: "Harvard Business School",
      isbn: null,
      subject: "Business",
      keywords: "business, management, strategy, leadership",
      itemType: "Magazine",
      price: 8.99,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
      totalCopies: 6,
      availableCopies: 4,
    },
    {
      title: "The Economist - June 2024",
      author: "The Economist Group",
      isbn: null,
      subject: "Economics and Politics",
      keywords: "economics, politics, global affairs, analysis",
      itemType: "Magazine",
      price: 7.99,
      imageUrl: "https://images.unsplash.com/photo-1586953209751-087e2fb5970c?w=400&h=600&fit=crop",
      totalCopies: 8,
      availableCopies: 6,
    }
  ]

  // Sample Journals and Other Items
  const otherItems = [
    {
      title: "Journal of Computer Science Research Vol. 45",
      author: "Various Authors",
      isbn: "9781234567890",
      subject: "Computer Science",
      keywords: "research, computer science, academic, journal",
      itemType: "Journal",
      price: 25.00,
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: "Mathematics Reference Manual",
      author: "Dr. Sarah Johnson",
      isbn: "9780987654321",
      subject: "Mathematics",
      keywords: "mathematics, reference, manual, formulas",
      itemType: "Reference",
      price: 45.00,
      totalCopies: 3,
      availableCopies: 1,
    },
    {
      title: "English Grammar and Usage Guide",
      author: "Grammar Institute",
      isbn: "9781122334455",
      subject: "English Language",
      keywords: "grammar, english, language, writing",
      itemType: "Reference",
      price: 22.99,
      totalCopies: 4,
      availableCopies: 3,
    },
    {
      title: "World Atlas 2024 Edition",
      author: "Geographic Publishing",
      isbn: "9782233445566",
      subject: "Geography",
      keywords: "atlas, geography, maps, world, countries",
      itemType: "Atlas",
      price: 35.99,
      totalCopies: 2,
      availableCopies: 2,
    },
    {
      title: "Encyclopedia Britannica Volume 1: A-C",
      author: "Britannica Inc.",
      isbn: "9783344556677",
      subject: "General Knowledge",
      keywords: "encyclopedia, reference, knowledge, britannica",
      itemType: "Encyclopedia",
      price: 75.00,
      totalCopies: 1,
      availableCopies: 0,
    }
  ]

  // Sample Patrons (Students and Faculty only)
  const patrons = [
    // Students
    {
      patronEmail: "john.doe@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "John",
      patronLastName: "Doe",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "Computer Science",
          studentSemester: 3,
          studentRollNo: 101,
          studentEnrollmentNumber: 1001
        },
      }
    },
    {
      patronEmail: "emily.johnson@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Emily",
      patronLastName: "Johnson",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "English Literature",
          studentSemester: 5,
          studentRollNo: 102,
          studentEnrollmentNumber: 1002
        },
      }
    },
    {
      patronEmail: "michael.brown@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Michael",
      patronLastName: "Brown",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "Mathematics",
          studentSemester: 2,
          studentRollNo: 103,
          studentEnrollmentNumber: 1003
        },
      }
    },
    {
      patronEmail: "sarah.davis@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Sarah",
      patronLastName: "Davis",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "Physics",
          studentSemester: 4,
          studentRollNo: 104,
          studentEnrollmentNumber: 1004
        },
      }
    },
    {
      patronEmail: "alex.wilson@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Alex",
      patronLastName: "Wilson",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "Business Administration",
          studentSemester: 6,
          studentRollNo: 105,
          studentEnrollmentNumber: 1005
        },
      }
    },
    {
      patronEmail: "priya.patel@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Priya",
      patronLastName: "Patel",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "Chemistry",
          studentSemester: 1,
          studentRollNo: 106,
          studentEnrollmentNumber: 1006
        },
      }
    },
    {
      patronEmail: "david.garcia@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "David",
      patronLastName: "Garcia",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "History",
          studentSemester: 3,
          studentRollNo: 107,
          studentEnrollmentNumber: 1007
        },
      }
    },
    {
      patronEmail: "lisa.martinez@student.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Lisa",
      patronLastName: "Martinez",
      isStudent: true,
      studentProfile: {
        create: {
          studentDepartment: "Psychology",
          studentSemester: 7,
          studentRollNo: 108,
          studentEnrollmentNumber: 1008
        },
      }
    },
    // Faculty Members
    {
      patronEmail: "jane.smith@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Dr. Jane",
      patronLastName: "Smith",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "Mathematics"
        },
      }
    },
    {
      patronEmail: "robert.anderson@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Prof. Robert",
      patronLastName: "Anderson",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "Computer Science"
        },
      }
    },
    {
      patronEmail: "maria.rodriguez@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Dr. Maria",
      patronLastName: "Rodriguez",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "English Literature"
        },
      }
    },
    {
      patronEmail: "james.white@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Prof. James",
      patronLastName: "White",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "Physics"
        },
      }
    },
    {
      patronEmail: "susan.thompson@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Dr. Susan",
      patronLastName: "Thompson",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "Chemistry"
        },
      }
    },
    {
      patronEmail: "daniel.lee@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Prof. Daniel",
      patronLastName: "Lee",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "Business Administration"
        },
      }
    },
    {
      patronEmail: "karen.clark@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Dr. Karen",
      patronLastName: "Clark",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "History"
        },
      }
    },
    {
      patronEmail: "thomas.hall@faculty.college.edu",
      patronPassword: "hashedpassword123",
      patronFirstName: "Prof. Thomas",
      patronLastName: "Hall",
      isFaculty: true,
      facultyProfile: {
        create: {
          facultyDepartment: "Psychology"
        },
      }
    }
  ]

  // Combine all items
  const allItems = [...books, ...magazines, ...otherItems]

  console.log(`📚 Creating ${allItems.length} library items...`)

  // Clear existing data first (optional)
  try {
    await prisma.item.deleteMany({})
    console.log('🗑️ Cleared existing items')
  } catch (error) {
    console.log('ℹ️ No existing items to clear')
  }

  try {
    await prisma.student.deleteMany({})
    await prisma.faculty.deleteMany({})
    await prisma.patron.deleteMany({})
    console.log('🗑️ Cleared existing patrons')
  } catch (error) {
    console.log('ℹ️ No existing patrons to clear')
  }

  // Create items one by one
  for (const item of allItems) {
    try {
      await prisma.item.create({
        data: item
      })
      console.log(`✅ Created: ${item.title}`)
    } catch (error) {
      console.log(`❌ Failed to create: ${item.title}`, error.message)
    }
  }

  // Create patrons
  console.log(`\n👥 Creating ${patrons.length} patrons...`)
  for (const patron of patrons) {
    try {
      await prisma.patron.create({
        data: patron
      })
      console.log(`✅ Created patron: ${patron.patronFirstName} ${patron.patronLastName}`)
    } catch (error) {
      console.log(`❌ Failed to create patron: ${patron.patronFirstName} ${patron.patronLastName}`, error.message)
    }
  }

  console.log('🎉 Seed data created successfully!')
  
  // Display summary
  try {
    const itemCounts = await prisma.item.groupBy({
      by: ['itemType'],
      _count: {
        itemId: true
      }
    })

    console.log('\n📊 Summary:')
    itemCounts.forEach(count => {
      console.log(`${count.itemType}: ${count._count.itemId} items`)
    })

    const totalItems = await prisma.item.count()
    console.log(`\nTotal items in database: ${totalItems}`)
    
    // Patron summary
    const totalPatrons = await prisma.patron.count()
    const studentCount = await prisma.patron.count({ where: { isStudent: true } })
    const facultyCount = await prisma.patron.count({ where: { isFaculty: true } })
    
    console.log('\n👥 Patron Summary:')
    console.log(`Students: ${studentCount} patrons`)
    console.log(`Faculty: ${facultyCount} patrons`)
    console.log(`Total patrons in database: ${totalPatrons}`)
  } catch (error) {
    console.log('Error getting summary:', error.message)
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
