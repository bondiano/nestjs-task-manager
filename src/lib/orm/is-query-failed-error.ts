import { DatabaseError } from 'pg-protocol';
import { QueryFailedError } from 'typeorm';

export const isQueryFailedError = (
  error: unknown
): error is QueryFailedError & DatabaseError =>
  error instanceof QueryFailedError;
