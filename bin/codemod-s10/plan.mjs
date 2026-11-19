// Per-routine migration plan: old and new parameter lists (base/ndarray and
// strided wrapper), the caller-side array type for each output scalar, and the
// new return value. Shared by the base.js transform and the call-site rewrite.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ROOT, paramsOf } from '../codemod-strided-wrapper/lib.mjs';
import { detect, isComplex } from './forms.mjs';

const require = createRequire( import.meta.url );
const specLib = require( path.join( ROOT, 'lint', 'lib', 'spec.cjs' ) );

function lc( s ) {
	return s.toLowerCase();
}

// Insert the output names into `list` at their Fortran positions: after the
// nearest preceding spec param whose names are present.
function insertOutputs( list, spec, outs, groupsOf ) {
	const out = list.slice();
	const groups = specLib.baseGroups( spec );
	for ( const p of outs ) {
		const names = groupsOf( p );
		if ( names.every( ( n ) => out.some( ( x ) => lc( x ) === lc( n ) ) ) ) {
			continue;
		}
		const gi = groups.findIndex( ( g ) => g.param === p );
		let at = 0;
		for ( let j = gi - 1; j >= 0; j-- ) {
			const prev = groups[ j ].names.concat( [ groups[ j ].param.name ] ).map( lc );
			let idx = -1;
			out.forEach( ( x, k ) => {
				if ( prev.includes( lc( x ) ) ) {
					idx = k;
				}
			});
			if ( idx !== -1 ) {
				at = idx + 1;
				break;
			}
			// A spec param the code spells differently (e.g. strided wrapper's
			// `LDA` for base `strideA1`): keep looking further back.
		}
		// Leading `order` in the strided wrapper stays first.
		if ( at === 0 && out[ 0 ] === 'order' ) {
			at = 1;
		}
		out.splice( at, 0, ...names );
	}
	return out;
}

export function arrayType( p ) {
	if ( isComplex( p ) ) {
		return 'Complex128Array';
	}
	return p.dtype === 'int32' ? 'Int32Array' : 'Float64Array';
}

export function offsetName( p ) {
	return 'offset' + p.name.charAt( 0 ).toUpperCase() + p.name.slice( 1 );
}

// Build the plan for one routine (or { error }).
export function plan( routine ) {
	const d = detect( routine );
	if ( d.error ) {
		return d;
	}
	const spec = d.spec;
	const ov = d.override || {};
	const outs = spec.params.filter( ( p ) => d.form[ p.name ] && d.form[ p.name ].kind !== 'array' );
	const removed = new Set( ( ov.remove || [] ).map( lc ) );
	for ( const f of Object.values( d.form ) ) {
		if ( f.kind === 'outIndex' || f.kind === 'outField' ) {
			removed.add( lc( f.param ) );
		}
	}
	const rename = ov.rename || {};
	const renameFn = ( x ) => ( rename[ x ] !== void 0 ? rename[ x ] : x );
	const oldBase = d.params;
	const baseKept = oldBase.filter( ( x ) => !removed.has( lc( x ) ) ).map( renameFn );
	const newBase = insertOutputs( baseKept, spec, outs, ( p ) => ( isComplex( p ) ? [ p.name, offsetName( p ) ] : [ p.name ] ) );

	const wfile = path.join( d.dir, 'lib', routine + '.js' );
	const nfile = path.join( d.dir, 'lib', 'ndarray.js' );
	const oldStrided = fs.existsSync( wfile ) ? paramsOf( fs.readFileSync( wfile, 'utf8' ) ) : null;
	const oldNd = fs.existsSync( nfile ) ? paramsOf( fs.readFileSync( nfile, 'utf8' ) ) : null;
	let newStrided = null;
	if ( oldStrided ) {
		const sRemoved = new Set( removed );
		// Removed array params drop their stride too in the strided form.
		for ( const r of removed ) {
			oldStrided.forEach( ( x ) => {
				if ( lc( x ) === 'stride' + r || ( ov.removeStrided || [] ).map( lc ).includes( lc( x ) ) ) {
					sRemoved.add( lc( x ) );
				}
			});
		}
		newStrided = insertOutputs( oldStrided.filter( ( x ) => !sRemoved.has( lc( x ) ) ).map( renameFn ), spec, outs, ( p ) => [ p.name ] );
	}
	let newNd = null;
	if ( oldNd ) {
		newNd = insertOutputs( oldNd.filter( ( x ) => !removed.has( lc( x ) ) ).map( renameFn ), spec, outs, ( p ) => ( isComplex( p ) ? [ p.name, offsetName( p ) ] : [ p.name ] ) );
	}
	// Name of each output's param in the new base list (spec spelling, or the
	// existing spelling for by-value params).
	const pname = {};
	for ( const p of outs ) {
		const f = d.form[ p.name ];
		pname[ p.name ] = ( f.kind === 'value' ) ? renameFn( f.param ) : p.name;
	}
	let ret = spec.returns.kind;
	let retParam = null;
	if ( ret === 'array' ) {
		retParam = newBase.find( ( x ) => lc( x ) === lc( spec.returns.param ) ) || spec.returns.param;
	}
	return {
		...d,
		outs,
		oldBase,
		newBase,
		oldNd,
		newNd,
		oldStrided,
		newStrided,
		pname,
		ret,
		retParam,
		removed,
		renames: rename
	};
}
