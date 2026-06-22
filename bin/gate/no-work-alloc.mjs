/**
 * Gate check: no internal work-vector allocation.
 *
 * Workspace arrays (WORK, RWORK, IWORK) must always be provided by the caller.
 * Modules must never allocate them internally. The only permitted internal
 * allocations are named scalar-factor matrices (T, T1, T2) used for block
 * reflectors, which are genuinely implementation-private scratch.
 *
 * This check walks every lib/**\/lib\/*.js file (excluding test/, bench/,
 * examples/) and flags any line that:
 *   - Contains `new Float64Array(`, `new Complex128Array(`, or `new Int32Array(`
 *   - Is executable code (not inside a JSDoc comment block)
 *   - Is NOT assigning to one of the permitted T-matrix names (T, T1, T2, etc.)
 *   - Is NOT a `var` declaration for A, B, C, or other data matrices
 *     (only flagged when the LHS looks like WORK/work/RWORK/rwork/IWORK/iwork)
 *
 * Usage (called by gate.js):
 *   import { check } from './gate/no-work-alloc.js';
 *   const violations = check( modulePath );  // returns array of { file, line, text }
 *
 * Standalone:
 *   node bin/gate/no-work-alloc.js [path-filter]
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

const ROOT = new URL( '../../', import.meta.url ).pathname.replace( /\/$/, '' );

// Permitted LHS patterns — block-reflector T matrices are legitimately internal.
const PERMITTED_LHS = /^[ \t]*(?:var\s+)?T\d*\s*=/;

// Work-array LHS patterns we want to flag.
// Matches: WORK =, work =, RWORK =, rwork =, IWORK =, iwork =
// and their var declarations: var WORK =, var work =, etc.
const WORK_LHS = /(?:^|[\s(,])(?:var\s+)?([A-Z]*[Ww][Oo][Rr][Kk]\d*)\s*=/;

// Typed array constructors we care about.
const ALLOC_RE = /new (?:Float64Array|Complex128Array|Int32Array|Float32Array|Complex64Array)\s*\(/;

const SKIP_DIRS = new Set([ 'node_modules', '.git', 'test', 'bench', 'examples', 'data', 'codemods' ]);

function walk( dir, out ) {
	let entries;
	try { entries = readdirSync( dir, { withFileTypes: true } ); } catch { return; }
	for ( const e of entries ) {
		if ( e.isDirectory() ) {
			if ( SKIP_DIRS.has( e.name ) ) continue;
			walk( join( dir, e.name ), out );
		} else if ( e.isFile() && extname( e.name ) === '.js' ) {
			out.push( join( dir, e.name ) );
		}
	}
}

/**
 * Check a single file for work-allocation violations.
 * Returns array of { file, lineNo, text } objects.
 */
function checkFile( absPath ) {
	let src;
	try { src = readFileSync( absPath, 'utf8' ); } catch { return []; }

	const violations = [];
	const lines = src.split( '\n' );
	let inJsDoc = false;

	for ( let i = 0; i < lines.length; i++ ) {
		const line = lines[ i ];
		const trimmed = line.trim();

		// Track JSDoc comment blocks.
		if ( trimmed.startsWith( '/**' ) ) { inJsDoc = true; }
		if ( inJsDoc ) {
			if ( trimmed.includes( '*/' ) ) inJsDoc = false;
			continue;
		}
		// Skip single-line comments.
		if ( trimmed.startsWith( '//' ) || trimmed.startsWith( '*' ) ) continue;

		if ( !ALLOC_RE.test( line ) ) continue;

		// Permit T-matrix allocations.
		if ( PERMITTED_LHS.test( line ) ) continue;

		// Only flag lines where a work-named variable is being assigned.
		if ( WORK_LHS.test( line ) ) {
			violations.push({ file: absPath, lineNo: i + 1, text: line.trimEnd() });
		}
	}
	return violations;
}

/**
 * Check all lib files under the given module path (or whole repo if omitted).
 */
export function check( modulePath ) {
	const searchRoot = modulePath
		? join( ROOT, modulePath )
		: join( ROOT, 'lib' );
	const files = [];
	walk( searchRoot, files );
	return files.flatMap( checkFile );
}

// --- Standalone CLI ---
if ( process.argv[1].endsWith( 'no-work-alloc.js' ) ) {
	const filter = process.argv[2] || '';
	const violations = check( filter ? `lib/${filter}` : null );
	if ( !violations.length ) {
		console.log( 'no-work-alloc: OK' );
		process.exit( 0 );
	}
	for ( const v of violations ) {
		console.log( `${relative( ROOT, v.file )}:${v.lineNo}: ${v.text}` );
	}
	console.log( `\nno-work-alloc: ${violations.length} violation(s)` );
	process.exit( 1 );
}
