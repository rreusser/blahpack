/**
* Lists `@param` descriptions that leave out a fact the reference documents for
* the argument and a caller needs (ticket 0130):
*
*   - not-referenced: the reference says (part of) the argument is not
*     referenced ("the strictly lower triangular part of A is not referenced",
*     "Not referenced if JOBVL = 'N'"), and the JSDoc never says which part or
*     when the argument is read.
*   - destroyed: the reference says the argument's contents are destroyed on
*     exit ("On exit, B has been overwritten."), and the JSDoc does not say so
*     ("modified in-place" reads as a meaningful output).
*
* The reference text is the spec's `params[].reference` (bin/gen_spec, from
* data/fortran-param-docs.json); the JSDoc is the `@param` line of the module's
* `lib/ndarray.js`. Both are committed, so this runs without the Fortran sources.
*
* Usage:
*   node bin/reference-facts.mjs            # summary; exit 1 when anything is missing
*   node bin/reference-facts.mjs --list     # every finding
*   node bin/reference-facts.mjs <routine>  # one routine's findings
*
* @module bin/reference-facts
*/

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve( import.meta.dirname, '..' );

// What the reference says, and the wording that counts as the JSDoc saying it too.
const FACTS = [
	{
		'kind': 'not-referenced',
		'reference': /\bnot (?:be )?referenced\b/i,
		'jsdoc': /referenc|ignored|unused|not (?:read|used|accessed)|\b(?:upper|lower)\b|triang|\bonly\b|\bif\b|\bwhen\b|\bunless\b/i
	},
	{
		'kind': 'destroyed',
		// "has been overwritten." / "is destroyed" / "contents ... are destroyed", but not
		// "is overwritten by the factors", which describes the output.
		'reference': /\b(?:has been|is|are|will be|gets) (?:overwritten|destroyed)\b(?!\s+(?:by|with|on exit by))|\bcontents?\b[^.]*\bdestroyed\b/i,
		'jsdoc': /destroy|overwrit|clobber|scratch|garbage|undefined|unspecified|not preserved/i
	}
];

function jsdocParams( src ) {
	const out = new Map();
	for ( const m of src.matchAll( /@param\s+\{[^}]*\}\s+\[?(\w+)(?:=[^\]\s]*)?\]?\s+-\s+(.*)/g ) ) {
		out.set( m[ 1 ].toLowerCase(), m[ 2 ] );
	}
	return out;
}

function modules() {
	const out = new Map();
	for ( const pkg of readdirSync( join( ROOT, 'lib' ) ) ) {
		const base = join( ROOT, 'lib', pkg );
		if ( !statSync( base ).isDirectory() ) {
			continue;
		}
		for ( const r of readdirSync( base ) ) {
			const nd = join( base, r, 'lib', 'ndarray.js' );
			if ( existsSync( nd ) ) {
				out.set( r, nd );
			}
		}
	}
	return out;
}

function findings( routine, ndarray ) {
	const file = join( ROOT, 'spec', routine + '.json' );
	if ( !existsSync( file ) ) {
		return [];
	}
	const spec = JSON.parse( readFileSync( file, 'utf8' ) );
	const docs = jsdocParams( readFileSync( ndarray, 'utf8' ) );
	const out = [];
	for ( const p of spec.params ) {
		const desc = docs.get( p.name.toLowerCase() );
		if ( !p.reference || desc === undefined ) {
			continue;
		}
		for ( const f of FACTS ) {
			if ( f.reference.test( p.reference ) && !f.jsdoc.test( desc ) ) {
				const sentence = ( p.reference.replace( /\s+/g, ' ' ).match( new RegExp( '[^.]*' + f.reference.source + '[^.]*\\.?', 'i' ) ) || [ '' ] )[ 0 ].trim();
				out.push({ routine, 'param': p.name, 'kind': f.kind, 'jsdoc': desc, 'reference': sentence });
			}
		}
	}
	return out;
}

function main() {
	const args = process.argv.slice( 2 );
	const list = args.includes( '--list' );
	const only = args.filter( ( a ) => !a.startsWith( '--' ) );
	const mods = modules();
	const all = [];
	for ( const [ r, nd ] of [ ...mods ].sort() ) {
		if ( !only.length || only.includes( r ) ) {
			all.push( ...findings( r, nd ) );
		}
	}
	if ( list || only.length ) {
		for ( const f of all ) {
			console.log( f.routine + ' ' + f.param + ' [' + f.kind + ']\n  jsdoc:     ' + f.jsdoc + '\n  reference: ' + f.reference );
		}
	}
	const by = {};
	for ( const f of all ) {
		by[ f.kind ] = ( by[ f.kind ] || 0 ) + 1;
	}
	const routines = new Set( all.map( ( f ) => f.routine ) ).size;
	console.log( all.length ? 'reference-facts: ' + all.length + ' @param descriptions in ' + routines + ' modules leave out a documented fact ' + JSON.stringify( by ) + ' (ticket 0130)' : 'reference-facts: every @param states the reference\'s not-referenced and destroyed-on-exit facts' );
	process.exit( all.length ? 1 : 0 );
}

main();
