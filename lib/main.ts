import { isSupported } from './src/utils/utils';
import MediaProcessor from './src/core/MediaProcessor'
import MediaProcessorConnector from './src/core/MediaProcessorConnector';
import { getVonageMetadata, setVonageMetadata } from './src/telemetry/Reporter';

export type { MediaProcessorConnectorInterface } from './src/core/MediaProcessorConnectorInterface'
export type { MediaProcessorInterface } from './src/core/MediaProcessorInterface'
export type { VonageMetadata, VonageSourceType } from './src/telemetry/Reporter'
export type { EventDataMap, WarnData, ErrorData, ErrorFunction, EventMetaData } from './src/core/pipeline'

export {
  isSupported,
  MediaProcessor,
  MediaProcessorConnector,
  getVonageMetadata,
  setVonageMetadata
}
