import type { ApiProvider } from "../types";
import { createMockProvider } from "../mock";

export const createCloudbaseProvider = (): ApiProvider => {
  if (!process.env.CLOUDBASE_ENV_ID) {
    console.warn(
      "[api] CLOUDBASE_ENV_ID is not set; using contract-compatible local provider."
    );
  }

  return createMockProvider();
};
