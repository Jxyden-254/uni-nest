// Quick sanity checks that database relationships work correctly.
// Run with: npx tsx prisma/test-relationships.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Property -> owner, images, amenities, reviews
  const property = await prisma.property.findFirstOrThrow({
    where: { title: { contains: "Bedsitter" } },
    include: {
      owner: true,
      images: true,
      amenities: { include: { amenity: true } },
      reviews: { include: { student: true } },
      recommendations: { include: { university: true } },
    },
  });
  console.log(`Property "${property.title}" owned by ${property.owner.name}`);
  console.log(`  images: ${property.images.length}`);
  console.log(`  amenities: ${property.amenities.map((a) => a.amenity.name).join(", ")}`);
  console.log(
    `  reviews: ${property.reviews.map((r) => `${r.rating}★ by ${r.student.name}`).join(", ")}`
  );
  console.log(
    `  recommended by: ${property.recommendations.map((r) => r.university.name).join(", ")}`
  );

  // Student -> reservations with property details
  const student = await prisma.user.findFirstOrThrow({
    where: { email: "alice.student@example.com" },
    include: { reservations: { include: { property: true } } },
  });
  console.log(`${student.name} has ${student.reservations.length} reservation(s):`);
  for (const r of student.reservations) {
    console.log(`  ${r.type} at "${r.property.title}" — ${r.status}`);
  }

  // Conversation -> participants and messages
  const conversation = await prisma.conversation.findFirstOrThrow({
    include: {
      participants: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: "asc" } },
    },
  });
  console.log(
    `Conversation between: ${conversation.participants.map((p) => p.user.name).join(" & ")}`
  );
  for (const m of conversation.messages) {
    console.log(`  ${m.sender.name}: ${m.content}`);
  }

  // Company -> staff and managed properties
  const company = await prisma.company.findFirstOrThrow({
    include: { staff: true, properties: true },
  });
  console.log(
    `${company.name}: ${company.staff.length} staff, ${company.properties.length} propert(ies)`
  );

  console.log("\nAll relationship checks passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
