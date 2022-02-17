import { isSupported } from './src/utils/utils';
import MediaProcessor from './src/core/MediaProcessor'
import MediaProcessorConnector from './src/core/MediaProcessorConnector';
import { setMetadata } from './src/telemetry/Reporter';

export type { MediaProcessorConnectorInterface } from './src/core/MediaProcessorConnectorInterface'
export type { MediaProcessorInterface } from './src/core/MediaProcessorInterface'
export type { VonageMetadata, VonageSourceType } from './src/telemetry/Reporter'

export {
  isSupported,
  MediaProcessor,
  MediaProcessorConnector,
  setMetadata
}
