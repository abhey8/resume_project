function getEnvFn(arg) {
  return arg && typeof arg.env === "function" ? arg.env : (k) => process.env[k];
}

function createConfig(arg) {
  const envFn = getEnvFn(arg);
  return {
    datasource: {
      provider: "mysql",
      url: envFn("DATABASE_URL"),
    },
    generator: {
      provider: "prisma-client-js",
    },
  };
}

// export for CommonJS:
module.exports = createConfig;
// also set default property for ESM interop:
module.exports.default = createConfig;
// also set named export for environments that prefer it:
exports.default = createConfig;
