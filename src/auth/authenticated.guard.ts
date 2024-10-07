import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  constructor(private readonly AuthService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization.split(' ')[1];
    return await this.AuthService.validateToken(token, 'access');
  }
}
