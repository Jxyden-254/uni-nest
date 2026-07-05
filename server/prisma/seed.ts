// Seed script for UNI-NEST.
// Populates the database with realistic sample data for development.
// Run with: npm run prisma:seed
import {
  PrismaClient,
  Role,
  CompanyType,
  PropertyType,
  PropertyStatus,
  ReservationType,
  ReservationStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data so the seed can be run repeatedly.
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.universityRecommendation.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.university.deleteMany();

  // --- Universities ---
  const university = await prisma.university.create({
    data: {
      name: "Nairobi Technical University",
      email: "housing@ntu.ac.ke",
      city: "Nairobi",
      address: "Haile Selassie Avenue",
      website: "https://ntu.ac.ke",
      verified: true,
    },
  });

  // --- Companies ---
  const company = await prisma.company.create({
    data: {
      name: "Prime Student Living Ltd",
      registrationNumber: "PVT-2021-001234",
      type: CompanyType.PROPERTY_MANAGEMENT,
      email: "info@primestudentliving.co.ke",
      phone: "+254700111222",
      verified: true,
    },
  });

  // --- Users ---
  // NOTE: passwords are plain placeholders for now.
  // Real hashing is added in Phase 3 (Authentication).
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@uninest.com",
      password: "placeholder",
      role: Role.ADMIN,
      emailVerified: true,
    },
  });

  const landlord = await prisma.user.create({
    data: {
      name: "James Mwangi",
      email: "james.landlord@example.com",
      password: "placeholder",
      phone: "+254711222333",
      role: Role.LANDLORD,
      emailVerified: true,
    },
  });

  const companyStaff = await prisma.user.create({
    data: {
      name: "Grace Wanjiru",
      email: "grace@primestudentliving.co.ke",
      password: "placeholder",
      role: Role.COMPANY,
      companyId: company.id,
      emailVerified: true,
    },
  });

  const universityStaff = await prisma.user.create({
    data: {
      name: "Housing Office",
      email: "office@ntu.ac.ke",
      password: "placeholder",
      role: Role.UNIVERSITY,
      universityId: university.id,
      emailVerified: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Alice Njeri",
      email: "alice.student@example.com",
      password: "placeholder",
      phone: "+254722333444",
      role: Role.STUDENT,
      emailVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Brian Otieno",
      email: "brian.student@example.com",
      password: "placeholder",
      role: Role.STUDENT,
    },
  });

  // --- Amenities ---
  const amenityNames = [
    "WiFi",
    "Water Included",
    "Electricity Included",
    "Parking",
    "Security Guard",
    "CCTV",
    "Laundry",
    "Furnished",
  ];
  const amenities = await Promise.all(
    amenityNames.map((name) => prisma.amenity.create({ data: { name } }))
  );

  // --- Properties ---
  const property1 = await prisma.property.create({
    data: {
      title: "Cozy Bedsitter near NTU Main Gate",
      description:
        "A clean, secure bedsitter 5 minutes' walk from Nairobi Technical University. Water and WiFi included.",
      type: PropertyType.BEDSITTER,
      price: 8500,
      city: "Nairobi",
      address: "Ngara Road, Block C",
      latitude: -1.2795,
      longitude: 36.8259,
      status: PropertyStatus.APPROVED,
      ownerId: landlord.id,
      images: {
        create: [
          { url: "/images/properties/bedsitter-1.jpg", isCover: true },
          { url: "/images/properties/bedsitter-2.jpg" },
        ],
      },
      amenities: {
        create: [
          { amenityId: amenities[0].id }, // WiFi
          { amenityId: amenities[1].id }, // Water Included
          { amenityId: amenities[4].id }, // Security Guard
        ],
      },
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: "Modern One Bedroom - Prime Student Living",
      description:
        "Fully managed one bedroom apartment with 24/7 security, backup water, and a study area.",
      type: PropertyType.ONE_BEDROOM,
      price: 15000,
      city: "Nairobi",
      address: "Juja Road, Prime Court",
      latitude: -1.2635,
      longitude: 36.8551,
      bedrooms: 1,
      bathrooms: 1,
      status: PropertyStatus.APPROVED,
      ownerId: companyStaff.id,
      companyId: company.id,
      images: {
        create: [{ url: "/images/properties/onebed-1.jpg", isCover: true }],
      },
      amenities: {
        create: [
          { amenityId: amenities[0].id }, // WiFi
          { amenityId: amenities[3].id }, // Parking
          { amenityId: amenities[5].id }, // CCTV
          { amenityId: amenities[7].id }, // Furnished
        ],
      },
    },
  });

  const property3 = await prisma.property.create({
    data: {
      title: "Shared Hostel Room - Budget Friendly",
      description: "Affordable shared hostel accommodation. Awaiting admin approval.",
      type: PropertyType.HOSTEL,
      price: 4500,
      city: "Nairobi",
      address: "Park Road Hostels",
      status: PropertyStatus.PENDING,
      ownerId: landlord.id,
    },
  });

  // --- University recommendation ---
  await prisma.universityRecommendation.create({
    data: { universityId: university.id, propertyId: property1.id },
  });

  // --- Reservations ---
  await prisma.reservation.create({
    data: {
      type: ReservationType.STAY,
      status: ReservationStatus.ACCEPTED,
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-15"),
      message: "I would like to move in before the semester starts.",
      propertyId: property1.id,
      studentId: student1.id,
    },
  });

  await prisma.reservation.create({
    data: {
      type: ReservationType.VIEWING,
      status: ReservationStatus.PENDING,
      startDate: new Date("2026-07-20T10:00:00Z"),
      propertyId: property2.id,
      studentId: student2.id,
    },
  });

  // --- Wishlist ---
  await prisma.wishlistItem.create({
    data: { userId: student2.id, propertyId: property1.id },
  });

  // --- Reviews ---
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Very close to campus and the landlord is responsive.",
      propertyId: property1.id,
      studentId: student1.id,
    },
  });

  // --- Conversation between a student and the landlord ---
  const conversation = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: student1.id }, { userId: landlord.id }],
      },
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: student1.id,
      content: "Hello, is the bedsitter still available for August?",
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: landlord.id,
      content: "Yes it is! You are welcome to book a viewing.",
      readAt: new Date(),
    },
  });

  // --- Notifications ---
  await prisma.notification.create({
    data: {
      userId: student1.id,
      title: "Reservation accepted",
      body: "Your reservation for 'Cozy Bedsitter near NTU Main Gate' was accepted.",
    },
  });

  await prisma.notification.create({
    data: {
      userId: landlord.id,
      title: "New viewing request",
      body: "Brian Otieno requested a viewing.",
      read: false,
    },
  });

  console.log("Seed complete:");
  console.log(`  users: ${await prisma.user.count()}`);
  console.log(`  properties: ${await prisma.property.count()}`);
  console.log(`  reservations: ${await prisma.reservation.count()}`);
  console.log(`  reviews: ${await prisma.review.count()}`);
  console.log(`  messages: ${await prisma.message.count()}`);
  void admin;
  void property3;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
