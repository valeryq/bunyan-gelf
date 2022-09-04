const dgram = require('dgram');
const zlib = require('zlib');
const JSON = require('circular-json');

class Udp {
  /**
   * UDP transport
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
    const client = dgram.createSocket('udp4');

    client.on('error', (error) => {
      console.log('BunyanToGelfStream UDP socket connection error', error);
      client.close();
    });

    return client;
  }

  /**
   * Send message to UDP socket
   *
   * @param message
   */
  send(message) {
    const buffer = Buffer.from(JSON.stringify(message));

    // Gzipping is required to send to log services
    zlib.gzip(buffer, (err, compressed) => {
      if (!err) {
        const client = this._createClient();
        client.send(
          compressed,
          0,
          compressed.length,
          this._port,
          this._host,
          () => {
            client.close();
          }
        );
      }
    });
  }
}

module.exports = Udp;
