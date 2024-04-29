import { Prisma } from '@prisma/client';

export type IToken = Prisma.TokenGetPayload<{}>;

export type SaveTokenType = Omit<IToken, 'id'>;

export type TokenBodyType = {
  email: string;
  id: number;
  isActivated: boolean;
};
