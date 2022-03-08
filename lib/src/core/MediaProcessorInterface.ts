/**
 * Interface definition for media processor instances.
 */
export interface MediaProcessorInterface {
    /**
     * Starts running the tranformation logic performed by the media processor instance.
     *
     * @param readable Readable stream associated to the media source being processed.
     * @param writable Writable stream associated to the resulting media once processed.
     */
    transform (readable: ReadableStream, writable: WritableStream): Promise<void>;
    /**
     * Stops running the tranformation logic performed by the media processor instance.
     */
     destroy(): Promise<void>;
}
