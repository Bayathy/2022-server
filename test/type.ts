import { Prisma } from '@prisma/client';

export type StudentTestRecord = Omit<Prisma.StudentCreateInput, 'Guest'> & {
   Guest?: Prisma.GuestCreateManyInput[];
};

export type GuestTestRecord = Omit<Prisma.StudentCreateInput, 'Guest'> & {
   Guest?: Prisma.GuestCreateManyInput[];
};

export type JhsTestRecord = Omit<Prisma.JHStudentCreateInput, 'Guest'> & {
   Guest?: Prisma.GuestCreateManyInput[];
};
