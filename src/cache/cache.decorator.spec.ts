import { UseCache } from "./cache.decorator";
import { CACHE_CONSTANTS } from "../common/constants/cache.constants";

describe("UseCache Decorator", () => {
  it("should set metadata with provided options", () => {
    const options = {
      keyPrefix: "test",
      ttl: 600,
    };

    const decorator = UseCache(options);
    const metadata = {};
    const target = {};

    decorator(target);

    expect(Reflect.getMetadata(CACHE_CONSTANTS.METADATA.KEY, target)).toBe(
      options.keyPrefix,
    );
    expect(Reflect.getMetadata(CACHE_CONSTANTS.METADATA.TTL, target)).toBe(
      options.ttl,
    );
  });

  it("should use default TTL when not provided", () => {
    const options = {
      keyPrefix: "test",
    };

    const decorator = UseCache(options);
    const metadata = {};
    const target = {};

    decorator(target);

    expect(Reflect.getMetadata(CACHE_CONSTANTS.METADATA.KEY, target)).toBe(
      options.keyPrefix,
    );
    expect(Reflect.getMetadata(CACHE_CONSTANTS.METADATA.TTL, target)).toBe(300);
  });
});
