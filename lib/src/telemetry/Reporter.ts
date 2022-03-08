import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { Optional } from 'typescript-optional';
import { version } from '../utils/package-json';

export type VonageSourceType = 'automation' | 'test' | 'vbc' | 'video' | 'voice';

/**
 * Specifies the addional information being sent with the telemetry collected by the library.
 */
 export type VonageMetadata = {
   /**
    * Type of source using the library.
    */
  sourceType: VonageSourceType,
   /**
    * Some string identifier identifying the application using the library.
    */
    appId: string
}

let _metadata: VonageMetadata;

/**
 * Sets some metadata for telemetry.
 *
 * @param metadata Specifies the addional information being sent with the telemetry collected by the library.
 *
 * @example
 *
 * ```ts
 *   const metadata: VonageMetadata = {
 *     appId: 'vonage-media-processor-example',
 *     sourceType: 'test'
 *   };
 *   setMetadata(metadata);
 * ```
 */
export function setMetadata(metadata: VonageMetadata): void {
  _metadata = metadata;
}

function getMetadata(): VonageMetadata {
  return _metadata;
}

interface Report {
  action: Optional<string>;
  applicationId: Optional<string>;
  timestamp: number;
  fps: Optional<number>;
  framesTransformed: Optional<number>;
  guid: Optional<string>;
  highestFrameTransformCpu: Optional<number>; // TODO(jaoo)
  message: Optional<string>;
  source: Optional<string>;
  transformedFps: Optional<number>;
  transformerType: Optional<string>;
  variation: Optional<string>;
  videoHeight: Optional<number>;
  videoWidth: Optional<number>;
  version: string;
}

class ReportBuilder {
  private readonly _report: Report;

  constructor() {
    const metadata: VonageMetadata = getMetadata();
    this._report = {
      action: Optional.empty<string>(),
      applicationId: Optional.ofNullable((metadata !== undefined) ? metadata.appId : null),
      timestamp: Date.now(),
      fps: Optional.empty<number>(),
      framesTransformed: Optional.empty<number>(),
      guid: Optional.empty<string>(),
      highestFrameTransformCpu: Optional.empty<number>(),
      message: Optional.empty<string>(),
      source: Optional.ofNullable((metadata !== undefined) ? metadata.sourceType : null),
      transformedFps: Optional.empty<number>(),
      transformerType: Optional.empty<string>(),
      variation: Optional.empty<string>(),
      videoHeight: Optional.empty<number>(),
      videoWidth: Optional.empty<number>(),
      version: version
    };
  }

  action(action: string) {
    this._report.action = Optional.ofNullable(action);
    return this;
  }

  framesTransformed(framesTransformed: number) {
    this._report.framesTransformed = Optional.ofNullable(framesTransformed);
    return this;
  }

  fps(fps: number) {
    this._report.fps = Optional.ofNullable(fps);
    return this;
  }

  guid(guid: string) {
    this._report.guid = Optional.ofNullable(guid);
    return this;
  }

  message(message: string) {
    this._report.message = Optional.ofNullable(message);
    return this;
  }

  transformedFps(transformedFps: number) {
    this._report.transformedFps = Optional.ofNullable(transformedFps);
    return this;
  }

  transformerType(transformerType: string) {
    this._report.transformerType = Optional.ofNullable(transformerType);
    return this;
  }

  variation(variation: string) {
    this._report.variation = Optional.ofNullable(variation);
    return this;
  }

  videoHeight(videoHeight: number) {
    this._report.videoHeight = Optional.ofNullable(videoHeight);
    return this;
  }

  videoWidth(videoWidth: number) {
    this._report.videoWidth = Optional.ofNullable(videoWidth);
    return this;
  }

  build(): Report {
    return this._report;
  }
}

const serializeReport = (report: Report): string => {
  return JSON.stringify(report, (key, value) => {
    if (value !== null) return value
  });
}

class Reporter {
    static report(report: Report): Promise<any>{
        return new Promise<any>((resolve, reject) => {
            let axiosInstance: AxiosInstance = axios.create()
            let config: AxiosRequestConfig = {
                timeout: 10000,
                timeoutErrorMessage: "Request timeout",
                headers: {
                     'Content-Type': 'application/json'
                }
            }
            // @ts-ignore
            const telemetryServerUrl: string = import.meta.env.VITE_TELEMETRY_SERVER_URL ?? 'https://hlg.tokbox.com/prod/logging/vcp_webrtc';
            axiosInstance.post(telemetryServerUrl, serializeReport(report), config)
            .then((res: AxiosResponse) => {
                console.log(res);
                resolve('success')
            })
            .catch(e => {
                console.log(e);
                reject(e)
            })
        });
    }
}

export {
  Report,
  ReportBuilder,
  Reporter
}
