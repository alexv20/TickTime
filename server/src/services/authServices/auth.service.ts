import { AuthData, IUser } from '../../types/user.types';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import mailService from './mail.service';
import tokenService from './token.service';
import UserDto from '../../dtos/user.dto';
import ApiError from '../../exceptions/apiError';

const prisma: PrismaClient = new PrismaClient();

interface IAuthService {
  registration(authData: AuthData): Promise<any>;
  // login(authData: AuthData): Promise<any>;
  // logout(userId: string): Promise<void>;
  // activateAccount(activationLink: string): Promise<any>;
  // refreshAccessToken(refreshToken: string): Promise<any>;
  // getAllUsers(): Promise<any[]>;
}

class AuthService implements IAuthService {
  // Функция для регистрации
  async registration({ email, password, name }: AuthData): Promise<any> {
    const candidate = await prisma.user.findFirst({
      where: { email: email },
    });

    if (candidate) {
      throw ApiError.BadRequest('Пользователь с таким email уже существует');
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuidv4();

    const user: IUser = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        name,
        isActivated: false,
        activationLink: activationLink,
      },
    });

    await mailService.sendActivationMail(email, activationLink);

    const userDto = new UserDto(user);
    const tokens = await tokenService.generateToken({ ...userDto });
    await tokenService.saveToken({
      userId: userDto.id,
      refreshToken: tokens.refreshToken,
    });

    return {
      ...tokens,
      user: userDto,
    };
  }

  // // Функция для входа в аккаунт
  // async login(authData: AuthData): Promise<any> {}
  //
  // // Функция для выхода из аккаунта
  // async logout(userId: string): Promise<void> {}
  //
  // // Функция для обновления access-токена
  // async refreshAccessToken(refreshToken: string): Promise<any> {}

  // Функция для активации аккаунта
  async activateAccount(activationLink: string): Promise<any> {
    const user = await prisma.user.findFirst({
      where: {
        activationLink: activationLink,
      },
    });

    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации');
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isActivated: true,
      },
    });
  }

  // // Функция для получения всех пользователей (для тестов)
  // async getAllUsers(): Promise<any[]> {}
}

export default new AuthService();
