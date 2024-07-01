import { PassportSerializer } from '@nestjs/passport';
import { PERMISSIONS } from 'src/constants';
import { ReqUser, ReqUserRaw } from 'src/types/interfaces';
import { OwnerRole } from '../mikroorm/entities/Owner';

export class SessionSerializer extends PassportSerializer {
  serializeUser(user: ReqUserRaw, done: CallableFunction): any {
    done(null, user);
  }
  deserializeUser(payload: ReqUserRaw, done: CallableFunction): any {
    done(null, new ReqUser(payload));
  }
}
