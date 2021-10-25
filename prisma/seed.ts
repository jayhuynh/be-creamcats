import argon2 from "argon2";
import faker from "faker";
import fs from "fs";
import { addDays } from "date-fns";
import {
  Position,
  Prisma,
  User,
  PrismaClient,
  Gender,
  ApplicationStatus,
} from "@prisma/client";

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

const genUser = async (): Promise<Prisma.UserCreateInput> => {
  return {
    email: faker.internet.email(),
    fullname: `${faker.name.firstName()} ${faker.name.lastName()}`,
    password: await argon2.hash(faker.internet.password()),
    gender: faker.random.arrayElement([Gender.MALE, Gender.FEMALE]),
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
    timeCreated: faker.date.past(),
  };
};

const genPositionCreateInput = (
  position: any
): Prisma.PositionCreateWithoutEventInput => {
  return {
    name: position.name,
    desc: faker.lorem.paragraph(),
    requirements: faker.lorem.paragraph(),
    gender: faker.random.arrayElement([Gender.MALE, Gender.FEMALE, undefined]),
    tags: {
      connect: position.tags.map((tagname: string) => {
        return {
          name: tagname,
        };
      }),
    },
    thumbnail: faker.image.city(),
  };
};

const genEventCreateInput = (event: any): Prisma.EventCreateInput => {
  const startTime = faker.random.arrayElement([
    faker.date.past(),
    faker.date.future(),
  ]);
  const endTime = addDays(startTime, faker.datatype.number(3));

  const eventCreateInput: Prisma.EventCreateInput = {
    name: `${event.name}`,
    desc: faker.lorem.paragraph(),
    location: event.location,
    startTime: startTime,
    endTime: endTime,
    gallery: Array(3).fill(faker.image.city),
    positions: {
      create: event.positions.map((position: any) =>
        genPositionCreateInput(position)
      ),
    },
  };
  return eventCreateInput;
};

const genOrganizationCreateInput = async (
  organization: any
): Promise<Prisma.OrganizationCreateInput> => {
  const name = organization.name;
  const email =
    "contact@" + organization.name.split(" ").join("").toLowerCase() + ".com";

  const password =
    email === "contact@thesalvationarmyaustralia.com"
      ? "123456"
      : faker.internet.password();

  return {
    name: name,
    email: email,
    password: await argon2.hash(password),
    desc: faker.lorem.paragraph(),
    addr: organization.events[0].location,
    phone: faker.phone.phoneNumber(),
    events: {
      create: organization.events.map((event: any) =>
        genEventCreateInput(event)
      ),
    },
    profilePic: faker.image.avatar(),
  };
};

const genOrganizations = async () => {
  const data = JSON.parse(
    fs.readFileSync("prisma/seed-data/data.json", "utf8")
  );

  for (const { organization } of data) {
    console.log(`Organization: ${organization.name}`);
    const organizationCreateInput: Prisma.OrganizationCreateInput =
      await genOrganizationCreateInput(organization);
    await prisma.organization.create({
      data: organizationCreateInput,
    });
  }
};

const genApplicationCreateInput = async (
  users: User[],
  positions: Position[]
): Promise<Prisma.ApplicationCreateInput> => {
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
    User: {
      connect: { id: user.id },
    },
    Position: {
      connect: { id: position.id },
    },
    notes: faker.lorem.sentence(),
    timeCreated: faker.date.past(),
    status: faker.random.arrayElement(Object.values(ApplicationStatus)),
  };
};

const genTags = async () => {
  const tags = JSON.parse(
    fs.readFileSync("prisma/seed-data/tags.json", "utf8")
  );
  await prisma.tag.createMany({
    data: tags.map((tag: String) => {
      console.log(`Tag: ${tag}`);
      return {
        name: tag,
      };
    }),
  });
};

const genUsers = async () => {
  for (let i = 0; i < 30; i++) {
    await prisma.user.create({ data: await genUser() });
  }

  await prisma.user.create({
    data: {
      email: "netcat@uq.edu.au",
      fullname: "Joel Fenwick",
      password: await argon2.hash("123456"),
      gender: "MALE",
      age: 50,
      profilePic: faker.image.avatar(),
      posts: {
        create: genArray<Prisma.PostCreateInput>({
          minLen: 1,
          maxLen: 2,
          f: genPost,
        }),
      },
    },
  });
};

const genApplications = async () => {
  console.log("Generating applications...");
  const users = await prisma.user.findMany();
  const positions = await prisma.position.findMany();

  for (let i = 0; i < 500; i++) {
    const application = await genApplicationCreateInput(users, positions);
    if (!application) continue;

    try {
      await prisma.application.create({
        data: application,
      });
    } catch (e) {
      console.error(`Issue:: ${e}. Seeder will continue to run...`);
    }
  }
};

const genGeography = async () => {
  console.log("Generating lat/lng...");
  const addresses = JSON.parse(
    fs.readFileSync("prisma/seed-data/addresses.json", "utf8")
  );

  for (const addr of addresses) {
    const query = `UPDATE "Event" SET coor = ST_MakePoint(${addr.lng}, ${addr.lat}) WHERE location like '${addr.address}'`;
    await prisma.$executeRaw(query);
  }
};

const main = async () => {
  faker.seed(3801);
  await genUsers();
  await genTags();
  await genOrganizations();
  await genApplications();
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
