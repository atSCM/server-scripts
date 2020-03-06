export const runningOnCI = Boolean(process.env.CI);
export const serverDirectory =
  process.env.SERVER_DIR ||
  (runningOnCI ? `ccibuild-${process.env.CIRCLE_SHA1 || 'local'}` : 'atscm');
