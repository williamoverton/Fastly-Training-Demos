/**
 * Stub out CacheOverride class as it is not available outside fastly's compute runtime.
 */
 if(!globalThis.CacheOverride) {
  globalThis.CacheOverride = class CacheOverride {
    constructor(name, options) {
      this.name = name;
      this.options = options;
    }
  }
}