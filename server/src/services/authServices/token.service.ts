import jwt, { Secret } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { SaveTokenType, TokenBodyType } from '../../types/token.types';
dotenv.config();

const prisma: PrismaClient = new PrismaClient();

class TokenService {
  // Функция для генерации токенов
  async generateToken(payload: TokenBodyType) {
    const jwtAccessSecret: Secret | undefined = process.env.JWT_ACCESS_SECRET;
    const jwtRefreshSecret: Secret | undefined = process.env.JWT_REFRESH_SECRET;

    if (!jwtAccessSecret || !jwtRefreshSecret) {
      throw new Error('JWT access or refresh secret is not defined');
    }

    const accessToken = jwt.sign(payload, jwtAccessSecret, {
      expiresIn: '15m',
    });
    const refreshToken = jwt.sign(payload, jwtRefreshSecret, {
      expiresIn: '15d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Функция для обновления/создания токена
  async saveToken(payload: SaveTokenType) {
    const { userId, refreshToken } = payload;

    const candidate = await prisma.token.findFirst({
      where: {
        userId,
      },
    });

    if (candidate) {
      const token = await prisma.token.update({
        where: {
          id: candidate.id,
        },
        data: {
          refreshToken: refreshToken,
        },
      });
      return token;
    }

    // Если заходит впервые...
    const token = prisma.token.create({
      data: {
        userId: userId,
        refreshToken: refreshToken,
      },
    });
    return token;
  }
}

export default new TokenService();
