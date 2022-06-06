# Vonage Media Processor Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.2.4  - 2022-06-06

### Added

- Insertable Streams pipeline emit start/end notification to the user

### Fixed

- NA

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA


## 1.2.3  - 2022-05-31

### Added

- add option to set proxy url when setting meta data.

### Fixed

- NA

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA



## 1.2.1  - 2022-03-31

### Added

- NA

### Fixed

- Re-names of functions:

  `getMetadata` -> `getVonageMetadata`
  
  `setMetadata` -> `setVonageMetadata`

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA

## 1.1.3  - 2022-03-31

### Added

- NA

### Fixed

- Expose funcion `getMetadata`.

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA

## 1.1.2  - 2022-03-31

### Added

- NA

### Fixed

- Fixes a bug where telemetry was sent out even when not using the `setMetadata` function.

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA

## 1.1.1  - 2022-03-14

### Added

- MediaProcessor implements an async event emitter pattern. for error and warn
- Allow the user of the API disable send/collect stats. by not setting meta data.

### Fixed

- Sending the error string to the error stats.

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA

## 1.0.0  - 2022-03-08

### Added

- First GA library version.

### Fixed

- NA

### Enhancements

- NA

### Changed

- NA

### Deprecated

- NA
