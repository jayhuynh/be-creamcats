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

const genOrganizations = async () => {
  const data = JSON.parse(
    fs.readFileSync("prisma/seed-data/data.json", "utf8")
  );

  const genPosition = (position: any) => {
    return {
      name: position.name,
      desc: faker.lorem.paragraph(),
      requirements: faker.lorem.paragraph(),
      gender: faker.random.arrayElement([
        Gender.MALE,
        Gender.FEMALE,
        undefined,
      ]),
      tags: {
        create: position.tags.map((tag: any) => {
          return {
            name: tag,
          };
        }),
      },
      thumbnail: faker.image.city(),
    };
  };

  const genEvent = (event: any) => {
    const startTime = faker.date.soon();
    const endTime = new Date();
    endTime.setDate(startTime.getDate() + faker.datatype.number(2));

    return {
      name: event.name,
      desc: faker.lorem.paragraph(),
      location: event.location,
      startTime: startTime,
      endTime: endTime,
      gallery: Array(3).fill(faker.image.city),
      positions: {
        create: event.positions.map((position: any) => genPosition(position)),
      },
    };
  };

  const genOrganization = (organization: any) => {
    return {
      name: organization.name,
      desc: faker.lorem.paragraph(),
      addr: organization.events[0].location,
      email:
        "contact@" +
        organization.name.split(" ").slice(0, -1).join("").toLowerCase() +
        ".com",
      phone: faker.phone.phoneNumber(),
      events: {
        create: organization.events.map((event: any) => genEvent(event)),
      },
    };
  };

  for (const { organization } of data) {
    await prisma.organization.create({ data: genOrganization(organization) });
  }
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

const genUsers = async () => {
  for (let i = 0; i < 30; i++) {
    await prisma.user.create({ data: genUser() });
  }
};

const genApplications = async () => {
  const users = await prisma.user.findMany();
  const positions = await prisma.position.findMany();

  for (let i = 0; i < 180; i++) {
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
};

const genGeography = async () => {
  const addresses = JSON.parse(
    fs.readFileSync("prisma/seed-data/addresses.json", "utf8")
  );

  for (const addr of addresses) {
    const query = `UPDATE "Event" SET coor = ST_MakePoint(${addr.lng}, ${addr.lat}) WHERE location like '${addr.address}'`;
    await prisma.$executeRaw(query);
  }
};

const main = async () => {
  await genUsers();
  await genOrganizations();
  await genApplications();
  await genTags();
  await genGeography();
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
