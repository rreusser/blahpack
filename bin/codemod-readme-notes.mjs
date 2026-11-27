/**
* One-time migration (ticket 0037): moves the hand-written prose of each module
* README into the module JSDoc of `lib/index.js`, so the README can be
* generated from the code (bin/docs/readme.js) without losing it.
*
* - `<section class="intro">` text becomes extra paragraphs of the module
*   description, after its summary sentence.
* - `<section class="notes">` bullets, minus the generated "corresponds to the
*   LAPACK routine" line, go under a `## Notes` heading in that description.
*
* Reference-style links (`[x][ref]`), whose definitions live in the README's
* links section, become their text. Idempotent: a module whose index.js
* already has `## Notes` (or the intro text) is skipped.
*
* Usage:
*   node bin/codemod-readme-notes.mjs [--dry-run]
*
* @module bin/codemod-readme-notes
*/

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve( import.meta.dirname, '..' );
const DRY = process.argv.includes( '--dry-run' );

function section( readme, cls ) {
	const m = readme.match( new RegExp( '<section class="' + cls + '">([\\s\\S]*?)</section>' ) );
	if ( !m ) {
		return [];
	}
	const lines = m[ 1 ].split( '\n' );
	while ( lines.length && !lines[ 0 ].trim() ) {
		lines.shift();
	}
	while ( lines.length && !lines[ lines.length - 1 ].trim() ) {
		lines.pop();
	}
	return lines;
}

// Drops the heading and the generated "corresponds to" bullet (with its continuation lines).
function notesOf( lines ) {
	const out = [];
	let skip = false;
	for ( const l of lines ) {
		if ( /^##\s/.test( l ) ) {
			continue;
		}
		if ( /^-\s/.test( l ) ) {
			skip = /corresponds to the \[?(LAPACK|BLAS)/i.test( l );
		}
		if ( !skip ) {
			out.push( l );
		}
	}
	while ( out.length && !out[ 0 ].trim() ) {
		out.shift();
	}
	while ( out.length && !out[ out.length - 1 ].trim() ) {
		out.pop();
	}
	return out;
}

function unlink( lines ) {
	return lines.map( ( l ) => l.replace( /\[([^\]]+)\]\[[^\]]+\]/g, '$1' ) );
}

function jsdocLines( lines ) {
	return lines.map( ( l ) => ( l.trim() ? '* ' + l.replace( /\*\//g, '*\\/' ) : '*' ) );
}

let moved = 0;
let skipped = 0;
for ( const pkg of readdirSync( join( ROOT, 'lib' ) ) ) {
	const base = join( ROOT, 'lib', pkg );
	if ( !statSync( base ).isDirectory() ) {
		continue;
	}
	for ( const r of readdirSync( base ).sort() ) {
		const readmeFile = join( base, r, 'README.md' );
		const indexFile = join( base, r, 'lib', 'index.js' );
		if ( !existsSync( readmeFile ) || !existsSync( indexFile ) ) {
			continue;
		}
		const readme = readFileSync( readmeFile, 'utf8' );
		const intro = unlink( section( readme, 'intro' ) );
		const notes = unlink( notesOf( section( readme, 'notes' ) ) );
		if ( !intro.length && !notes.length ) {
			continue;
		}
		const src = readFileSync( indexFile, 'utf8' );
		if ( /^\* ## Notes$/m.test( src ) || ( intro.length && src.includes( intro[ 0 ].trim() ) ) ) {
			skipped += 1;
			continue;
		}
		// The module block: the first JSDoc block with @module.
		const m = src.match( /\/\*\*(?:(?!\*\/)[\s\S])*?\n\* @module[^\n]*\n/ );
		if ( !m ) {
			console.error( 'no @module block: ' + indexFile );
			continue;
		}
		const block = m[ 0 ];
		const add = [];
		if ( intro.length ) {
			add.push( ...jsdocLines( intro ), '*' );
		}
		if ( notes.length ) {
			add.push( '* ## Notes', '*', ...jsdocLines( notes ), '*' );
		}
		const updated = block.replace( /\n\* @module/, '\n' + add.join( '\n' ) + '\n* @module' );
		if ( !DRY ) {
			writeFileSync( indexFile, src.replace( block, updated ) );
		}
		moved += 1;
	}
}
console.error( ( DRY ? '[dry run] ' : '' ) + 'moved README prose into lib/index.js for ' + moved + ' modules (' + skipped + ' already done)' );
