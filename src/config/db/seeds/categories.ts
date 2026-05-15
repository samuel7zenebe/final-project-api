import { db } from "../index.js";
import { categories } from "../schema.js";

export const mockCategories = [
  {
    name: "Web Development",
    slug: "web-development",
    description:
      "Frontend and backend web technologies including HTML, CSS, JavaScript, React, Next.js, and APIs.",
  },
  {
    name: "Mobile Development",
    slug: "mobile-development",
    description:
      "Building Android, iOS, and cross-platform mobile applications using modern frameworks.",
  },
  {
    name: "DevOps",
    slug: "devops",
    description:
      "CI/CD, containerization, infrastructure automation, monitoring, and cloud deployment practices.",
  },
  {
    name: "Cloud Computing",
    slug: "cloud-computing",
    description:
      "Cloud platforms, scalable infrastructure, virtualization, and distributed systems.",
  },
  {
    name: "Cybersecurity",
    slug: "cybersecurity",
    description:
      "Application security, penetration testing, encryption, authentication, and secure architecture.",
  },
  {
    name: "Databases",
    slug: "databases",
    description:
      "Relational and NoSQL databases, query optimization, data modeling, and administration.",
  },
  {
    name: "Artificial Intelligence",
    slug: "artificial-intelligence",
    description:
      "Machine learning, neural networks, natural language processing, and AI-powered systems.",
  },
  {
    name: "Data Science",
    slug: "data-science",
    description:
      "Data analysis, visualization, statistics, predictive modeling, and big data processing.",
  },
  {
    name: "Networking",
    slug: "networking",
    description:
      "Computer networks, routing, switching, protocols, and network troubleshooting.",
  },
  {
    name: "Software Engineering",
    slug: "software-engineering",
    description:
      "Software architecture, design patterns, testing, version control, and development methodologies.",
  },
  {
    name: "Blockchain",
    slug: "blockchain",
    description:
      "Distributed ledger technologies, smart contracts, cryptocurrencies, and decentralized applications.",
  },
  {
    name: "Game Development",
    slug: "game-development",
    description:
      "Game engines, graphics programming, physics simulation, and interactive entertainment systems.",
  },
  {
    name: "Internet of Things",
    slug: "internet-of-things",
    description:
      "Connected devices, embedded systems, sensors, and IoT communication protocols.",
  },
  {
    name: "Operating Systems",
    slug: "operating-systems",
    description:
      "Linux, Windows, process management, memory handling, and system-level programming.",
  },
  {
    name: "UI/UX Design",
    slug: "ui-ux-design",
    description:
      "User interface design, user experience research, accessibility, and design systems.",
  },
];

async function seed() {
  try {
    console.log("🌱 Seeding database...");

    await db.insert(categories).values(mockCategories);

    console.log("✅ Categories seeded successfully");
  } catch (error) {
    console.error("❌ Seed failed");
    console.error(error);
  }
}

seed();
