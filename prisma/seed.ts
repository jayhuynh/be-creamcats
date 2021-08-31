import faker from "faker";
import { EventStatus, Position, Prisma, User } from "@prisma/client";
import { PrismaClient } from ".prisma/client";

const prisma = new PrismaClient();

function genUser(): Prisma.UserCreateInput {
  return {
    email: faker.internet.email(),
    fullname: faker.name.findName(),
    password: faker.internet.password(),
  };
}

function genOrg(): Prisma.OrgCreateInput {
  return {
    name: faker.company.companyName(),
    desc: faker.lorem.paragraph(),
    addr: faker.address.streetAddress(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    events: {
      create: Array.from({ length: 1 + faker.datatype.number(1) }, genEvent),
    },
  };
}

function genEvent() {
  const startTime = faker.date.soon();
  const endTime = new Date();
  endTime.setDate(startTime.getDate() + faker.datatype.number(2));

  return {
    name: faker.company.catchPhrase(),
    desc: faker.lorem.paragraph(),
    location: faker.address.streetAddress(),
    startTime: startTime,
    endTime: endTime,
    gallery: Array(3).fill(faker.image.city),
    status: EventStatus.ONGOING,
    positions: {
      create: Array.from({ length: 1 + faker.datatype.number(1) }, genPosition),
    },
  };
}

function genPosition() {
  return {
    name: faker.name.jobTitle(),
    desc: faker.lorem.paragraph(),
    requirements: faker.lorem.paragraph(),
    typesOfWork: Array.from(
      { length: 1 + faker.datatype.number(1) },
      faker.name.jobType
    ),
    thumbnail: faker.image.city(),
  };
}

function genApplication(users: User[], positions: Position[]) {
  const user = faker.random.arrayElement(users);
  const position = faker.random.arrayElement(positions);
  return {
    userId: user.id,
    positionId: position.id,
    notes: faker.lorem.sentence(),
  };
}

async function main() {
  for (let i = 0; i < 30; i++) {
    await prisma.user.create({ data: genUser() });
  }

  for (let i = 0; i < 12; i++) {
    await prisma.org.create({ data: genOrg() });
  }

  const users = await prisma.user.findMany();
  const positions = await prisma.position.findMany();
  for (let i = 0; i < 30; i++) {
    try {
      await prisma.application.create({
        data: genApplication(users, positions),
      });
    } catch (e) {
      console.error(`Error:: ${e}. Seeder will continue to run...`);
    }
  }

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });