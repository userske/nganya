const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
      proxyExternalRequest: "fetch",
    },
  },
  buildCommand: "pnpm run build:next",
};

export default config;
