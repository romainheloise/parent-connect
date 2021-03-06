import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';

@Injectable()
export class AuthSpotifyGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const noAuth = this.reflector.get<boolean>('no-auth', context.getHandler());

    if (noAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const appToken = request?.cookies?.app;

    if (!appToken) {
      throw new HttpException(
        '[AUTHGUARD]' +
          request.route.path.toUpperCase() +
          ' no app token / not logged ',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.handleUser(appToken, request);
  }

  private async handleUser(token, req) {
    const usersInfos = await this.getUserInfos(token);

    // CHECK IF NEED TO REFRESH TOKEN //
    const user = await this.authService.refreshTokenCheck(usersInfos);

    // SURCHARGE REQ WITH USER INFOS //
    req.userInfos = user;

    return true;
  }

  private async getUserInfos(token) {
    const userId = await this.authService.getUserIdFromToken(token);
    const userInfos = await this.usersService.findOne({
      id: userId,
      email: '',
    });
    return userInfos;
  }
}
