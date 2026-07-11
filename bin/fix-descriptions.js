/**
 * Repair truncated module descriptions across the README (H1 tagline plus
 * the per-signature usage blurbs), docs/repl.txt (per-signature blurbs), and
 * package.json "description", using the clean text from
 * data/descriptions.generated.json (produced by bin/gen-descriptions.js).
 *
 * A module's committed description is TRUNCATED when the README tagline is a
 * proper prefix of the module's own JSDoc summary paragraph — i.e. the
 * generator kept only the first physical line of a multi-line summary. This
 * catches every mid-sentence cut (at a colon, a dangling preposition, or a
 * dangling adjective like "using partial" / "a real symmetric") regardless
 * of wording, because the tagline was derived from that very paragraph.
 * Complete descriptions (tagline == the whole paragraph, or already equal to
 * the clean text) are left untouched.
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

const NDARRAY_SUFFIX = ', using alternative indexing semantics';

function norm( s ) {
	return ( s || '' ).toLowerCase().replace( /[^a-z0-9]/g, '' );
}

function tagline( readme ) {
	for ( const line of readme.split( '\n' ) ) {
		if ( line.startsWith( '> ' ) ) return line.slice( 2 ).trim();
	}
	return null;
}

// Collapse the first JSDoc summary paragraph (the block that is NOT the
// license header) to a single line: the run of `* ...` lines from the first
// prose line until a blank `*`, an `* @tag`, or a `* ##` heading.
function summaryParagraph( content ) {
	if ( !content ) return '';
	const blocks = content.match( /\/\*\*[\s\S]*?\*\//g ) || [];
	for ( const b of blocks ) {
		if ( /@license/.test( b ) ) continue;
		const lines = b.split( '\n' );
		const prose = [];
		for ( const raw of lines ) {
			const m = raw.match( /^\s*\*\s?(.*)$/ );
			if ( !m ) continue;
			const text = m[ 1 ].trim();
			if ( text === '' && prose.length ) break;      // blank * ends paragraph
			if ( text === '' ) continue;                    // leading blanks
			if ( text.startsWith( '@' ) ) break;            // @tag ends it
			if ( text.startsWith( '#' ) || text.startsWith( '/' ) ) break;
			prose.push( text );
		}
		if ( prose.length ) return prose.join( ' ' ).replace( /\s+/g, ' ' ).trim();
	}
	return '';
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

function fixReadme( dir, oldFrag, desc ) {
	const p = join( dir, 'README.md' );
	if ( !existsSync( p ) ) return false;
	const src = readFileSync( p, 'utf8' );
	const out = src.split( oldFrag ).join( desc );
	if ( out === src ) return false;
	if ( !DRY ) writeFileSync( p, out );
	return true;
}

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
		i = j - 1;
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

let truncated = 0, fixed = 0;
const noDesc = [];
const changes = [];
for ( const mod of listModules() ) {
	const readmePath = join( mod.dir, 'README.md' );
	if ( !existsSync( readmePath ) ) continue;
	const tag = tagline( readFileSync( readmePath, 'utf8' ) );
	if ( !tag ) continue;
	const desc = DESCS[ mod.name.toLowerCase() ];
	const tStripped = tag.replace( /\.\s*$/, '' );
	const nTag = norm( tStripped );

	// Already equal to the clean target — nothing to do.
	if ( desc && nTag === norm( desc ) ) continue;

	// Detect truncation: tagline is a proper prefix of the module's own
	// JSDoc summary paragraph, or ends at a colon.
	const baseC = existsSync( join( mod.dir, 'lib', 'base.js' ) ) ? readFileSync( join( mod.dir, 'lib', 'base.js' ), 'utf8' ) : '';
	const ndC = existsSync( join( mod.dir, 'lib', 'ndarray.js' ) ) ? readFileSync( join( mod.dir, 'lib', 'ndarray.js' ), 'utf8' ) : '';
	const para = norm( summaryParagraph( ndC ) ) || norm( summaryParagraph( baseC ) );
	const isPrefixOfPara = para && para.length > nTag.length && para.startsWith( nTag );
	const endsColon = tStripped.endsWith( ':' );
	const isPrefixOfClean = desc && norm( desc ).length > nTag.length && norm( desc ).startsWith( nTag );

	if ( !( isPrefixOfPara || endsColon || isPrefixOfClean ) ) continue;
	truncated++;
	if ( !desc ) { noDesc.push( mod.name ); continue; }

	const a = fixReadme( mod.dir, tStripped, desc );
	const b = fixRepl( mod.dir, desc );
	const c = fixPackage( mod.dir, desc );
	if ( a || b || c ) { fixed++; changes.push( mod.name + '  ->  ' + desc ); }
}

console.log( ( DRY ? '[dry] ' : '' ) + 'truncated descriptions: ' + truncated + ', fixed: ' + fixed + ', no generated description: ' + noDesc.length );
if ( noDesc.length ) console.log( 'NO DESCRIPTION (skipped): ' + noDesc.join( ', ' ) );
for ( const c of changes ) console.log( '  ' + c );
