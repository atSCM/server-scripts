import { extname } from 'path';
import { PartialTransformer } from 'atscm';
import { rollup } from 'rollup';
import Logger from 'gulplog';

export class RollupTransformer extends PartialTransformer {
  constructor(options) {
    super(options);

    this._options = options || {};
  }

  shouldBeTransformed(file) {
    return extname(file.relative) === '.js';
  }

  async bundle(file) {
    const bundle = await rollup({
      ...this._options,
      input: file.relative,
      onwarn({ loc, frame, message }) {
        // print location if applicable
        if (loc) {
          Logger.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);

          if (frame) Logger.warn(frame);
        } else {
          Logger.warn(message);
        }
      },
    });

    return bundle.generate({
      format: 'iife',
      name: 'run',
    });
  }

  async transformFromFilesystem(file) {
    if (!this.shouldBeTransformed(file)) return;

    const { code } = await this.bundle(file);

    file.setRawValue(
      Buffer.from(`${code}
return run();`)
    );
  }
}

export default function transformWithRollup(options = {}) {
  return new RollupTransformer(options);
}
