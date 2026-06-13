const Module = require("node:module");

const originalLoad = Module._load;

Module._load = function loadWithGeneratorInterop(request, parent, isMain) {
  const loaded = originalLoad.apply(this, arguments);

  if (
    request === "generator-function" &&
    typeof loaded !== "function" &&
    loaded &&
    typeof loaded.default === "function"
  ) {
    return loaded.default;
  }

  return loaded;
};
