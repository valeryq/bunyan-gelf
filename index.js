const { Writable } = require("node:stream");

const Tcp = require("./transports/Tcp");
const Udp = require("./transports/Udp");

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

class BunyanToGelfStream extends Writable {
  /**
   * BunyanToGelfStream
   *
   * @param options
   * @param options.host
   * @param options.port
   * @param options.protocol Protocol can be 'udp' or 'tcp'
   */
  constructor(options = {}) {
    super();
    this._transport =
      options.protocol === "tcp" ? new Tcp(options) : new Udp(options);
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

    this._transport.send(message);
  }
}

module.exports = BunyanToGelfStream;
