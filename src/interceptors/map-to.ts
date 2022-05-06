import {
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  UseInterceptors,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { map, Observable } from 'rxjs';

interface Class {
  new (...args: any[]): any;
}

export const MapTo = (dto: Class) => UseInterceptors(new MapToInterceptor(dto));

class MapToInterceptor implements NestInterceptor {
  constructor(private dto: any) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: any) =>
        plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
          enableImplicitConversion: true,
        }),
      ),
    );
  }
}
