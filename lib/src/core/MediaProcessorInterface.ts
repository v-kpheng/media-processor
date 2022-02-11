export interface MediaProcessorInterface {
    transform (readable: ReadableStream, writable: WritableStream): Promise<void>;
    destroy(): Promise<void>;
}
