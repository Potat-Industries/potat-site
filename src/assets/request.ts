/* eslint-disable import/no-unresolved */
// eslint-disable-next-line import/extensions
import { ExtendedOptions, GenericResponse, ParsedRes } from '../types/request';

export const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://api.potat.app';

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
  options: ExtendedOptions = {},
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
      'X-Potat-User-Agent': `Potat-Site: ${navigator.userAgent}`,
      ...options.headers,
      authorization: `Bearer ${localStorage.getItem('authorization')}`,
    };
  } else {
    options.headers = {
      'X-Potat-User-Agent': `Potat-Site: ${navigator.userAgent}`,
      ...options?.headers,
    };
  }

  const response = await fetch(url, options);
  return parseResponse<T>(response);
}

export async function fetchBackend<T = unknown>(
  url: string,
  options?: ExtendedOptions,
): Promise<ParsedRes<GenericResponse<T>>> {
  const base = API_BASE.replace(/\/+$/, '');
  const path = url.replace(/^\/+/, '');
  const result = await makeRequest<GenericResponse<T>>(
    `${base}/${path}`,
    options,
  );

  if (result.errors?.length) {
    // eslint-disable-next-line no-console
    console.error(result.errors);
  }

  return result;
}
