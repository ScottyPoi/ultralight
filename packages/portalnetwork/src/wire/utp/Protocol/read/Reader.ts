import debug from "debug";
import { Packet, _UTPSocket } from "../..";

const log = debug("<uTP>:Reader");
export default class Reader {
  packets: Packet[];
  inOrder: Packet[];
  reading: boolean;
  gotFinPacket: boolean;
  socket: _UTPSocket;
  nextSeqNr: number;
  constructor(socket: _UTPSocket) {
    this.socket = socket;
    this.packets = new Array<Packet>();
    this.inOrder = new Array<Packet>();
    this.reading = true;
    this.gotFinPacket = false;
    this.nextSeqNr = 65536;
  }

  addPacket(packet: Packet) {
    log(`Packet Received.  seqNr: ${packet.header.seqNr}`);
    if (packet.header.seqNr < this.nextSeqNr) {
        this.nextSeqNr = packet.header.seqNr
    }
    this.packets.push(packet);
  }

  notEmpty() {
    return this.packets.length > 0;
  }

  compile(): Uint8Array {
    let length = 0
    this.packets.forEach((p) => {length += p.payload.length})
    let compiled = Buffer.alloc(length);
    this.inOrder.forEach((p) => {compiled = Buffer.concat([compiled, Buffer.from(p.payload)])})
    log(`${compiled.length} Bytes Received.`)
    log(`${Uint8Array.from(compiled).toString().slice(0,20)}...`)
    return Uint8Array.from(compiled);
  }

  run(): Uint8Array {
    let seqNrs = this.packets.map((packet) => {
      return packet.header.seqNr;
    });
    if (seqNrs.includes(this.nextSeqNr)) {
      while (this.reading) {
        if (this.packets.map((p) => {return p.header.seqNr}).includes(this.nextSeqNr)) {
          let packet = this.packets.shift();
          if (packet?.header.seqNr === this.nextSeqNr) {
            this.inOrder.push(packet);
            this.nextSeqNr++
          } else {
            packet && this.packets.push(packet);
          }
        } else {
          this.reading = false;
        }
      }
      return this.compile();
    } else {
        log(`Expected: ${this.nextSeqNr}`)
        log(`Got ${seqNrs.toString()}`)
      return Uint8Array.of(...seqNrs);
    }
  }
}
