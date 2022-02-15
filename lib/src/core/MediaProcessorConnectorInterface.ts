
export interface MediaProcessorConnectorInterface {
    setTrack(track: MediaStreamTrack): Promise<MediaStreamTrack>;
    destroy(): Promise<void>;
}
