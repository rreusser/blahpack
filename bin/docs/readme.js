/**
* Generates each module's README.md from the same documentation model as the
* API reference site (bin/docs/extract.js): the module JSDoc (summary,
* extended description, `## Notes`, examples), `spec/<routine>.json`
* (parameter intents, shapes, checks, the reference's per-argument docs),
* `data/fortran-routine-docs.json` (the reference's routine-level notes) and
* `examples/index.js`. A README is a pure function of those committed inputs,
* so it is never edited by hand: change the JSDoc or the spec and regenerate.
*
* Usage:
*   node bin/docs/readme.js --all                 # write every module README
*   node bin/docs/readme.js lib/lapack/zggev # write one
*   node bin/docs/readme.js --all --check         # CI: fail if any README differs
*
* @module bin/docs/readme
*/

import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { extractAll, ROOT, PACKAGE_JSON } from './extract.js';
import { routineReadme } from './render/routine.js';

function main() {
	const args = process.argv.slice( 2 );
	const check = args.includes( '--check' );
	const all = args.includes( '--all' );
	const only = args.filter( ( a ) => !a.startsWith( '--' ) ).map( ( a ) => relative( ROOT, resolve( a ) ).replace( /\/$/, '' ) );
	if ( !all && !only.length ) {
		console.error( 'usage: node bin/docs/readme.js [--check] (--all | <module-dir>...)' );
		process.exit( 2 );
	}
	// Every routine, even for one README: the See also links need the whole call graph.
	const routines = extractAll();
	const byName = new Map( routines.map( ( r ) => [ r.name, r ] ) );
	const ctx = { byName, 'packageName': PACKAGE_JSON.name };
	const targets = all ? routines : routines.filter( ( r ) => only.includes( r.path ) );
	if ( !all && targets.length !== only.length ) {
		const found = new Set( targets.map( ( r ) => r.path ) );
		console.error( 'not a module: ' + only.filter( ( p ) => !found.has( p ) ).join( ', ' ) );
		process.exit( 2 );
	}
	const stale = [];
	let written = 0;
	for ( const r of targets ) {
		const file = join( ROOT, r.path, 'README.md' );
		const md = routineReadme( r, ctx );
		let before = null;
		try {
			before = readFileSync( file, 'utf8' );
		} catch ( err ) {
			before = null;
		}
		if ( before === md ) {
			continue;
		}
		if ( check ) {
			stale.push( r.path );
		} else {
			writeFileSync( file, md );
			written += 1;
		}
	}
	if ( check ) {
		if ( stale.length ) {
			console.error( stale.length + ' README.md files differ from what the code generates:\n  ' + stale.slice( 0, 20 ).join( '\n  ' ) + ( stale.length > 20 ? '\n  …' : '' ) + '\nRegenerate: node bin/docs/readme.js --all' );
			process.exit( 1 );
		}
		console.log( 'readme: ' + targets.length + ' README.md files in sync with the code' );
		return;
	}
	console.log( 'readme: ' + written + ' written, ' + ( targets.length - written ) + ' unchanged' );
}

main();
