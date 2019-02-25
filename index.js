const dgram = require('dgram');
const zlib = require('zlib');
const JSON = require('circular-json');

const LEVELS = {
  EMERGENCY: 0,
  ALERT: 1,
  CRITICAL: 2,
  ERROR: 3,
  WARNING: 4,
  NOTICE: 5,
  INFO: 6,
  DEBUG: 7,
};

class BunyanToGelfStream {
  /**
   * BunyanToGelfStream
   *
   * @param options
   * @param options.host
   * @param options.port
   */
  constructor(options = {}) {
    this._host = options.host || '127.0.0.1';
    this._port = options.port || 9999;

    this._client = null;
  }

  /**
   * Singleton
   * Create dgram UDP socket client
   *
   * @return {Socket | *}
   * @private
   */
  client() {
    if (!this._client) {
      this._client = dgram.createSocket('udp4');

      this._client.on('error', error => {
        console.log('BunyanToGelfStream socket connection error', error);
      });
    }

    return this._client;
  }

  /**
   * Map default bunyan log levels to gelf levels format
   *
   * @param level
   *
   * @return {number}
   * @private
   */
  _mapBunyanLevelToGelf(level) {
    switch (level) {
      case 10:
        return LEVELS.DEBUG;
      case 20:
        return LEVELS.DEBUG;
      case 30:
        return LEVELS.INFO;
      case 40:
        return LEVELS.WARNING;
      case 50:
        return LEVELS.ERROR;
      case 60:
        return LEVELS.EMERGENCY;
      default:
        return LEVELS.WARNING;
    }
  }

  /**
   * Write logs to udp socket
   *
   * @param log
   */
  write(log) {
    const message = {
      host: log.hostname,
      timestamp: +new Date(log.time) / 1000,
      short_message: log.msg,
      facility: log.name,
      level: this._mapBunyanLevelToGelf(log.level),
      full_message: JSON.stringify(log, null, 2),
    };

    // Remove gelf ignored fields
    const keys = Object.keys(log).filter(key => !['hostname', 'time', 'msg', 'name', 'level', 'v'].includes(key));

    keys.forEach(key => {
      message[`_${key}`] = log[key];
    });

    const buffer = Buffer.from(JSON.stringify(message));

    // Gzipping is required to send to log services
    zlib.gzip(buffer, (err, compressed) => {
      if (!err) {
        this.client().send(compressed, 0, compressed.length, this._port, this._host);
      }
    });
  }
}

module.exports = BunyanToGelfStream;

