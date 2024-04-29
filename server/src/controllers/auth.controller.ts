import { Request, Response, NextFunction } from 'express';
import authService from '../services/authServices/auth.service';
import dotenv from 'dotenv';
import { validationResult } from 'express-validator';
import ApiError from '../exceptions/apiError';
dotenv.config();

interface IAuthController {
  registration(req: Request, res: Response, next: NextFunction): Promise<void>;
  // login(req: Request, res: Response, next: NextFunction): Promise<void>;
  // logout(req: Request, res: Response, next: NextFunction): Promise<void>;
  // activateAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
  // refreshToken(req: Request, res: Response, next: NextFunction): Promise<void>;
  // getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void>;
}

class AuthController implements IAuthController {
  async registration(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('Ошибка валидации', errors.array()));
      }
      const { email, password, name } = req.body;

      const userData = await authService.registration({ email, password, name });
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  // login(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  //
  // logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  //
  async activateAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const activationLink = req.params.link;
      await authService.activateAccount(activationLink);
      res.redirect(process.env.CLIENT_URL!);
    } catch (e) {
      next(e);
    }
  }
  //
  // refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
  //
  // getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  //   try {
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }
}

export default new AuthController();
