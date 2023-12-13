import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { QuizAnswerRequest, RequestWithVersion } from 'src/types/interfaces';
import { AuthService } from '../auth.service';

@Injectable()
export class UserStatusStrategy extends PassportStrategy(Strategy, 'userstatus') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: QuizAnswerRequest) {
    const validate = await this.authService.validateUserStatus(+req.user.id);
    if (validate) {
      return req.user;
    } else {
      throw new UnauthorizedException('User is restricted');
    }
  }
}
