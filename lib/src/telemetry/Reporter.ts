import * as pack from './../../../package.json';
import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from 'axios';
import { Optional } from 'typescript-optional';

const getTelemetryServerUrl = (isDev: boolean): string => {
  return isDev ? pack.default.telemetryServerUrls.dev : pack.default.telemetryServerUrls.pro;
}

interface Report {
  action: Optional<string>;
  applicationId: Optional<string>; // TODO(jaoo)
  timestamp: number;
  fps: Optional<number>;
  framesTransformed: Optional<number>;
  guid: Optional<string>;
  highestFrameTransformCpu: Optional<number>; // TODO(jaoo)
  message: Optional<string>;
  source: Optional<string>; // TODO(jaoo)
  transformedFps: Optional<number>;
  transformerType: Optional<string>;
  variation: Optional<string>;
}

class ReportBuilder {
  private readonly _report: Report;

  constructor() {
    this._report = {
      action: Optional.empty<string>(),
      applicationId: Optional.empty<string>(),
      timestamp: Date.now(),
      fps: Optional.empty<number>(),
      framesTransformed: Optional.empty<number>(),
      guid: Optional.empty<string>(),
      highestFrameTransformCpu: Optional.empty<number>(),
      message: Optional.empty<string>(),
      source: Optional.empty<string>(),
      transformedFps: Optional.empty<number>(),
      transformerType: Optional.empty<string>(),
      variation: Optional.empty<string>()
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
            let devTelemetryEnvironment: boolean = (pack.default.telemetryEnvironment === 'dev');
            axiosInstance.post(getTelemetryServerUrl(devTelemetryEnvironment), serializeReport(report), config)
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
