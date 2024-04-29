import { Prisma } from '@prisma/client';

export type IUser = Prisma.UserGetPayload<{}>;

export type AuthData = {
  email: string;
  password: string;
  name: string;
};
