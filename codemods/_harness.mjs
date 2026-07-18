/**
* Codemod harness.
*
* Provides a small, dependency-free runner shared by every dated migration in
* this directory. A migration is an ESM module that calls `run()` with a pure
* `transform( src, path ) -> string | null` function. The harness handles file
* discovery, CLI flags, dry-runs, path scoping, and reporting.
*
* Migrations are meant to be run against a clean (pre-migration) tree, inspected,
* `git reset --hard`'d, tweaked, and re-run. Keep transforms deterministic and
* idempotent (return `null` for files already in the target state) so a re-run on
* an already-migrated tree is a no-op.
*
* Usage (from a migration module):
*
*   import { run } from './_harness.mjs';
*   run({
*     name: 'cjs-to-esm',
*     roots: [ 'lib' ],
*     extensions: [ '.js' ],
*     transform( src, path ) { ... return newSrc or null; }
*   });
*
* CLI flags (parsed from process.argv):
*
*   --dry            Do not write; report what would change.
*   --limit N        Process at most N changed files (useful with --dry).
*   --print          Print transformed output of each changed file to stdout.
*   --diff           Print a compact before/after for each changed file.
*   <path-substr>... Positional args restrict to files whose path contains any
*                    given substring (e.g. `ddot` or `lib/blas/base/ddot`).
*/

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const IGNORE_DIRS = new Set([ 'node_modules', '.git', 'dist', 'data', 'codemods' ]);

function walk( dir, extensions, out ) {
	let entries;
	try {
		entries = readdirSync( dir, { withFileTypes: true });
	} catch {
		return out;
	}
	for ( const e of entries ) {
		if ( e.isDirectory() ) {
			if ( IGNORE_DIRS.has( e.name ) ) continue;
			walk( join( dir, e.name ), extensions, out );
		} else if ( e.isFile() && extensions.includes( extname( e.name ) ) ) {
			out.push( join( dir, e.name ) );
		}
	}
	return out;
}

function parseArgs( argv ) {
	const opts = { dry: false, limit: Infinity, print: false, diff: false, filters: [] };
	for ( let i = 0; i < argv.length; i++ ) {
		const a = argv[ i ];
		if ( a === '--dry' ) opts.dry = true;
		else if ( a === '--print' ) opts.print = true;
		else if ( a === '--diff' ) opts.diff = true;
		else if ( a === '--limit' ) opts.limit = Number( argv[ ++i ] );
		else if ( a.startsWith( '--' ) ) throw new Error( `unknown flag: ${a}` );
		else opts.filters.push( a );
	}
	return opts;
}

function firstDiff( before, after ) {
	const a = before.split( '\n' );
	const b = after.split( '\n' );
	const lines = [];
	const max = Math.max( a.length, b.length );
	let shown = 0;
	for ( let i = 0; i < max && shown < 12; i++ ) {
		if ( a[ i ] !== b[ i ] ) {
			if ( a[ i ] !== undefined ) lines.push( `  - ${a[ i ]}` );
			if ( b[ i ] !== undefined ) lines.push( `  + ${b[ i ]}` );
			shown++;
		}
	}
	return lines.join( '\n' );
}

/**
* Run a migration.
*
* @param {Object} cfg
* @param {string} cfg.name - migration name (for logging)
* @param {string[]} cfg.roots - directories to walk (relative to cwd)
* @param {string[]} cfg.extensions - file extensions to consider (e.g. ['.js'])
* @param {Function} cfg.transform - (src, path) => string|null
*/
export function run({ name, roots, extensions, transform }) {
	const opts = parseArgs( process.argv.slice( 2 ) );
	const cwd = process.cwd();

	let files = [];
	for ( const r of roots ) walk( join( cwd, r ), extensions, files );
	files = files.map( ( f ) => relative( cwd, f ) ).sort();
	if ( opts.filters.length ) {
		files = files.filter( ( f ) => opts.filters.some( ( s ) => f.includes( s ) ) );
	}

	let scanned = 0;
	let changed = 0;
	let written = 0;
	let errors = 0;

	for ( const file of files ) {
		if ( changed >= opts.limit ) break;
		scanned++;
		let src;
		try {
			src = readFileSync( file, 'utf8' );
		} catch ( err ) {
			console.error( `READ ERROR ${file}: ${err.message}` );
			errors++;
			continue;
		}
		let out;
		try {
			out = transform( src, file );
		} catch ( err ) {
			console.error( `TRANSFORM ERROR ${file}: ${err.message}` );
			errors++;
			continue;
		}
		if ( out == null || out === src ) continue;
		changed++;
		if ( opts.print ) {
			console.log( `\n===== ${file} =====` );
			console.log( out );
		} else if ( opts.diff || opts.dry ) {
			console.log( `\n~ ${file}` );
			console.log( firstDiff( src, out ) );
		}
		if ( !opts.dry ) {
			writeFileSync( file, out );
			written++;
		}
	}

	console.log( `\n[${name}] scanned=${scanned} changed=${changed} written=${written} errors=${errors}${opts.dry ? ' (dry-run)' : ''}` );
	if ( errors ) process.exitCode = 1;
}
