import * as errors from './errors';

type ErrorTypes = typeof errors;

export type HTTPError = ErrorTypes[keyof ErrorTypes];
