import { join } from 'path';
import { PartialTransformer } from 'atscm';
import { rollup } from 'rollup';
import Logger from 'gulplog';

export class RollupTransformer extends PartialTransformer {

  constructor(options) {
    super(options);

    this._options = options || {};
  }

  shouldBeTransformed(file) {
    return file.extname === '.js';
  }

  async bundle(file) {
    const bundle = await rollup(Object.assign({}, this._options, {
      input: join('./src', file.relative),
      onwarn({ loc, frame, message }) {
        // print location if applicable
        if (loc) {
          Logger.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);

          if (frame) Logger.warn(frame);
        } else {
          Logger.warn(message);
        }
      },
    }));

    return bundle.generate({
      format: 'iife',
      name: 'run',
    });
  }

  async transformFromFilesystem(file, _, callback) {
    try {
      let { code } = await this.bundle(file);

      // Serverside scripts return their value at the end
      if (file.isScript) {
        code = `${code}
return run();`;
      }

      const clone = file.clone();
      clone.contents = Buffer.from(code);

      callback(null, clone);
    } catch (e) {
      callback(e);
    }
  }

}

export default function transformWithRollup(options = {}) {
  return new RollupTransformer(options);
}
