export const runningOnCI = Boolean(process.env.CI);
export const serverDirectory = process.env.SERVER_DIR || (runningOnCI ?
  `ccibuild-${process.env.CIRCLE_BUILD_NUM || 'local'}` :
  'atscm');
