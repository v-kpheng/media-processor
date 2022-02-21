'use strict';

const fs = require('fs');
const pkg = require('../package.json');

fs.writeFileSync('./lib/src/utils/package-json.ts', `\
// This file is generated on build. To make changes, see scripts/package-json.js

/**
 * The current version of the library.
 */
export const version: string = '${pkg.version}';
export const telemetryEnvironmentUrl: string = '${pkg.telemetryServerUrls[pkg.telemetryEnvironment]}';
`);
