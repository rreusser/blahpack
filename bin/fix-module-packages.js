/**
 * Rewrite per-module package.json files with correct project metadata.
 *
 * The module scaffolds were copied from stdlib-js and carried stdlib's
 * identity (name `@stdlib/...`, author "The Stdlib Authors", stdlib
 * repository/homepage/bugs URLs, Apache-2.0). These files ship in the
 * npm tarball, so they must describe THIS project.
 *
 * Keeps each module's own description and routine-specific keywords
 * (minus stdlib branding), drops legacy fields (engines, os,
 * directories, contributors, empty scripts/deps).
 *
 * Idempotent. Usage:
 *   node bin/fix-module-packages.js         # rewrite files
 *   node bin/fix-module-packages.js --dry   # report only
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve( import.meta.dirname, '..' );
const DRY = process.argv.includes( '--dry' );

const rootPkg = JSON.parse( readFileSync( join( ROOT, 'package.json' ), 'utf8' ) );
const DROP_KEYWORDS = new Set( [ 'stdlib', 'stdmath' ] );

function rewrite( pkgDir, pkg, routine ) {
	const pkgPath = join( pkgDir, 'package.json' );
	if ( !existsSync( pkgPath ) ) return false;
	const before = readFileSync( pkgPath, 'utf8' );
	const old = JSON.parse( before );

	const next = {
		name: `${rootPkg.name}/${pkg}/base/${routine}`,
		version: rootPkg.version,
		description: old.description || '',
		license: 'MIT',
		author: {
			name: 'Ricky Reusser',
			url: 'https://github.com/rreusser'
		},
		type: 'module',
		main: './lib/index.js',
		types: './docs/types',
		repository: {
			type: 'git',
			url: 'git+https://github.com/rreusser/blahpack.git'
		},
		homepage: 'https://github.com/rreusser/blahpack',
		bugs: {
			url: 'https://github.com/rreusser/blahpack/issues'
		},
		keywords: ( old.keywords || [] ).filter( ( k ) => !DROP_KEYWORDS.has( k ) )
	};

	const after = JSON.stringify( next, null, 2 ) + '\n';
	if ( after === before ) return false;
	if ( !DRY ) writeFileSync( pkgPath, after );
	return true;
}

let changed = 0;
let total = 0;
for ( const pkg of [ 'blas', 'lapack' ] ) {
	const base = join( ROOT, 'lib', pkg, 'base' );
	if ( !existsSync( base ) ) continue;
	for ( const entry of readdirSync( base, { withFileTypes: true } ) ) {
		if ( !entry.isDirectory() ) continue;
		total += 1;
		if ( rewrite( join( base, entry.name ), pkg, entry.name ) ) changed += 1;
	}
}

console.log( `${DRY ? '[dry] ' : ''}${changed} of ${total} module package.json files ${DRY ? 'would be' : ''} updated` );
