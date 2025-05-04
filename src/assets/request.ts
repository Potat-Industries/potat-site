/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/extensions
import { ExtendedOptions, GenericResponse, ParsedRes } from '../types/request';

async function parseResponse<T>(res: Response): Promise<ParsedRes<T>> {
  const blob = await res.blob();

  try {
    return {
      statusCode:
      res.status,
      ...JSON.parse(await blob.text()),
    } as ParsedRes<T>;
  } catch {
    // @ts-expect-error i dont care
    return (await blob.text()) as unknown as T;
  }
}

export async function makeRequest<T = unknown>(
  url: string,
  options?: ExtendedOptions,
): Promise< ParsedRes<T>> {
  if (options?.params) {
    const filteredParams = Object.fromEntries(
      Object
        .entries(options.params)
        .filter(([, value]) => value !== undefined && value !== null),
    );
    url += `?${new URLSearchParams(filteredParams as Record<string, string>)}`;
  }

  if (options?.auth) {
    options.headers = {
      ...options.headers,
      authorization: `Bearer ${localStorage.getItem('authorization')}`,
    };
  }

  const response = await fetch(url, options);
  return parseResponse<T>(response);
}

export async function fetchBackend<T = unknown>(
  url: string,
  options?: ExtendedOptions,
): Promise<ParsedRes<GenericResponse<T>>> {
  const result = await makeRequest<GenericResponse<T>>(
    `https://api.potat.app/${url}`,
    options,
  );

  if (result.errors?.length) {
    console.error(result.errors);
  }

  return result;
}
