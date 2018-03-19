import { join, relative } from 'path';
import { Transformer, NodeId } from 'atscm';
import { DataType, Variant, VariantArrayType, NodeClass } from 'node-opcua';
import { obj as createStream } from 'through2';
import CallMethodStream from 'atscm/out/lib/server/scripts/CallMethodStream';
import { outputFile } from 'fs-extra';
import Logger from 'gulplog';
import colors from 'chalk';

class ExportStream extends CallMethodStream {

  get methodId() {
    return new NodeId('AGENT.OPCUA.METHODS.exportNodes');
  }

  handleOutputArguments(file, outputArguments, callback) {
    this.push({ file, data: outputArguments[0].value });

    callback(null);
  }

  inputArguments(file) {
    return [
      new Variant({
        dataType: DataType.NodeId,
        arrayType: VariantArrayType.Array,
        value: [file.nodeId],
      }),
    ];
  }

}

export class ExportTransformer extends Transformer {

  constructor(path) {
    super({});

    // const { outPath, push = true } = options;

    this._outPath = join(process.cwd(), path);
    /* this.pushToServer = push;
    this.createExport = push && !process.env.ATSCM_WATCH; */

    this._filesToExport = [];
  }

  transformFromFilesystem(file, _, callback) {
    if (file.nodeClass === NodeClass.Variable) {
      Logger.debug(colors.gray('Export', file.nodeId));
      this._filesToExport.push(file);
    }

    callback(null, file);
  }

  async _flush(callback) {
    const all = [];

    const stream = new ExportStream();
    const writeStream = createStream(({ file, data }, _, cb) => {
      const path = join(this._outPath, `${file.stem}.xml`);
      outputFile(path, data)
        .then(() => cb(null, path))
        .catch(e => cb(e));
    })
      .on('data', d => {
        all.push(relative(this._outPath, d));
        Logger.info(`Created export ${colors.magenta(relative(process.cwd(), d))}`);
      })
      .on('error', callback)
      .on('end', () => {
        const indexPath = join(this._outPath, 'exports.js');

        outputFile(indexPath, `const { join } = require('path');

module.exports = ${
  JSON.stringify(all, null, '  ')
}.map(name => join(__dirname, name));`)
          .then(() => {
            callback();
            Logger.info(`Created export index file at ${
              colors.magenta(relative(process.cwd(), indexPath))
            }`);
          })
          .catch(err => callback(err));
      });

    stream.pipe(writeStream);

    this._filesToExport.forEach(f => stream.write(f));
    stream.end();
  }

}

export default function exportFiles(path) {
  return new ExportTransformer(path);
}
