import { join, relative } from 'path';
import { PartialTransformer } from 'atscm';
import Logger from 'gulplog';
import colors from 'chalk';

export class SymlinkTransformer extends PartialTransformer {

  constructor(source, target) {
    super({});

    this._source = source;
    this._target = target;
  }

  shouldBeTransformed(file) {
    // relative path starts with the given path
    return file.relative.split(this._source)[0] === '';
  }

  transformFromFilesystem(file, _, callback) {
    const original = file.relative;

    // eslint-disable-next-line no-param-reassign
    file.path = join(file.base, this._target, relative(this._source, file.relative));

    Logger.debug('Link:', colors.magenta(original), '->', colors.magenta(file.relative));

    callback(null, file);
  }

}

export default function symlink(source, target) {
  return new SymlinkTransformer(source, target);
}
