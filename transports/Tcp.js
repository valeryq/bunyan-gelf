const net = require('net');
const JSON = require('circular-json');

class Tcp {
  /**
   * TCP transport
   *
   * @param options
   * @param options.host
   * @param options.port
   */
  constructor(options = {}) {
    this._host = options.host || '127.0.0.1';
    this._port = options.port || 9999;
  }

  /**
   * Create transport client
   *
   * @return {*}
   *
   * @private
   */
  _createClient() {
    const client = net.connect(this._port, this._host);

    client.on('error', error => {
      client.end();
      client.destroy();

      console.log('BunyanToGelfStream TCP socket connection error', error);
    });

    return client;
  }

  /**
   * Send message to UDP socket
   *
   * @param message
   */
  async send(message) {
    const client = this._createClient();

    client.on('connect', () => {
      client.end(JSON.stringify(message));
    });
  }
}

module.exports = Tcp;
