const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = [
    { 
      title: 'Introduction to Algorithms', 
      author: 'Thomas H. Cormen', 
      isbn: '9780262033848', 
      subject: 'Computer Science', 
      keywords: 'algorithms, data structures', 
      itemType: 'Book',
      price: 99.99,
      imageUrl: 'https://example.com/image1.jpg',
      totalCopies: 5,
      availableCopies: 5
    },
    { 
      title: 'The Pragmatic Programmer', 
      author: 'Andrew Hunt', 
      isbn: '9780201616224', 
      subject: 'Software Development', 
      keywords: 'programming, best practices', 
      itemType: 'Book',
      price: 42.00,
      imageUrl: 'https://example.com/image2.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      subject: 'Software Development',
      keywords: 'clean code, programming',
      itemType: 'Book',
      price: 45.99,
      imageUrl: 'https://example.com/image3.jpg',
      totalCopies: 4,
      availableCopies: 4
    },
    {
      title: 'Design Patterns',
      author: 'Gang of Four',
      isbn: '9780201633610',
      subject: 'Software Architecture',
      keywords: 'design patterns, object-oriented',
      itemType: 'Book',
      price: 59.99,
      imageUrl: 'https://example.com/image4.jpg',
      totalCopies: 2,
      availableCopies: 2
    },
    {
      title: 'JavaScript: The Good Parts',
      author: 'Douglas Crockford',
      isbn: '9780596517748',
      subject: 'Web Development',
      keywords: 'javascript, web programming',
      itemType: 'Book',
      price: 29.99,
      imageUrl: 'https://example.com/image5.jpg',
      totalCopies: 6,
      availableCopies: 6
    },
    {
      title: 'You Don\'t Know JS',
      author: 'Kyle Simpson',
      isbn: '9781491924464',
      subject: 'Web Development',
      keywords: 'javascript, advanced programming',
      itemType: 'Book',
      price: 39.99,
      imageUrl: 'https://example.com/image6.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Python Crash Course',
      author: 'Eric Matthes',
      isbn: '9781593279288',
      subject: 'Programming',
      keywords: 'python, programming basics',
      itemType: 'Book',
      price: 34.99,
      imageUrl: 'https://example.com/image7.jpg',
      totalCopies: 7,
      availableCopies: 7
    },
    {
      title: 'Learning React',
      author: 'Alex Banks',
      isbn: '9781491954621',
      subject: 'Web Development',
      keywords: 'react, frontend development',
      itemType: 'Book',
      price: 47.99,
      imageUrl: 'https://example.com/image8.jpg',
      totalCopies: 4,
      availableCopies: 4
    },
    {
      title: 'Node.js Design Patterns',
      author: 'Mario Casciaro',
      isbn: '9781783287314',
      subject: 'Backend Development',
      keywords: 'nodejs, backend, patterns',
      itemType: 'Book',
      price: 52.99,
      imageUrl: 'https://example.com/image9.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Database System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '9780078022159',
      subject: 'Database Systems',
      keywords: 'database, sql, systems',
      itemType: 'Book',
      price: 89.99,
      imageUrl: 'https://example.com/image10.jpg',
      totalCopies: 5,
      availableCopies: 5
    },
    {
      title: 'Operating System Concepts',
      author: 'Abraham Silberschatz',
      isbn: '9781118063330',
      subject: 'Operating Systems',
      keywords: 'operating systems, computer science',
      itemType: 'Book',
      price: 79.99,
      imageUrl: 'https://example.com/image11.jpg',
      totalCopies: 4,
      availableCopies: 4
    },
    {
      title: 'Computer Networks',
      author: 'Andrew S. Tanenbaum',
      isbn: '9780132126953',
      subject: 'Computer Networks',
      keywords: 'networking, protocols, internet',
      itemType: 'Book',
      price: 94.99,
      imageUrl: 'https://example.com/image12.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell',
      isbn: '9780136042594',
      subject: 'Artificial Intelligence',
      keywords: 'AI, machine learning, algorithms',
      itemType: 'Book',
      price: 119.99,
      imageUrl: 'https://example.com/image13.jpg',
      totalCopies: 2,
      availableCopies: 2
    },
    {
      title: 'Machine Learning Yearning',
      author: 'Andrew Ng',
      isbn: '9780999579909',
      subject: 'Machine Learning',
      keywords: 'machine learning, AI, deep learning',
      itemType: 'Book',
      price: 0.00,
      imageUrl: 'https://example.com/image14.jpg',
      totalCopies: 10,
      availableCopies: 10
    },
    {
      title: 'The C Programming Language',
      author: 'Brian W. Kernighan',
      isbn: '9780131103627',
      subject: 'Programming',
      keywords: 'C programming, systems programming',
      itemType: 'Book',
      price: 44.99,
      imageUrl: 'https://example.com/image15.jpg',
      totalCopies: 6,
      availableCopies: 6
    },
    {
      title: 'Java: The Complete Reference',
      author: 'Herbert Schildt',
      isbn: '9781260440232',
      subject: 'Programming',
      keywords: 'java, object-oriented programming',
      itemType: 'Book',
      price: 54.99,
      imageUrl: 'https://example.com/image16.jpg',
      totalCopies: 5,
      availableCopies: 5
    },
    {
      title: 'Head First Design Patterns',
      author: 'Eric Freeman',
      isbn: '9780596007126',
      subject: 'Software Architecture',
      keywords: 'design patterns, software design',
      itemType: 'Book',
      price: 49.99,
      imageUrl: 'https://example.com/image17.jpg',
      totalCopies: 4,
      availableCopies: 4
    },
    {
      title: 'Cracking the Coding Interview',
      author: 'Gayle Laakmann McDowell',
      isbn: '9780984782857',
      subject: 'Career Development',
      keywords: 'interviews, coding problems, algorithms',
      itemType: 'Book',
      price: 39.95,
      imageUrl: 'https://example.com/image18.jpg',
      totalCopies: 8,
      availableCopies: 8
    },
    {
      title: 'System Design Interview',
      author: 'Alex Xu',
      isbn: '9798664653403',
      subject: 'System Design',
      keywords: 'system design, scalability, architecture',
      itemType: 'Book',
      price: 35.99,
      imageUrl: 'https://example.com/image19.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Effective Java',
      author: 'Joshua Bloch',
      isbn: '9780134685991',
      subject: 'Programming',
      keywords: 'java, best practices, programming',
      itemType: 'Book',
      price: 47.99,
      imageUrl: 'https://example.com/image20.jpg',
      totalCopies: 4,
      availableCopies: 4
    },
    {
      title: 'Spring in Action',
      author: 'Craig Walls',
      isbn: '9781617294945',
      subject: 'Web Development',
      keywords: 'spring framework, java, web development',
      itemType: 'Book',
      price: 44.99,
      imageUrl: 'https://example.com/image21.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Docker Deep Dive',
      author: 'Nigel Poulton',
      isbn: '9781521822807',
      subject: 'DevOps',
      keywords: 'docker, containers, devops',
      itemType: 'Book',
      price: 39.99,
      imageUrl: 'https://example.com/image22.jpg',
      totalCopies: 5,
      availableCopies: 5
    },
    {
      title: 'Kubernetes in Action',
      author: 'Marko Lukša',
      isbn: '9781617293726',
      subject: 'DevOps',
      keywords: 'kubernetes, orchestration, containers',
      itemType: 'Book',
      price: 54.99,
      imageUrl: 'https://example.com/image23.jpg',
      totalCopies: 2,
      availableCopies: 2
    },
    {
      title: 'AWS Certified Solutions Architect Study Guide',
      author: 'Ben Piper',
      isbn: '9781119713081',
      subject: 'Cloud Computing',
      keywords: 'aws, cloud, certification',
      itemType: 'Book',
      price: 49.99,
      imageUrl: 'https://example.com/image24.jpg',
      totalCopies: 3,
      availableCopies: 3
    },
    {
      title: 'Programming Collective Intelligence',
      author: 'Toby Segaran',
      isbn: '9780596529321',
      subject: 'Data Science',
      keywords: 'data mining, machine learning, algorithms',
      itemType: 'Book',
      price: 42.99,
      imageUrl: 'https://example.com/image25.jpg',
      totalCopies: 2,
      availableCopies: 2
    }
  ];

  for (let item of items) {
    await prisma.item.create({
      data: item,
    });
  }

  console.log('Items added successfully!');
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

