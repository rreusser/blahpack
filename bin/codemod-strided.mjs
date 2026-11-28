#!/usr/bin/env node

/**
* Codemod: rename the offset form (data, strides, offsets) from `ndarray` to
* `strided` (ticket 0126; docs/ndarray-layer.md, "Migration plan", step 4).
*
* "ndarray" is kept for stdlib ndarray objects, which the opt-in
* `<pkg>/<routine>/ndarray` form will take. The tooling already called the
* `<routine>.js` form `strided`; that name becomes `wrapper`, the word the
* repository already uses for it (wrapper-replay, CONVENTIONS D5c).
*
* What changes:
*   files      lib/ndarray.js, test/test.ndarray.js, benchmark/benchmark.ndarray.js
*              in every module become strided.js / test.strided.js /
*              benchmark.strided.js; other tracked paths with an `ndarray` segment
*              (lint rule wrapper-calls-ndarray, …) are renamed the same way
*   module JS  every identifier `ndarray` (always the module's own offset form:
*              nothing in lib/ imports @stdlib/ndarray), the `'ndarray'` property
*              string, and in strings, templates, regexes and comments: paths
*              (ndarray.js), members (.ndarray) and the word
*   tooling JS the same, with `strided` -> `wrapper` applied simultaneously to
*              identifiers and form-name strings; camelCase `…Ndarray` -> `…Strided`
*   other text paths, members and the word, in every text file (Markdown
*              included: there the word almost always names the offset form;
*              --report lists what remains for review)
*
* Never rewritten: stdlib's own `ndarray` (`@stdlib/ndarray/…`, `ndarray-like`,
* ndarray objects, plurals), tickets/ (history), DIFFERENCES.md (comparisons
* with stdlib's API), docs/ndarray-layer.md (about ndarray objects; edited by
* hand). Rerunning is a no-op; --check fails while anything still uses the old
* names.
*
* Usage:
*   node bin/codemod-strided.mjs [--dry] --all
*   node bin/codemod-strided.mjs [--dry] --only zggev,ddot     prototype (module files only)
*   node bin/codemod-strided.mjs --report | --check
*/

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire( import.meta.url );
const espree = require( 'espree' );

const ROOT = path.resolve( import.meta.dirname, '..' );
const PKGS = [ 'blas', 'lapack', 'arpack' ];
const argv = process.argv.slice( 2 );
const flag = ( n ) => argv.includes( n );
const DRY = flag( '--dry' );
const ONLY = flag( '--only' ) ? new Set( argv[ argv.indexOf( '--only' ) + 1 ].split( ',' ) ) : null;
const SELF = 'bin/codemod-strided.mjs';

const TEXT = /\.(?:js|mjs|cjs|ts|json|md|sh|py|yml|yaml|txt|html|css)$|^bin\/[^/.]+$/;
// tickets/ is history; DIFFERENCES.md compares with stdlib's API; the two
// bench/bin files use stdlib's own `.ndarray` (upstream-stdlib.js benchmarks
// stdlib's ddot; example-esm.cjs rewrites stdlib-style `require( … ).ndarray`
// examples).
const SKIP = /^(?:tickets\/|node_modules\/|data\/|dist\/|site\/)|(?:^|\/)DIFFERENCES\.md$|^docs\/ndarray-layer\.md$|^package-lock\.json$|^bench\/dgemm-opt\/variants\/upstream-stdlib\.js$|^bin\/codemod-spec\/example-esm\.cjs$/;
// Before the rename the tooling called the <routine>.js form `strided`; that
// name moves to `wrapper` in the same pass that gives `strided` to the offset
// form. Once no module has lib/ndarray.js the swap is done, so a rerun (or
// --check) only maps `ndarray` -> `strided`.
const PRE = PKGS.some( ( p ) => fs.existsSync( path.join( ROOT, 'lib', p ) ) && fs.readdirSync( path.join( ROOT, 'lib', p ) ).some( ( r ) => fs.existsSync( path.join( ROOT, 'lib', p, r, 'lib', 'ndarray.js' ) ) ) );

const isJS = ( f ) => /\.(?:js|mjs|cjs)$/.test( f ) || /^bin\/[^/.]+$/.test( f );
const inModule = ( f ) => /^lib\/(?:blas|lapack|arpack)\/[^/]+\//.test( f );

function tracked() {
	return execFileSync( 'git', [ 'ls-files', '-z' ], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 28 } ).split( '\0' ).filter( ( f ) => f && fs.existsSync( path.join( ROOT, f ) ) );
}

// The word `ndarray` meaning the offset form: not stdlib's (a path segment of
// @stdlib/ndarray/…, ndarray-like, ndarray objects, ndarrays).
const WORD = /(?<![@\w/$.])ndarray(?![\w$]|-like|-object|-layer|-conformance|\s+(?:objects?|shape)\b|\/)/g;
const PATH = /(?<![@\w/-]stdlib\/[\w/-]*)\b(test\.|benchmark\.)?ndarray\.js\b/g;
const MEMBER = /\.ndarray(?![\w$-])/g;
const STDLIB_LINE = /stdlib(?: has|:\*\*| in)[^\n]{0,40}ndarray/i;

// Rewrites free text (string contents, comments, files that are not JS).
// `word`: also the bare word; `tooling`: also `'strided'` -> `'wrapper'`.
// Prose that used "strided" for the <routine>.js form, renamed before the
// offset form takes the word (only while the rename has not happened). Module
// code keeps "strided form" (it means strided addressing there).
function preProse( s, lib ) {
	let out = s.replace( /\bstrided (wrappers?)\b/g, '$1' );
	if ( !lib ) {
		out = out.replace( /\bstrided (forms?|projection)\b/g, 'wrapper $1' )
			.replace( /\bstrided-projection\b/g, 'wrapper-projection' )
			.replace( /\bbase\/ndarray\/strided\b/g, 'base/strided/wrapper' );
	}
	return out;
}

function mapText( s, { word, tooling, backticks, lib } ) {
	if ( PRE ) {
		s = preProse( s, lib );
	}
	let out = s.replace( PATH, ( m, pre ) => `${pre || ''}strided.js` ).replace( MEMBER, '.strided' )
		// escaped in a regex or string: ndarray\.js, \bndarray
		.replace( /(?<![@\w/-]stdlib\\?\/[\w\\/-]*)\bndarray(\\+\.js)/g, 'strided$1' )
		.replace( /(\\b)ndarray\b/g, '$1strided' )
		// check IDs (conf:conventions.ndarray-calls-base) and the form pair base/ndarray
		.replace( /\.ndarray-(?!like\b)/g, '.strided-' )
		.replace( /\bbase\/ndarray\b(?!\/)/g, 'base/strided' )
		// shell variables
		.replace( /(\$\{?)ndarray\b/g, '$1strided' );
	if ( tooling ) {
		out = out.replace( /(['"`])strided\1|(--kind=)strided\b/g, ( m, q, k ) => ( k ? k + 'wrapper' : `${q}wrapper${q}` ) );
	}
	if ( word ) {
		out = out.replace( /(?<=[a-z0-9}>])Ndarray\b/g, 'Strided' );
		// names written in comments and prose (`ndarrayFn`), Python names
		// (test_ndarray_js, gen_ndarray_js, fix_ndarray), and a hyphenated path
		// segment (rules/wrapper-calls-ndarray/)
		out = out.replace( /\bndarray(?=[A-Z][a-z])/g, 'strided' )
			.replace( /(?<![A-Za-z0-9.])ndarray(?=_[A-Za-z])|(?<=[A-Za-z0-9]_)ndarray(?![A-Za-z0-9])/g, 'strided' )
			.replace( /(?<=[a-z]-)ndarray(?=\/)/g, 'strided' );
	}
	if ( word ) {
		out = out.replace( WORD, 'strided' );
	} else {
		out = out.replace( /(['"])ndarray\1/g, '$1strided$1' );
		if ( backticks ) {
			out = out.replace( /`ndarray`/g, '`strided`' );
		}
	}
	return out;
}

// JS: rewrite by token so identifiers, strings and comments each get their rule.
function mapJS( src, f ) {
	const tooling = !inModule( f ) && PRE;
	const ids = tooling ? { 'ndarray': 'strided', 'strided': 'wrapper' } : { 'ndarray': 'strided' };
	let toks;
	const body = src.replace( /^#!.*/, ( m ) => ' '.repeat( m.length ) );
	for ( const sourceType of [ 'module', 'script' ] ) {
		try {
			toks = espree.tokenize( body, { 'ecmaVersion': 'latest', sourceType, 'range': true, 'comment': true } );
			break;
		} catch ( err ) {
			toks = null;
		}
	}
	if ( !toks ) {
		return { 'out': mapText( src, { 'word': true, tooling } ), 'unparsed': true };
	}
	const edits = [];
	for ( const t of [ ...toks, ...( toks.comments || [] ) ] ) {
		const [ a, b ] = t.range;
		const text = src.slice( a, b );
		let next = text;
		if ( t.type === 'Identifier' ) {
			if ( Object.hasOwn( ids, text ) ) {
				next = ids[ text ];
			} else {
				// ndarrayPath -> stridedPath; hasNdarray -> hasStrided (no tooling
				// identifier starts with `strided`, so these cannot collide)
				next = text.replace( /^ndarray(?=[A-Z0-9_])/, 'strided' ).replace( /(?<=[a-z0-9])Ndarray(?=[A-Z_]|$)/g, 'Strided' );
			}
		} else if ( t.type === 'String' && /^(['"])(ndarray|strided)\1$/.test( text ) ) {
			const v = text.slice( 1, -1 );
			next = ( v === 'ndarray' || tooling ) ? text[ 0 ] + ids[ v ] + text[ 0 ] : text;
		} else if ( t.type === 'String' || t.type === 'Template' || t.type === 'RegularExpression' || t.type === 'Block' || t.type === 'Line' ) {
			next = mapText( text, { 'word': true, tooling, 'lib': inModule( f ) } );
		}
		if ( next !== text ) {
			edits.push( [ a, b, next ] );
		}
	}
	let out = src;
	for ( const [ a, b, next ] of edits.sort( ( x, y ) => y[ 0 ] - x[ 0 ] ) ) {
		out = out.slice( 0, a ) + next + out.slice( b );
	}
	return { out, 'unparsed': false };
}

function mapFile( src, f ) {
	if ( isJS( f ) ) {
		return mapJS( src, f );
	}
	if ( /\.md$/.test( f ) ) {
		// A line describing stdlib's own files or methods (module LEARNINGS
		// comparing with stdlib) keeps stdlib's names.
		return { 'out': src.split( '\n' ).map( ( line ) => ( STDLIB_LINE.test( line ) ? line : mapText( line, { 'word': true, 'tooling': false, 'lib': inModule( f ) } ) ) ).join( '\n' ) };
	}
	return { 'out': mapText( src, { 'word': true, 'tooling': PRE && !inModule( f ) && /\.(?:py|sh)$|^bin\//.test( f ), 'lib': inModule( f ) } ) };
}

// New name for a tracked path, segment by segment.
function mapPath( f ) {
	return f.split( '/' ).map( ( seg ) => ( PRE ? seg.replace( /^strided-projection\b/, 'wrapper-projection' ) : seg ).replace( /^(test\.|benchmark\.)?ndarray\.js$/, '$1strided.js' ).replace( WORD, 'strided' ) ).join( '/' );
}

function selected( f ) {
	if ( !ONLY ) {
		return true;
	}
	const m = /^lib\/(?:blas|lapack|arpack)\/([^/]+)\//.exec( f );
	return !!m && ONLY.has( m[ 1 ] );
}

// --report / --check: what still uses the old names.
function remaining() {
	const hits = [];
	for ( const f of tracked() ) {
		if ( SKIP.test( f ) || f === SELF || !TEXT.test( f ) ) {
			continue;
		}
		if ( mapPath( f ) !== f ) {
			hits.push( `${f}: path still says ndarray` );
		}
		const src = fs.readFileSync( path.join( ROOT, f ), 'utf8' );
		const { out } = mapFile( src, f );
		if ( out !== src ) {
			const a = src.split( '\n' );
			const b = out.split( '\n' );
			a.forEach( ( line, i ) => {
				if ( line !== b[ i ] ) {
					hits.push( `${f}:${i + 1}: ${line.trim().slice( 0, 140 )}` );
				}
			});
		}
		if ( /\.md$/.test( f ) && !f.startsWith( 'lib/' ) ) {
			src.split( '\n' ).forEach( ( line, i ) => {
				if ( new RegExp( WORD.source ).test( line ) ) {
					hits.push( `${f}:${i + 1}: (prose, review) ${line.trim().slice( 0, 140 )}` );
				}
			});
		}
	}
	return hits;
}

if ( flag( '--report' ) || flag( '--check' ) ) {
	const r = remaining();
	const hard = r.filter( ( h ) => !h.includes( '(prose, review)' ) );
	( flag( '--check' ) ? hard : r ).forEach( ( h ) => console.log( h ) );
	console.log( `${hard.length} use(s) of the old offset-form name${flag( '--report' ) ? `; ${r.length - hard.length} prose line(s) to review` : ''}` );
	process.exit( flag( '--check' ) && hard.length ? 1 : 0 );
}
if ( !flag( '--all' ) && !ONLY ) {
	console.error( 'usage: node bin/codemod-strided.mjs [--dry] (--all | --only a,b) | --report | --check' );
	process.exit( 2 );
}

const counts = { files: 0, moved: 0, unparsed: [] };
const files = tracked().filter( ( f ) => !SKIP.test( f ) && f !== SELF && selected( f ) );
for ( const f of files ) {
	if ( !TEXT.test( f ) ) {
		continue;
	}
	const src = fs.readFileSync( path.join( ROOT, f ), 'utf8' );
	const { out, unparsed } = mapFile( src, f );
	if ( unparsed ) {
		counts.unparsed.push( f );
	}
	if ( out !== src ) {
		counts.files += 1;
		if ( !DRY ) {
			fs.writeFileSync( path.join( ROOT, f ), out );
		}
	}
}
for ( const f of files ) {
	const to = mapPath( f );
	if ( to !== f ) {
		counts.moved += 1;
		if ( !DRY ) {
			fs.mkdirSync( path.dirname( path.join( ROOT, to ) ), { recursive: true } );
			execFileSync( 'git', [ 'mv', f, to ], { cwd: ROOT } );
		}
	}
}
// Remove directories a rename emptied (a renamed lint rule's old directory).
if ( !DRY ) {
	for ( const f of files ) {
		let d = path.dirname( path.join( ROOT, f ) );
		while ( d.startsWith( ROOT + path.sep ) && fs.existsSync( d ) && fs.readdirSync( d ).length === 0 ) {
			fs.rmdirSync( d );
			d = path.dirname( d );
		}
	}
}
console.log( `${DRY ? 'would rewrite' : 'rewrote'} ${counts.files} file(s), ${DRY ? 'would rename' : 'renamed'} ${counts.moved} path(s)${counts.unparsed.length ? `; ${counts.unparsed.length} JS file(s) rewritten as text (did not parse): ${counts.unparsed.slice( 0, 5 ).join( ', ' )}` : ''}` );
