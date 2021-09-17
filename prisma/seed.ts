import faker from "faker";
import fs from "fs";
import { Position, Prisma, User } from "@prisma/client";
import { PrismaClient, Gender } from ".prisma/client";

const prisma = new PrismaClient();

interface ArrayGenInput<T> {
  minLen: number;
  maxLen: number;
  f: () => T;
}

const genArray = <T>(input: ArrayGenInput<T>): T[] => {
  return Array.from(
    { length: faker.datatype.number({ min: input.minLen, max: input.maxLen }) },
    input.f
  );
};

const genUser = (): Prisma.UserCreateInput => {
  return {
    email: faker.internet.email(),
    fullname: faker.name.findName(),
    password: faker.internet.password(),
    gender: faker.random.arrayElement(Object.values(Gender)),
    age: faker.datatype.number({ min: 18, max: 35 }),
    profilePic: faker.image.avatar(),
    posts: {
      create: genArray<Prisma.PostCreateInput>({
        minLen: 1,
        maxLen: 2,
        f: genPost,
      }),
    },
  };
};

const genPost = (): Prisma.PostCreateInput => {
  return {
    title: faker.lorem.words(faker.datatype.number({ min: 3, max: 5 })),
    thumbnail: faker.image.city(),
    content: faker.lorem.paragraph(),
  };
};

const genOrganization = (): Prisma.OrganizationCreateInput => {
  return {
    name: faker.company.companyName(),
    desc: faker.lorem.paragraph(),
    addr: faker.address.streetAddress(),
    email: faker.internet.email(),
    phone: faker.phone.phoneNumber(),
    events: {
      create: genArray<Prisma.EventCreateInput>({
        minLen: 1,
        maxLen: 2,
        f: genEvent,
      }),
    },
  };
};

const genEvent = (): Prisma.EventCreateInput => {
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
    positions: {
      create: Array.from(
        { length: faker.datatype.number({ min: 1, max: 2 }) },
        genPosition
      ),
    },
  };
};

const genPosition = () => {
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
};

const genApplication = async (users: User[], positions: Position[]) => {
  const user = faker.random.arrayElement(users);
  const position = faker.random.arrayElement(positions);

  const application = await prisma.application.findUnique({
    where: {
      userId_positionId: {
        userId: user.id,
        positionId: position.id,
      },
    },
  });

  if (application) return null;

  return {
    userId: user.id,
    positionId: position.id,
    notes: faker.lorem.sentence(),
  };
};

const genTags = async () => {
  const tags = JSON.parse(
    fs.readFileSync("prisma/seed-data/tags.json", "utf8")
  );
  await prisma.tag.createMany({
    data: tags.map((tag: String) => {
      return {
        name: tag,
      };
    }),
  });
};

const main = async () => {
  for (let i = 0; i < 30; i++) {
    await prisma.user.create({ data: genUser() });
  }

  for (let i = 0; i < 12; i++) {
    await prisma.organization.create({ data: genOrganization() });
  }

  const users = await prisma.user.findMany();
  const positions = await prisma.position.findMany();

  for (let i = 0; i < 30; i++) {
    const application = await genApplication(users, positions);
    if (!application) continue;

    try {
      await prisma.application.create({
        data: application,
      });
    } catch (e) {
      console.error(`Error:: ${e}. Seeder will continue to run...`);
    }
  }

  await genTags();

  console.log("Seeding finished");
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
