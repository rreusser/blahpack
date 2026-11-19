// Pass 3: vector strides and offsets in strided wrappers (CONVENTIONS D2/D3).
//
//   --mode=stride  add each data/index vector stride the projection has but the
//                  wrapper lacks: `x` → `x, strideX`. The base call's unit
//                  stride and zero offset for `x` become `strideX, ox` with
//                  `const ox = stride2offset( len, strideX )`.
//   --mode=offset  drop each `offset*` param the projection does not have:
//                  `x, strideX, offsetX` → `x, strideX` with the offset
//                  computed internally as `stride2offset( len, strideX )`
//                  (a complex scalar's `x, offsetX` → `x`, offset 0).
//
// `len` is the array's Fortran dimension (data/fortran-signatures.json),
// translated to the wrapper's parameter names: `(N)` → `N`,
// `(1+(N-1)*abs(INCX))` → `N`, `(max(1,N))` → `max( 1, N )`. If a dimension
// cannot be translated, the routine is left for the residue.
//
// Call sites: inserted strides get `1`; dropped offsets must be literal `0`
// at every call site (else the call's meaning would change — reported).
//
// Usage: node bin/codemod-strided-wrapper/pass-vector.mjs --mode=stride|offset [--dry] [routine...]

import fs from 'node:fs';
import path from 'node:path';
import * as walk from 'acorn-walk';
import { ROOT, loadModules, parse, findCallSites, buildMapping, callEdit, applyEdits, rewriteTextCalls, isStride, isOffset } from './lib.mjs';

const argv = process.argv.slice( 2 );
const DRY = argv.includes( '--dry' );
const MODE = ( argv.find( ( a ) => a.startsWith( '--mode=' ) ) || '' ).slice( 7 );
const only = argv.filter( ( a ) => !a.startsWith( '--' ) );
if ( MODE !== 'stride' && MODE !== 'offset' ) {
	throw new Error( '--mode=stride|offset required' );
}
const FSIG = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-signatures.json' ), 'utf8' ) );

function esc( s ) {
	return s.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

// Translate a Fortran dimension expression into JS over `params`, or null.
function translate( e, params, need ) {
	const lower = params.map( ( p ) => p.toLowerCase() );
	const toks = e.match( /[A-Za-z_][A-Za-z0-9_]*|\d+|\*\*|[-+*/(),]|\S/g ) || [];
	let out = '';
	for ( let i = 0; i < toks.length; i++ ) {
		const t = toks[ i ];
		if ( /^[A-Za-z_]/.test( t ) ) {
			const fn = t.toLowerCase();
			if ( toks[ i + 1 ] === '(' && ( fn === 'max' || fn === 'min' ) ) {
				need.add( fn );
				out += fn;
				continue;
			}
			const j = lower.indexOf( fn );
			if ( j === -1 ) {
				return null;
			}
			out += params[ j ];
		} else if ( /^\d+$/.test( t ) || /^[-+*/(),]$/.test( t ) ) {
			out += t;
		} else {
			return null;
		}
	}
	// stdlib spacing.
	return out.replace( /\(/g, '( ' ).replace( /\)/g, ' )' ).replace( /,/g, ', ' ).replace( /([-+*/])/g, ' $1 ' ).replace( /\(\s+\)/g, '()' ).replace( /\s+/g, ' ' ).replace( /\( \( /g, '( ( ' ).trim();
}

// Lengths the Fortran signature data cannot give mechanically (assumed-size
// `(*)`, RFP `(NT)`, names that differ from the JS ones), read from the
// reference documentation. Keyed `routine.array` (lowercase).
const RFP = ( n ) => '( ' + n + ' * ( ' + n + ' + 1 ) ) / 2';
const SIDE_RFP = '( side === \'left\' ) ? ' + RFP( 'M' ) + ' : ' + RFP( 'N' );
const LEN_OVERRIDES = {
	'dgetv0.resid': 'N',
	'dsaitr.resid': 'N',
	'dsaup2.resid': 'N',
	'dsaupd.resid': 'N',
	'dgetv0.ipntr': '3',
	'dsaitr.ipntr': '3',
	'dsaup2.ipntr': '3',
	'dsaup2.ritz': 'nev + np',
	'dsaup2.bounds': 'nev + np',
	'dsaupd.iparam': '11',
	'dsaupd.ipntr': '11',
	'drotm.param': '5',
	'drotmg.x1': '1',
	'drotmg.d': '2',
	'drotmg.param': '5',
	'dlasd2.d': 'NL + NR + 1',
	'dlasd2.z': 'NL + NR + 1',
	'dlasd2.dsigma': 'NL + NR + 1',
	'dlasd2.idxp': 'NL + NR + 1',
	'dlasd2.idx': 'NL + NR + 1',
	'dlasd2.idxc': 'NL + NR + 1',
	'dlasd2.idxq': 'NL + NR + 1',
	'dlasd2.coltyp': 'NL + NR + 1',
	'dsfrk.c': RFP( 'N' ),
	'dtfsm.a': SIDE_RFP,
	'dtftri.a': RFP( 'N' ),
	'dtrttf.arf': RFP( 'N' ),
	'zlansf.a': RFP( 'N' ),
	'dopmtr.ap': SIDE_RFP,
	'zupmtr.ap': SIDE_RFP,
	'dopmtr.tau': '( side === \'left\' ) ? M - 1 : N - 1',
	'zupmtr.tau': '( side === \'left\' ) ? M - 1 : N - 1'
};

// Element count of 1-D array `name` of `routine` as a JS expression, or null.
function vecLen( routine, name, params, need ) {
	const ov = LEN_OVERRIDES[ routine + '.' + name.toLowerCase() ];
	if ( ov ) {
		return ov;
	}
	const sig = FSIG[ routine ];
	if ( !sig ) {
		return null;
	}
	const arg = sig.arguments.find( ( a ) => a.name.toLowerCase() === name.toLowerCase() );
	if ( !arg ) {
		return null;
	}
	const t = arg.type.trim();
	let e;
	const m = /dimension\s*(\(.*\))\s*[.,;]?\s*$/i.exec( t );
	const ml = /\blength\s+([A-Za-z0-9_]+)\s*\.?$/i.exec( t );
	if ( m ) {
		// Strip one level of enclosing parentheses.
		e = m[ 1 ].replace( /\s+/g, '' ).slice( 1, -1 );
	} else if ( ml ) {
		e = ml[ 1 ];
	} else {
		return null;
	}
	// Squares: X**2 → (X*X).
	e = e.replace( /([A-Za-z0-9_]+|\([^()]*\))\*\*2/g, '($1*$1)' );
	// Strided BLAS vector: 1+(N-1)*abs(INCX) → N.
	const s = /^\(?1\+\((\w+)-1\)\*abs\(\w+\)\)?$/i.exec( e );
	if ( s ) {
		e = s[ 1 ];
	}
	if ( /,/.test( e.replace( /\([^()]*\)/g, '' ) ) || e === '*' ) {
		return null; // multi-dimensional or assumed-size
	}
	return translate( e, params, need );
}

function transform( m ) {
	let src = fs.readFileSync( m.wrapper, 'utf8' );
	const wantLower = new Set( m.want.map( ( p ) => p.toLowerCase() ) );
	const gotLower = m.got.map( ( p ) => p.toLowerCase() );
	const need = new Set();
	let params = m.got.slice();
	let ast;
	try {
		ast = parse( src );
	} catch ( e ) {
		return { residue: 'parse: ' + e.message };
	}
	const calls = [];
	walk.simple( ast, {
		CallExpression( n ) {
			if ( n.callee.type === 'Identifier' && n.callee.name === 'base' ) {
				calls.push( n );
			}
		}
	});
	const fnStart = src.search( new RegExp( 'function\\s+' + m.fn + '\\s*\\(' ) );
	const decls = [];
	const edits = [];
	const jsdocAdds = [];
	const jsdocDrops = [];

	if ( MODE === 'stride' ) {
		const missing = m.want.filter( ( p ) => isStride( p ) && !gotLower.includes( p.toLowerCase() ) );
		if ( !missing.length ) {
			return null;
		}
		if ( !calls.length ) {
			return { residue: 'no base call' };
		}
		for ( const sp of missing ) {
			const wi = m.want.findIndex( ( p ) => p === sp );
			const arr = m.want[ wi - 1 ];
			const gi = params.findIndex( ( p ) => p.toLowerCase() === arr.toLowerCase() );
			if ( gi === -1 ) {
				return { residue: 'array ' + arr + ' of ' + sp + ' not in wrapper' };
			}
			if ( new RegExp( '\\b' + esc( sp ) + '\\b' ).test( src.slice( fnStart ) ) ) {
				return { residue: sp + ' already referenced in body' };
			}
			params.splice( gi + 1, 0, sp );
			const bi = m.base.findIndex( ( p ) => p.toLowerCase() === arr.toLowerCase() );
			if ( bi === -1 || !isStride( m.base[ bi + 1 ] ) || !isOffset( m.base[ bi + 2 ] || '' ) ) {
				return { residue: 'base group for ' + arr };
			}
			const ov = 'o' + arr.toLowerCase();
			if ( new RegExp( '\\b' + esc( ov ) + '\\b' ).test( src ) ) {
				return { residue: 'offset name clash ' + ov };
			}
			for ( const c of calls ) {
				const a1 = c.arguments[ bi + 1 ];
				const a2 = c.arguments[ bi + 2 ];
				if ( !( a1 && a1.type === 'Literal' && a1.value === 1 && a2 && a2.type === 'Literal' && a2.value === 0 ) ) {
					return { residue: arr + ' base args `' + ( a1 && a2 ? src.slice( a1.start, a2.end ) : '?' ) + '`' };
				}
				edits.push( { start: a1.start, end: a2.end, text: sp + ', ' + ov } );
			}
			const len = vecLen( m.routine, arr, params, need );
			if ( !len ) {
				return { residue: 'dimension of ' + arr + ' unmappable' };
			}
			decls.push( 'const ' + ov + ' = stride2offset( ' + len + ', ' + sp + ' );' );
			jsdocAdds.push( { after: params[ gi ], line: '* @param {integer} ' + sp + ' - stride length for `' + params[ gi ] + '`' } );
		}
	} else {
		const extra = m.got.filter( ( p ) => isOffset( p ) && !wantLower.has( p.toLowerCase() ) );
		if ( !extra.length ) {
			return null;
		}
		for ( const op of extra ) {
			const gi = params.indexOf( op );
			const prev = params[ gi - 1 ];
			const arr = isStride( prev ) ? params[ gi - 2 ] : prev;
			const fnSrc = src.slice( fnStart );
			if ( new RegExp( '(^|[^.\\w$])' + esc( op ) + '\\s*(=[^=]|\\+=|-=|\\+\\+|--)' ).test( fnSrc ) ) {
				return { residue: op + ' is reassigned' };
			}
			params = params.filter( ( p ) => p !== op );
			jsdocDrops.push( op );
			if ( isStride( prev ) ) {
				const len = vecLen( m.routine, arr, params, need );
				if ( !len ) {
					return { residue: 'dimension of ' + arr + ' unmappable' };
				}
				decls.push( 'const ' + op + ' = stride2offset( ' + len + ', ' + prev + ' );' );
			} else {
				decls.push( 'const ' + op + ' = 0;' );
			}
		}
	}
	src = applyEdits( src, edits );

	// Signature.
	src = src.replace( new RegExp( '(function\\s+' + m.fn + '\\s*\\()[^)]*\\)' ), '$1 ' + params.join( ', ' ) + ' )' );

	// Declarations: right after leading `let`/blank lines and the order /
	// packed checks at the top of the body.
	const fs0 = src.search( new RegExp( 'function\\s+' + m.fn + '\\s*\\(' ) );
	const brace = src.indexOf( '{', src.indexOf( ')', fs0 ) );
	let pos = src.indexOf( '\n', brace ) + 1;
	for ( ;; ) {
		const end = src.indexOf( '\n', pos );
		const line = src.slice( pos, end );
		if ( /^\s*$/.test( line ) || /^\s*let [^=]*;\s*$/.test( line ) ) {
			pos = end + 1;
			continue;
		}
		// Skip the order / packed-order validation blocks.
		const blk = /^\tif \( (!isLayout\( order \)|order === 'row-major') \) \{\n\t\tthrow [^\n]*\n\t\}\n/.exec( src.slice( pos ) );
		if ( blk ) {
			pos += blk[ 0 ].length;
			continue;
		}
		break;
	}
	const prev = src.slice( 0, pos );
	const needBlank = /let [^=]*;\n$/.test( prev );
	src = prev + ( needBlank ? '\n' : '' ) + decls.map( ( d ) => '\t' + d + '\n' ).join( '' ) + src.slice( pos );

	// JSDoc.
	const fs1 = src.search( new RegExp( 'function\\s+' + m.fn + '\\s*\\(' ) );
	const jsStart = src.lastIndexOf( '/**', fs1 );
	const jsEnd = src.indexOf( '*/', jsStart ) + 2;
	let jsdoc = src.slice( jsStart, jsEnd );
	for ( const op of jsdocDrops ) {
		jsdoc = jsdoc.replace( new RegExp( '\\n\\*\\s*@param\\s+\\{[^}]*\\}\\s+' + esc( op ) + '\\b[^\\n]*' ), '' );
	}
	for ( const a of jsdocAdds ) {
		const re = new RegExp( '(\\n\\*\\s*@param\\s+\\{[^}]*\\}\\s+' + esc( a.after ) + '\\b[^\\n]*)' );
		if ( !re.test( jsdoc ) ) {
			return { residue: 'no @param for ' + a.after };
		}
		jsdoc = jsdoc.replace( re, '$1\n' + a.line );
	}
	src = src.slice( 0, jsStart ) + jsdoc + src.slice( jsEnd );
	src = src.replace( /(\/\*\*[\s\S]*?\*\/)/g, ( c ) => rewriteTextCalls( c, m.fn, m.got, params, ( p ) => ( isStride( p ) ? '1' : null ) ) );

	// Imports.
	const addImport = ( local, spec ) => {
		if ( new RegExp( 'import ' + local + ' from' ).test( src ) ) {
			return;
		}
		src = src.replace( /(\/\/ MODULES \/\/\n\n)/, '$1import ' + local + ' from \'' + spec + '\';\n' );
	};
	if ( /stride2offset\(/.test( src ) ) {
		addImport( 'stride2offset', '@stdlib/strided/base/stride2offset/lib/index.js' );
	}
	if ( need.has( 'max' ) ) {
		addImport( 'max', '@stdlib/math/base/special/fast/max/lib/index.js' );
	}
	if ( need.has( 'min' ) ) {
		addImport( 'min', '@stdlib/math/base/special/fast/min/lib/index.js' );
	}
	if ( !/\/\/ MODULES \/\//.test( src ) ) {
		return { residue: 'no MODULES section' };
	}
	return { src, params };
}

const modules = loadModules();
const changed = [];
const residue = [];
for ( const m of modules ) {
	if ( m.ok || ( only.length && !only.includes( m.routine ) ) ) {
		continue;
	}
	const r = transform( m );
	if ( !r ) {
		continue;
	}
	if ( r.residue ) {
		residue.push( m.routine + ': ' + r.residue );
		continue;
	}
	m.newSrc = r.src;
	m.newParams = r.params;
	changed.push( m );
}

let problems = 0;
const sites = findCallSites( changed );
const wrapperFiles = new Set( changed.map( ( m ) => m.wrapper ) );
const fileEdits = new Map();
let ncalls = 0;
let nlen = 0;
for ( const [ file, bindings ] of sites ) {
	if ( wrapperFiles.has( file ) ) {
		console.error( 'CALL SITE INSIDE CHANGED WRAPPER ' + path.relative( ROOT, file ) );
		problems += 1;
		continue;
	}
	const src = fs.readFileSync( file, 'utf8' );
	const edits = [];
	for ( const b of bindings ) {
		const m = b.module;
		const mapping = buildMapping( m.got, m.newParams, ( p ) => {
			if ( isStride( p ) ) {
				return '1';
			}
			throw new Error( m.routine + ': cannot insert ' + p );
		});
		const dropIdx = m.got.map( ( p, i ) => ( m.newParams.includes( p ) ? -1 : i ) ).filter( ( i ) => i >= 0 );
		for ( const c of b.calls ) {
			for ( const i of dropIdx ) {
				const a = c.arguments[ i ];
				if ( a && !( a.type === 'Literal' && a.value === 0 ) ) {
					console.error( 'NONZERO OFFSET ' + path.relative( ROOT, file ) + ':' + src.slice( 0, a.start ).split( '\n' ).length + ' ' + m.routine + ' ' + m.got[ i ] + '=' + src.slice( a.start, a.end ) );
					problems += 1;
				}
			}
			edits.push( callEdit( src, c, mapping ) );
			ncalls += 1;
		}
		for ( const sp of b.spreads ) {
			console.error( 'SPREAD call in ' + path.relative( ROOT, file ) + ' for ' + m.routine );
			problems += 1;
		}
		for ( const L of b.lengths ) {
			const after = src.slice( L.end, L.end + 20 );
			const mm = /^(\s*,\s*)(\d+)/.exec( after );
			if ( mm && Number( mm[ 2 ] ) === m.got.length ) {
				edits.push( { start: L.end + mm[ 1 ].length, end: L.end + mm[ 0 ].length, text: String( m.newParams.length ) } );
				nlen += 1;
			}
		}
	}
	fileEdits.set( file, applyEdits( src, edits ) );
}

console.log( 'mode: ' + MODE + ', wrappers: ' + changed.length + ', calls: ' + ncalls + ', arity asserts: ' + nlen + ', problems: ' + problems + ', residue: ' + residue.length );
for ( const s of residue ) {
	console.log( '  RESIDUE ' + s );
}
if ( !DRY ) {
	for ( const m of changed ) {
		fs.writeFileSync( m.wrapper, m.newSrc );
	}
	for ( const [ file, src ] of fileEdits ) {
		fs.writeFileSync( file, src );
	}
}
