import { Atviseproject, NodeId } from 'atscm';
import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import symlink from './atscm/symlink';
import rollup from './atscm/rollup';
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
      opc: 4840,
      http: 80,
    };
  }

  static get nodes() {
    return [
      new NodeId('SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.atscm'),
      new NodeId('SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.atscm.AddReferences'),
      new NodeId('SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.atscm.CreateNode'),
      new NodeId('SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.atscm.DeleteNode'),
    ];
  }

  static get useTransformers() {
    return [
      symlink(
        'SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.atscm',
        `SYSTEM.LIBRARY.ATVISE.SERVERSCRIPTS.${serverDirectory}`
      ),
    ]
      .concat(super.useTransformers)
      .concat([
        rollup({
          plugins: [
            resolve(),
            commonjs({ include: 'node_modules/**' }),
            babel({ exclude: 'node_modules/**' }),
          ],
        }),
      ]);
  }
}
