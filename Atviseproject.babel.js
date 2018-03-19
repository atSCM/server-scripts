import { Atviseproject } from 'atscm';

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

}
