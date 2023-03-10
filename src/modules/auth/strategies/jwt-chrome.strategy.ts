import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfigService } from 'src/modules/app-config/app-config.service';

@Injectable()
export class JwtChromeStrategy extends PassportStrategy(Strategy, 'chrome') {
  constructor(private readonly configService: AppConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt_secret'),
    });
  }

  async validate(payload: any) {
    return { id: payload.id, exp: payload.exp };
  }
}
