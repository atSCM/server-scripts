import { Atviseproject } from 'atscm';
import babel from 'rollup-plugin-babel';
import createExports from './atscm/export';
import symlink from './atscm/symlink';
import rollup from './atscm/rollup';
import ignore from './atscm/ignore';
import { serverDirectory } from './config';

/**
 * atvise-scm configuration of serverscripts.
 */
export default class ServerScripts extends Atviseproject {

  /**
   * The atvise-server's host.
   * @type {string}
   */
  static get host() {
    return 'localhost';
  }

  /**
   * The atvise-server ports to use.
   * @type {Object}
   * @property {number} opc The OPC-UA port the atvise-server runs on.
   * @property {number} http The HTTP port the atvise-server can be reached at.
   */
  static get port() {
    return {
      opc: 4850,
      http: 9000,
    };
  }

  static get useTransformers() {
    return [
      createExports('./out'),
      symlink('scripts', `SYSTEM/LIBRARY/ATVISE/SERVERSCRIPTS/${serverDirectory}`),
    ]
      .concat(super.useTransformers)
      .concat([
        rollup({
          plugins: [
            babel(),
          ],
        }),
        ignore('lib'),
      ]);
  }

}
