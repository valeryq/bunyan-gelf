declare module "bunyan-gelf" {
  import { Writable } from "stream";

  export default class BunyanToGelfStream extends Writable {
    constructor(opts) {}
  }
}
