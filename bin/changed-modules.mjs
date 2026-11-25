#!/usr/bin/env node

/**
* Print the directory of each module changed since the merge-base with
* `origin/main` (or `--base <ref>`), one per line: the same selection the
* corpus gates make with `--changed`, for shell gates such as
* `bin/bench-smoke.sh --changed`. Exits 2 when the merge-base is missing.
*
* Usage:
*   node bin/changed-modules.mjs [--base <ref>]
*/

import path from 'node:path';
import { ROOT, moduleDir, selectRoutines } from './lib/corpus.mjs';

const argv = process.argv.slice( 2 );
const routines = selectRoutines( [ '--changed' ].concat( argv ), 'changed-modules' );
if ( routines === null ) {
	process.exit( 2 );
}
routines.forEach( ( r ) => console.log( path.relative( ROOT, moduleDir( r ) ) ) );
