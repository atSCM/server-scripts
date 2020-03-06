import { PartialTransformer } from 'atscm';

export class SymlinkTransformer extends PartialTransformer {
  constructor(source, target) {
    super({});

    this._source = source;
    this._target = target;
  }

  shouldBeTransformed(file) {
    // relative path starts with the given path
    return file.nodeId.split(this._source)[0] === '';
  }

  async transformFromFilesystem(file) {
    if (!this.shouldBeTransformed(file)) return;

    // eslint-disable-next-line no-param-reassign
    file.specialId = file.nodeId.replace(this._source, this._target);
  }
}

export default function symlink(source, target) {
  return new SymlinkTransformer(source, target);
}
