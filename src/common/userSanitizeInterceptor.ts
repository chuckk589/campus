import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ReqUser } from 'src/types/interfaces';

@Injectable()
export class UserSanitizeInterceptor<T, R extends string | null> implements NestInterceptor {
  constructor(private readonly dtoType: { new (payload: any, user: ReqUser): T }, private readonly key: R = null) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data: MaybeNested<R>) => {
        const isArray = this.key ? Array.isArray(data[this.key]) : Array.isArray(data);
        if (this.key) {
          return {
            ...data,
            [this.key]: isArray
              ? data[this.key].map((item: any) => new this.dtoType(item, req.user))
              : new this.dtoType(data[this.key], req.user),
          };
        } else {
          return isArray ? data.map((item: any) => new this.dtoType(item, req.user)) : new this.dtoType(data, req.user);
        }
      }),
    );
  }
}

type MaybeNested<T extends string | null> = T extends null ? any | any[] : { [ModalName in T]: any | any[] };
