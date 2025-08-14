import { PrismaClient } from '@prisma/client'

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

  // Combine all items
  const allItems = [...books, ...magazines, ...otherItems]

  console.log(`📚 Creating ${allItems.length} library items...`)

  // Create items in batches to avoid potential memory issues
  for (const item of allItems) {
    await prisma.item.create({
      data: item
    })
    console.log(`✅ Created: ${item.title}`)
  }

  console.log('🎉 Seed data created successfully!')
  
  // Display summary
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
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
