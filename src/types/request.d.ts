export interface ExtendedOptions extends RequestInit {
  params?: Record<string, unknown>;
  auth?: boolean;
}

export type ParsedRes<T> = {
  statusCode: number;
} & T

/**
 * Generic format for all backend API responses.
 */
export type GenericResponse<T> = {
  data: T[];
  duration: number;
  statusCode: number;
  pagination?: { cursor: string; hasNextPage: boolean; };
  errors?: { message: string; }[]
}
