/**
 * Repair truncated module descriptions across the README (H1 tagline plus
 * the per-signature usage blurbs), docs/repl.txt (per-signature blurbs), and
 * package.json "description", using the clean text from
 * data/descriptions.generated.json (produced by bin/gen-descriptions.js).
 *
 * Only modules whose current README tagline is a truncated FRAGMENT (ends
 * at a colon or a dangling function word) are rewritten; complete
 * descriptions are left untouched. A module with no generated description
 * (e.g. not in routines.json) is reported and skipped.
 *
 * Usage:
 *   node bin/fix-descriptions.js --dry   # report what would change
 *   node bin/fix-descriptions.js         # apply
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve( import.meta.dirname, '..' );
const DRY = process.argv.includes( '--dry' );

const DESCS = JSON.parse( readFileSync( join( ROOT, 'data', 'descriptions.generated.json' ), 'utf8' ) );

// Lowercase words that leave a sentence obviously incomplete when trailing.
const FRAGMENT_WORDS = new Set( 'the of a an and or to with for when using by from into that as on in provides than such is are its their which'.split( ' ' ) );

const NDARRAY_SUFFIX = ', using alternative indexing semantics';

function tagline( readme ) {
	for ( const line of readme.split( '\n' ) ) {
		if ( line.startsWith( '> ' ) ) return line.slice( 2 ).trim();
	}
	return null;
}

function isFragment( tag ) {
	if ( !tag ) return false;
	const t = tag.replace( /\.\s*$/, '' ).trim();
	if ( t.endsWith( ':' ) ) return true;
	if ( /[`)\]]$/.test( t ) ) return false; // ends in an equation/bracket — complete
	const words = t.split( /\s+/ );
	const last = words[ words.length - 1 ].replace( /[`*_]/g, '' );
	if ( /^[A-Z]$/.test( last ) ) return false; // single matrix name — complete
	return FRAGMENT_WORDS.has( last.toLowerCase() );
}

// Word-wrap `text` to `width` columns, prefixing every line with `indent`.
function wrapText( text, indent, width ) {
	const words = text.split( /\s+/ );
	const out = [];
	let line = '';
	for ( const w of words ) {
		if ( line === '' ) line = w;
		else if ( ( indent + line + ' ' + w ).length <= width ) line += ' ' + w;
		else { out.push( indent + line ); line = w; }
	}
	if ( line ) out.push( indent + line );
	return out;
}

function listModules() {
	const mods = [];
	for ( const pkg of [ 'blas', 'lapack' ] ) {
		const base = join( ROOT, 'lib', pkg, 'base' );
		if ( !existsSync( base ) ) continue;
		for ( const e of readdirSync( base, { withFileTypes: true } ) ) {
			if ( e.isDirectory() ) mods.push( { pkg, name: e.name, dir: join( base, e.name ) } );
		}
	}
	return mods;
}

// --- surface rewriters ------------------------------------------------------

// README: the old fragment appears verbatim as a prefix in the tagline
// (`> frag.`), the layout blurb (`frag.`), and the ndarray blurb
// (`frag, using alternative indexing semantics.`). Replacing every literal
// occurrence of the fragment with the clean description fixes all of them.
function fixReadme( dir, oldFrag, desc ) {
	const p = join( dir, 'README.md' );
	if ( !existsSync( p ) ) return false;
	const src = readFileSync( p, 'utf8' );
	const out = src.split( oldFrag ).join( desc );
	if ( out === src ) return false;
	if ( !DRY ) writeFileSync( p, out );
	return true;
}

// repl.txt: replace the description block following each `{{alias}}...(`
// signature line (the block runs until the first blank line). The
// `.ndarray` signature's block gets the alternative-indexing suffix.
function fixRepl( dir, desc ) {
	const p = join( dir, 'docs', 'repl.txt' );
	if ( !existsSync( p ) ) return false;
	const src = readFileSync( p, 'utf8' );
	const lines = src.split( '\n' );
	const out = [];
	for ( let i = 0; i < lines.length; i++ ) {
		out.push( lines[ i ] );
		const m = lines[ i ].match( /^\{\{alias\}\}(\.ndarray)?\s*\(/ );
		if ( !m ) continue;
		const isNd = !!m[ 1 ];
		let j = i + 1;
		while ( j < lines.length && lines[ j ].trim() === '' ) { out.push( lines[ j ] ); j++; }
		const start = j;
		while ( j < lines.length && lines[ j ].trim() !== '' ) j++;
		if ( start >= lines.length ) continue;
		const indent = ( lines[ start ].match( /^(\s*)/ ) || [ '', '    ' ] )[ 1 ];
		const text = desc + ( isNd ? NDARRAY_SUFFIX : '' ) + '.';
		for ( const w of wrapText( text, indent, 76 ) ) out.push( w );
		i = j - 1; // resume after the replaced block
	}
	const result = out.join( '\n' );
	if ( result === src ) return false;
	if ( !DRY ) writeFileSync( p, result );
	return true;
}

function fixPackage( dir, desc ) {
	const p = join( dir, 'package.json' );
	if ( !existsSync( p ) ) return false;
	const src = readFileSync( p, 'utf8' );
	const pkg = JSON.parse( src );
	if ( pkg.description === desc ) return false;
	pkg.description = desc;
	if ( !DRY ) writeFileSync( p, JSON.stringify( pkg, null, 2 ) + '\n' );
	return true;
}

// --- run --------------------------------------------------------------------

let broken = 0, fixed = 0;
const noDesc = [];
const changes = [];
for ( const mod of listModules() ) {
	const readmePath = join( mod.dir, 'README.md' );
	if ( !existsSync( readmePath ) ) continue;
	const tag = tagline( readFileSync( readmePath, 'utf8' ) );
	if ( !isFragment( tag ) ) continue;
	broken++;
	const desc = DESCS[ mod.name.toLowerCase() ];
	if ( !desc ) { noDesc.push( mod.name ); continue; }
	const oldFrag = tag.replace( /\.\s*$/, '' );
	const a = fixReadme( mod.dir, oldFrag, desc );
	const b = fixRepl( mod.dir, desc );
	const c = fixPackage( mod.dir, desc );
	if ( a || b || c ) { fixed++; changes.push( mod.name + '  ->  ' + desc ); }
}

console.log( ( DRY ? '[dry] ' : '' ) + 'fragment taglines: ' + broken + ', fixed: ' + fixed + ', no generated description: ' + noDesc.length );
if ( noDesc.length ) console.log( 'NO DESCRIPTION (skipped): ' + noDesc.join( ', ' ) );
for ( const c of changes ) console.log( '  ' + c );
