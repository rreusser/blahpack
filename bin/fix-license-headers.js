/**
 * Standardize license headers across all shipped module source files.
 *
 * For each lib/{blas,lapack}/base/<routine>/lib/*.js:
 *   - Removes stray translator-attribution line comments
 *     (`// Copyright (c) 20xx Ricky Reusser. ...`)
 *   - Replaces any leading `@license` block comment with the MIT header
 *   - Inserts the MIT header when no license block exists
 *   - Preserves an existing "Derived from ..." attribution line, or
 *     synthesizes one from the package (BLAS vs LAPACK)
 *
 * Idempotent: re-running on conformant files is a no-op.
 *
 * Usage:
 *   node bin/fix-license-headers.js         # rewrite files
 *   node bin/fix-license-headers.js --dry   # report only
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve( import.meta.dirname, '..' );
const DRY = process.argv.includes( '--dry' );

const STRAY_RE = /^[ \t]*\/\/ Copyright \(c\) \d{4} Ricky Reusser\..*\r?\n/gm;
const DERIVED_RE = /^\*?\s*(Derived from .+?)\s*$/m;

const UPSTREAM = {
	blas: 'Derived from the BLAS 3.12.0 reference implementation (BSD-3-Clause).',
	lapack: 'Derived from the LAPACK 3.12.0 reference implementation (BSD-3-Clause).'
};

function header( derivedLine ) {
	return [
		'/**',
		'* @license MIT',
		'*',
		'* Copyright (c) 2026 Ricky Reusser.',
		'*',
		'* ' + derivedLine,
		'* See LICENSE.txt in the repository root for the full license text and',
		'* upstream attribution.',
		'*/'
	].join( '\n' );
}

function processFile( path, pkg ) {
	const src = readFileSync( path, 'utf8' );
	let out = src.replace( STRAY_RE, '' );

	// Leading block comment containing @license → replace; otherwise insert.
	const lead = out.match( /^\/\*\*[\s\S]*?\*\// );
	let derived = UPSTREAM[ pkg ];
	if ( lead && /@license/.test( lead[ 0 ] ) ) {
		const m = lead[ 0 ].match( DERIVED_RE );
		if ( m ) derived = m[ 1 ];
		out = header( derived ) + out.slice( lead[ 0 ].length );
	} else {
		out = header( derived ) + '\n\n' + out.replace( /^\s*\n/, '' );
	}

	if ( out === src ) return false;
	if ( !DRY ) writeFileSync( path, out );
	return true;
}

let changed = 0;
let total = 0;
for ( const pkg of [ 'blas', 'lapack' ] ) {
	const base = join( ROOT, 'lib', pkg, 'base' );
	if ( !existsSync( base ) ) continue;
	for ( const entry of readdirSync( base, { withFileTypes: true } ) ) {
		if ( !entry.isDirectory() ) continue;
		const libDir = join( base, entry.name, 'lib' );
		if ( !existsSync( libDir ) ) continue;
		for ( const f of readdirSync( libDir ) ) {
			if ( !f.endsWith( '.js' ) ) continue;
			total += 1;
			if ( processFile( join( libDir, f ), pkg ) ) changed += 1;
		}
	}
}

console.log( `${DRY ? '[dry] ' : ''}${changed} of ${total} files ${DRY ? 'would be' : ''} updated` );
