import { PassportSerializer } from '@nestjs/passport';

export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: CallableFunction): any {
    done(null, user);
  }
  deserializeUser(payload: any, done: CallableFunction): any {
    done(null, payload);
  }
}
