export function isSupported(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        if ((typeof MediaStreamTrackProcessor === 'undefined') || (typeof MediaStreamTrackGenerator === 'undefined')) {
            reject('Your browser does not support the experimental MediaStreamTrack API for Insertable Streams of Media.');
        } else {
            resolve();
        }
    });
}
