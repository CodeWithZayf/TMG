import { get, post, put, del } from 'aws-amplify/api';
import type { DocumentType } from '@aws-amplify/core/internals/utils';

/**
 * Typed API Gateway wrapper.
 * All calls auto-attach Cognito JWT via Amplify.
 * Never call fetch() directly in service files — always use these.
 */

export async function apiGet<T>(path: string, query?: Record<string, string>): Promise<T> {
  const { body } = await get({
    apiName: 'TMGApi',
    path,
    options: { queryParams: query },
  }).response;
  return body.json() as T;
}

export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const res = await post({
    apiName: 'TMGApi',
    path,
    options: { body: payload as DocumentType },
  }).response;
  return res.body.json() as T;
}

export async function apiPut<T>(path: string, payload: unknown): Promise<T> {
  const res = await put({
    apiName: 'TMGApi',
    path,
    options: { body: payload as DocumentType },
  }).response;
  return res.body.json() as T;
}

export async function apiDel(path: string): Promise<void> {
  await del({
    apiName: 'TMGApi',
    path,
  }).response;
}
