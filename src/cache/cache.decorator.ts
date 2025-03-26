import { SetMetadata, applyDecorators } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache_key_metadata';
export const CACHE_TTL_METADATA = 'cache_ttl_metadata';

export interface CacheOptions {
  keyPrefix: string;
  ttl?: number;
}

export function UseCache(options: CacheOptions) {
  return applyDecorators(
    SetMetadata(CACHE_KEY_METADATA, options.keyPrefix),
    SetMetadata(CACHE_TTL_METADATA, options.ttl || 300),
  );
} 