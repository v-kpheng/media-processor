/**
 * Check if the current browser is officially supported by the library.
 *
 * @returns The promise will resolve or reject depending whether the browser is supported or not.
 */
 export function isSupported(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if ((typeof MediaStreamTrackProcessor === 'undefined') || (typeof MediaStreamTrackGenerator === 'undefined')) {
            reject('Your browser does not support the MediaStreamTrack API for Insertable Streams of Media.');
        } else {
            resolve();
        }
    });
}
