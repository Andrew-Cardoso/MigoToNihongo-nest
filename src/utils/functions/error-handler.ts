import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

type CustomError = (title: string, message: string | string[]) => never;

export const badRequest: CustomError = (title, message) => {
  throw new ForbiddenException({
    title,
    message,
    statusCode: 400,
    error: 'Bad Request',
  });
};

export const unauthorized: CustomError = (title, message) => {
  throw new UnauthorizedException({
    title,
    message,
    statusCode: 401,
    error: 'Unauthorized',
  });
};

export const forbidden: CustomError = (title, message) => {
  throw new ForbiddenException({
    title,
    message,
    statusCode: 403,
    error: 'Forbidden',
  });
};

export const notFound: CustomError = (title, message) => {
  throw new NotFoundException({
    title,
    message,
    statusCode: 404,
    error: 'Not Found',
  });
};

export const gone: CustomError = (title, message) => {
  throw new NotFoundException({
    title,
    message,
    statusCode: 410,
    error: 'Gone',
  });
};
