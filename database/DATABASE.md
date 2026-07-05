# UNI-NEST Database Documentation

Database: **MySQL 8** managed with **Prisma ORM**.
Schema source of truth: [`server/prisma/schema.prisma`](../server/prisma/schema.prisma).
ER diagram: [ER-DIAGRAM.md](ER-DIAGRAM.md).

## Local setup

1. Install MySQL 8 and create a database and user:

   ```sql
   CREATE DATABASE uninest;
   CREATE USER 'uninest'@'localhost' IDENTIFIED BY 'uninest_dev';
   GRANT ALL PRIVILEGES ON uninest.* TO 'uninest'@'localhost';
   ```

2. Set `DATABASE_URL` in `server/.env`:

   ```
   DATABASE_URL="mysql://uninest:uninest_dev@localhost:3306/uninest"
   ```

3. Run migrations and seed sample data:

   ```bash
   cd server
   npm run prisma:migrate   # applies migrations
   npm run prisma:seed      # inserts sample data
   npx tsx prisma/test-relationships.ts   # verifies relationships
   ```

## Tables overview

| Table                                                  | Purpose                                                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `User`                                                 | All accounts. `role` decides the portal (student, landlord, university, company, admin). |
| `University`                                           | Registered universities; university staff users link to one.                             |
| `Company`                                              | Real estate / property management companies, verified by registration number.            |
| `Property`                                             | Accommodation listings, owned by a user, optionally managed by a company.                |
| `PropertyImage`                                        | Photos for a listing (`isCover` marks the main photo).                                   |
| `Amenity` / `PropertyAmenity`                          | Many-to-many amenities (WiFi, parking, etc.).                                            |
| `UniversityRecommendation`                             | Properties a university recommends to its students.                                      |
| `Reservation`                                          | Accommodation bookings (`STAY`) and viewing appointments (`VIEWING`).                    |
| `WishlistItem`                                         | Properties saved by students.                                                            |
| `Review`                                               | Star ratings + comments; one review per student per property.                            |
| `Conversation` / `ConversationParticipant` / `Message` | Direct messaging between users.                                                          |
| `Notification`                                         | In-app notifications per user.                                                           |

## Key design decisions

- **Single `User` table with a `role` enum** instead of separate tables per user
  type — simpler joins and one login system. University/company staff link to
  their organisation through nullable `universityId` / `companyId` foreign keys.
- **`price` is `DECIMAL(10,2)`** to avoid floating point rounding errors on money.
- **Composite primary keys** on pure join tables (`PropertyAmenity`,
  `WishlistItem`, `ConversationParticipant`, `UniversityRecommendation`) prevent
  duplicates without an extra id column.
- **`onDelete: Cascade`** on child rows (images, reservations, reviews, messages)
  so deleting a property or user cleans up related data automatically.
- **Indexes** on the columns used by search and filtering: `Property.city`,
  `Property.price`, `Property.status`, `Property.type`, `Reservation.status`,
  `Reservation.startDate`, and `Notification(userId, read)`.

## Seed data

`server/prisma/seed.ts` creates: 1 university, 1 company, 6 users (admin,
landlord, company staff, university staff, 2 students), 8 amenities,
3 properties (2 approved, 1 pending), 2 reservations, 1 wishlist item,
1 review, 1 conversation with 2 messages, and 2 notifications.

Passwords in the seed are placeholders — real hashing arrives in Phase 3.
