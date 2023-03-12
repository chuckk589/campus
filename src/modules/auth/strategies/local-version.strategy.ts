import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { RequestWithVersion } from 'src/types/interfaces';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalVersionStrategy extends PassportStrategy(Strategy, 'version') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(req: RequestWithVersion) {
    const version = req.headers['x-version'];
    if (version) {
      const validate = await this.authService.validateVersion(version);
      if (validate) {
        return req.user || { version: version };
      } else {
        throw new UnauthorizedException('Invalid version');
      }
    } else {
      throw new UnauthorizedException('No version header');
    }
  }
}
