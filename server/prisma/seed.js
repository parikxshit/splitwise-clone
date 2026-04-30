const { PrismaClient } = require('@prisma/client')
const { faker } = require('@faker-js/faker')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
//   console.log('Seeding users...')

//   const users = []

//   for (let i = 0; i < 500; i++) {
//     users.push({
//       name: faker.person.fullName(),
//       email: faker.internet.email(),
//       password: await bcrypt.hash('password123', 10),
//     })
//   }

//   await prisma.user.createMany({
//     data: users,
//     skipDuplicates: true,
//   })

//   console.log('✅ 500 users seeded successfully')

  console.log('Seeding groups...')
  
  // Fetch all user IDs to randomly assign to groups
  const dbUsers = await prisma.user.findMany({ select: { id: true } })
  
  if (dbUsers.length > 0) {
    const groupsCount = 50;
    
    for (let i = 0; i < groupsCount; i++) {
      const creator = faker.helpers.arrayElement(dbUsers);
      
      // Select between 2 and 5 random members for the group
      const shuffledUsers = faker.helpers.shuffle(dbUsers);
      const numMembers = faker.number.int({ min: 2, max: 5 });
      const selectedMembers = shuffledUsers.slice(0, numMembers);
      
      // Ensure the creator is one of the members
      if (!selectedMembers.some(u => u.id === creator.id)) {
        selectedMembers[0] = creator;
      }

      await prisma.group.create({
        data: {
          name: `${faker.word.words({ count: { min: 1, max: 3 } })} Trip`,
          description: faker.lorem.sentence(),
          createdBy: creator.id,
          members: {
            create: selectedMembers.map(user => ({ userId: user.id }))
          }
        }
      });
    }
    console.log(`✅ ${groupsCount} groups seeded successfully`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })