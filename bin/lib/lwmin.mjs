/**
* Shared by bin/gen-lwmin.mjs (records the reference's workspace minimum)
* and bin/workspace-minimum.mjs (checks the minimum each ndarray.js demands
* against it): CONVENTIONS W3, ticket 0016.
*
* Reads only the specs, spec/options.json and data/fortran-checks.json
* (committed), never the Fortran sources (CONVENTIONS T6), so the
* generator's `--check` and the checker both run in CI.
*
* The routines are those of bin/lib/lwkopt.mjs `routineSet()` (d/z modules
* whose spec has a workspace-length argument) and the rows are its grid.
* `measured( spec )` says which workspaces of a routine have a minimum the
* generator records:
*
* - `check`: a workspace with a length argument (WORK/LWORK, RWORK/LRWORK,
*   IWORK/LIWORK, ...). Its minimum is measured: the smallest length the
*   reference does not reject with INFO = -k (k from the reference's check
*   of that argument, data/fortran-checks.json, else its position).
* - `declared`: a workspace without one whose Fortran declaration gives its
*   extent from the integer arguments (zgges's RWORK( 8*N ), IWORK( N+6 )).
*   The reference cannot reject it; the declared extent, evaluated by the
*   driver in Fortran, is the minimum a caller must pass.
*
* Every other workspace is `unmeasured`, with the reason.
*/

import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './corpus.mjs';
import { GRID_VERSION as LWKOPT_GRID_VERSION } from './lwkopt.mjs';
import { createHash } from 'node:crypto';

// Bump when what a row means changes; the cache records it and `--check`
// compares.
const LWMIN_VERSION = 2;

const CACHE_FILE = path.join( ROOT, 'data', 'fortran-lwmin.json' );

// Fortran intrinsics a declared workspace dimension may use.
const INTRINSICS = new Set( [ 'MAX', 'MIN', 'ABS', 'MOD' ] );

let CHECKS = null;

function fortranChecks( r ) {
	if ( CHECKS === null ) {
		CHECKS = JSON.parse( fs.readFileSync( path.join( ROOT, 'data', 'fortran-checks.json' ), 'utf8' ) );
	}
	return ( CHECKS[ r ] && CHECKS[ r ].checks ) || [];
}

/**
* A Fortran integer expression over the driver's variables (`8*N` ->
* `8*v_n`), or null when it names anything but the routine's integer inputs
* and MAX/MIN/ABS/MOD.
*/
function fortranExpr( spec, expr ) {
	const ints = new Set( spec.params.filter( ( p ) => p.dtype === 'int32' && [ 'dim', 'scalar', 'ld' ].includes( p.role ) && p.intent === 'in' ).map( ( p ) => p.fortran ) );
	let ok = true;
	const out = String( expr ).toUpperCase().replace( /\s+/g, '' ).replace( /[A-Z][A-Z0-9_]*/g, ( id ) => {
		if ( INTRINSICS.has( id ) ) {
			return id.toLowerCase();
		}
		if ( ints.has( id ) ) {
			return 'v_' + id.toLowerCase();
		}
		ok = false;
		return id;
	});
	return ( ok && /^[a-z0-9_+\-*/(),]+$/.test( out ) ) ? out : null;
}

/**
* The workspaces of a routine whose minimum is recorded, in spec order:
* { workspaces: [ { name, kind, length, info, expr, estimate } ],
*   unmeasured: { name: reason } }.
*
* `length` is the length argument (kind `check`), `info` the INFO value its
* rejection returns, `estimate` the spec's minLength JS expression (a first
* guess the generator verifies), `expr` the declared extent (kind
* `declared`) as a driver expression.
*/
function measured( spec ) {
	const lworks = spec.params.filter( ( p ) => p.role === 'lwork' );
	const checks = fortranChecks( spec.routine );
	const out = [];
	const unmeasured = {};
	spec.params.filter( ( p ) => p.role === 'workspace' ).forEach( ( p ) => {
		const L = lworks.find( ( q ) => q.of === p.fortran );
		if ( L ) {
			const c = checks.find( ( x ) => new RegExp( '\\b' + L.fortran + '\\b' ).test( x.cond ) );
			out.push( {
				'name': p.fortran,
				'kind': 'check',
				'length': L.fortran,
				'info': c ? c.info : -L.position,
				'estimate': ( p.minLength && p.minLength.js ) || null
			} );
			return;
		}
		const ld = lworks.find( ( q ) => !q.of && p.ld === q.fortran );
		if ( ld ) {
			unmeasured[ p.fortran ] = ld.fortran + ' is its leading dimension, not a length: the JS takes strides (W1), so there is no length minimum to compare';
			return;
		}
		if ( !p.dims || !p.dims.length || p.dims.includes( '*' ) ) {
			unmeasured[ p.fortran ] = 'assumed-size declaration ' + JSON.stringify( p.dims ) + ' and no length argument: the reference states no extent';
			return;
		}
		const parts = p.dims.map( ( d ) => fortranExpr( spec, d ) );
		if ( parts.some( ( x ) => x === null ) ) {
			unmeasured[ p.fortran ] = 'declared extent ' + p.dims.join( ' x ' ) + ' names something other than an integer argument';
			return;
		}
		out.push( {
			'name': p.fortran,
			'kind': 'declared',
			'length': null,
			'info': null,
			'expr': parts.map( ( x ) => '(' + x + ')' ).join( '*' ),
			'fortran': p.dims.join( ' x ' )
		} );
	});
	return { 'workspaces': out, 'unmeasured': unmeasured };
}

// Routines in scope that the generator cannot measure, with the reason.
// `--check` fails on a routine in scope that has neither a cache entry nor
// a listed reason, and on a listed routine that has left the scope.
const UNHANDLED = {};

/**
* The key of a routine's cache entry: the lwkopt grid hash (the rows) and
* what is measured.
*/
function entryHash( gridHash, m ) {
	return createHash( 'sha256' ).update( JSON.stringify( { 'v': LWMIN_VERSION, 'g': LWKOPT_GRID_VERSION, 'grid': gridHash, 'ws': m.workspaces, 'un': m.unmeasured } ) ).digest( 'hex' ).slice( 0, 16 );
}

function hasInfo( spec ) {
	return spec.params.some( ( p ) => p.role === 'info' );
}

export { LWMIN_VERSION, CACHE_FILE, UNHANDLED, fortranExpr, measured, entryHash, hasInfo };
