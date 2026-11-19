// JSDoc helpers for the S10 codemod: Fortran-derived descriptions for the new
// output-scalar params, and @param/@returns block rewriting.

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../codemod-strided-wrapper/lib.mjs';
import { arrayType, offsetName } from './plan.mjs';
import { isComplex } from './forms.mjs';

const DIRS = [
	'data/lapack-3.12.0/SRC',
	'data/lapack-3.12.0/BLAS/SRC',
	'data/BLAS-3.12.0',
	'data/BLAS-3.12.0/SRC',
	'data/arpack-ng-3.9.1/SRC',
	'data/lapack-3.12.0/INSTALL'
];

function fortranSource( routine ) {
	for ( const d of DIRS ) {
		for ( const ext of [ '.f', '.f90' ] ) {
			const f = path.join( ROOT, d, routine + ext );
			if ( fs.existsSync( f ) ) {
				return fs.readFileSync( f, 'utf8' );
			}
		}
	}
	return null;
}

// First sentence of the Fortran \param doc for NAME (without the "is TYPE" line).
export function fortranDesc( routine, NAME ) {
	const src = fortranSource( routine );
	if ( !src ) {
		return null;
	}
	const re = new RegExp( '\\\\param\\[[a-z,]+\\]\\s+' + NAME + '\\b[^\\n]*\\n\\*>\\s*\\\\verbatim\\n([\\s\\S]*?)\\\\endverbatim', 'i' );
	const m = re.exec( src );
	if ( !m ) {
		return null;
	}
	const lines = m[ 1 ].split( '\n' ).map( ( l ) => l.replace( /^\*>\s?/, '' ).trim() );
	const body = [];
	for ( const l of lines ) {
		if ( new RegExp( '^' + NAME + '\\s+is\\b', 'i' ).test( l ) ) {
			continue;
		}
		if ( !l && body.length ) {
			break;
		}
		if ( l ) {
			body.push( l );
		}
	}
	let text = body.join( ' ' ).replace( /\s+/g, ' ' ).trim();
	const dot = text.search( /\.(\s|$)/ );
	if ( dot !== -1 ) {
		text = text.slice( 0, dot );
	}
	text = text.replace( /^On (entry|exit),?\s*/i, '' );
	if ( text.length > 140 ) {
		text = text.slice( 0, 137 ).replace( /\s+\S*$/, '' ) + '...';
	}
	return text || null;
}

export function paramLine( routine, p, name ) {
	let desc = fortranDesc( routine, p.fortran || p.name );
	const io = ( p.intent === 'inout' ) ? 'input/output' : 'output';
	desc = desc ? desc.charAt( 0 ).toLowerCase() + desc.slice( 1 ) : '`' + name + '`';
	const lines = [ '* @param {' + arrayType( p ) + '} ' + name + ' - ' + io + ' (length-1 array): ' + desc.replace( /\*\//g, '* /' ) ];
	if ( isComplex( p ) ) {
		lines.push( '* @param {NonNegativeInteger} ' + offsetName( p ) + ' - starting index for `' + name + '` (in complex elements)' );
	}
	return lines;
}

// Rewrite the JSDoc block `doc` (text of `/** ... */`) for a function whose
// params become `newList`. `added` maps a new param name → lines to insert;
// `retyped` maps a by-value param name → its new array type; `returns` is the
// new @returns line (or null to keep).
export function rewriteJsdoc( doc, newList, added, retyped, returns ) {
	const lines = doc.split( '\n' );
	const params = [];
	let first = -1;
	let last = -1;
	for ( let i = 0; i < lines.length; i++ ) {
		const m = /^(\s*\*\s*)@param\s+\{[^}]*\}\s+\[?([A-Za-z0-9_$]+)/.exec( lines[ i ] );
		if ( m ) {
			if ( first === -1 ) {
				first = i;
			}
			// Continuation lines belong to this @param.
			let j = i + 1;
			while ( j < lines.length && /^\s*\*\s{2,}\S/.test( lines[ j ] ) && !/^\s*\*\s*@/.test( lines[ j ] ) ) {
				j += 1;
			}
			params.push( { name: m[ 2 ], lines: lines.slice( i, j ) } );
			last = j - 1;
			i = j - 1;
		}
	}
	const out = [];
	for ( const n of newList ) {
		if ( added[ n ] ) {
			out.push( ...added[ n ] );
			continue;
		}
		const p = params.find( ( x ) => x.name.toLowerCase() === n.toLowerCase() );
		if ( p ) {
			let ls = p.lines.slice();
			if ( retyped[ n ] ) {
				ls[ 0 ] = ls[ 0 ].replace( /@param\s+\{[^}]*\}/, '@param {' + retyped[ n ] + '}' ).replace( /( - )(.*)$/, ( all, sep, rest ) => sep + 'input/output (length-1 array): ' + rest );
			}
			out.push( ...ls );
		}
	}
	let res;
	if ( first === -1 ) {
		// No @param lines: insert before the first tag or the end.
		const at = lines.findIndex( ( l ) => /^\s*\*\s*@/.test( l ) );
		const k = ( at === -1 ) ? lines.length - 1 : at;
		res = lines.slice( 0, k ).concat( out, lines.slice( k ) );
	} else {
		res = lines.slice( 0, first ).concat( out, lines.slice( last + 1 ) );
	}
	if ( returns !== null && returns !== void 0 ) {
		const ri = res.findIndex( ( l ) => /^\s*\*\s*@returns?\b/.test( l ) );
		if ( ri !== -1 ) {
			let j = ri + 1;
			while ( j < res.length && /^\s*\*\s{2,}\S/.test( res[ j ] ) && !/^\s*\*\s*@/.test( res[ j ] ) ) {
				j += 1;
			}
			res.splice( ri, j - ri, ...( returns ? [ returns ] : [] ) );
		} else if ( returns ) {
			const end = res.length - 1;
			const ex = res.findIndex( ( l ) => /^\s*\*\s*@example\b/.test( l ) );
			const at = ( ex === -1 ) ? end : ex;
			res.splice( at, 0, returns );
		}
	}
	return res.join( '\n' );
}
