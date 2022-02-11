import MediaProcessor from './src/core/MediaProcessor'
import MediaProcessorConnector from './src/core/MediaProcessorConnector';
import { supported } from './src/utils/utils';

export type { MediaProcessorConnectorInterface } from './src/core/MediaProcessorConnectorInterface'
export type { MediaProcessorInterface } from './src/core/MediaProcessorInterface'

export {
  MediaProcessor,
  MediaProcessorConnector,
  supported
}
