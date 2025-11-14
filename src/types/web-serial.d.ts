export {};

declare global {
  interface SerialPort {
    readable: ReadableStream<Uint8Array> | null;
    writable: WritableStream<Uint8Array> | null;
    open(options: { baudRate: number }): Promise<void>;
    close(): Promise<void>;
    getInfo?(): SerialPortInfo;
  }

  interface Serial {
    requestPort(options?: SerialRequestOptions): Promise<SerialPort>;
    getPorts(): Promise<SerialPort[]>;
  }

  interface SerialPortInfo {
    usbVendorId?: number;
    usbProductId?: number;
    usbProductName?: string;
    serialNumber?: string;
  }

  interface SerialRequestOptions {
    filters?: SerialPortFilter[];
  }

  interface SerialPortFilter {
    usbVendorId?: number;
    usbProductId?: number;
  }

  interface Navigator {
    serial: Serial;
  }
}
