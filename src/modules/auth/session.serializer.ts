import { PassportSerializer } from '@nestjs/passport';
import { ReqUser } from 'src/types/interfaces';

export class SessionSerializer extends PassportSerializer {
  serializeUser(user: ReqUser, done: CallableFunction): any {
    done(null, user);
  }
  deserializeUser(payload: any, done: CallableFunction): any {
    done(null, payload);
  }
}
