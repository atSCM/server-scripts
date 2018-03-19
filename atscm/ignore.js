import { PartialTransformer } from 'atscm';

export class IgnoreTransformer extends PartialTransformer {

  constructor(path) {
    super({});

    this._path = path;
  }

  shouldBeTransformed(file) {
    // relative path starts with the given path
    return file.relative.split(this._path)[0] === '';
  }

  transformFromFilesystem(file, _, callback) {
    callback(null);
  }

}

export default function ignore(path) {
  return new IgnoreTransformer(path);
}
