# Architecture Research

## Question
How does the Supabase backend integrate with the existing architecture?

## Findings

**Existing Architecture:**
- All data access is abstracted behind repository interfaces (e.g., `PatientRepository`, `AgendaRepository`).
- The data model is entirely server-side (React Server Components and Server Actions).

**Integration Points:**
- **Prisma Schema:** We will define a `schema.prisma` that mirrors the current domain types. 
- **Repository Implementations:** We will create `Prisma...Repository` implementations that fulfill the existing repository contracts. The rest of the application (actions, views) will remain untouched.
- **Authentication:** The `src/lib/auth/session.ts` and `src/middleware.ts` will be updated to use Supabase SSR auth. 

**Build Order:**
1. Setup Supabase project and define `schema.prisma`.
2. Implement and test Prisma repositories one by one (Patient -> Agenda -> Clinical -> Document -> Finance).
3. Integrate Supabase Auth and replace the current workspace/auth stubs.

## Conclusion
The foresight to use repository interfaces in v1.0 pays off here. The architecture supports a clean swap of the persistence layer. We only need to write the Prisma implementations and update the auth layer.