import { SetMetadata, applyDecorators } from "@nestjs/common";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";
import { CacheOptions } from "../common/interfaces/cache.interface";

export function UseCache(options: CacheOptions) {
  return applyDecorators(
    SetMetadata(CACHE_CONSTANTS.METADATA.KEY, options.keyPrefix),
    SetMetadata(CACHE_CONSTANTS.METADATA.TTL, options.ttl || 300),
  );
}
