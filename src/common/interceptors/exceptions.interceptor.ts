import {
  BadRequestException,
  CallHandler,
  ConflictException,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';

import { LoggerService, LoggingLevels } from '../services';

@Injectable()
export class ExceptionsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error: Error) => {
        const status = this.resolveHttpStatus(error);

        LoggerService.log(
          LoggingLevels.error,
          `Http error. Status: ${status}`,
          { stack: error.stack },
        );

        let message = error.message;

        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
          message = 'Unexpected server error occured.';
        }

        throw new HttpException(message, status);
      }),
    );
  }

  private resolveHttpStatus(error: Error): HttpStatus {
    if (error instanceof NotFoundException) {
      return HttpStatus.NOT_FOUND;
    } else if (error instanceof ConflictException) {
      return HttpStatus.CONFLICT;
    } else if (error instanceof BadRequestException) {
      return HttpStatus.BAD_REQUEST;
    } else {
      return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
