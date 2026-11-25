/**
* @license MIT
*
* Copyright (c) 2026 Ricky Reusser.
*
* Derived from ARPACK (arpack-ng 3.9.1), Copyright (c) 1996-2008 Rice
* University. Developed by D.C. Sorensen, R.B. Lehoucq, C. Yang, and
* K. Maschhoff, under the BSD-3-Clause license. See LICENSE.txt in the
* repository root for the full license text and upstream attribution.
*/

/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsyev from './../../../../lapack/base/dsyev/lib/base.js';
import base from './../lib/base.js';
import dsaupd from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsaupd.f90);
// regenerate with `./test/run_fortran.sh arpack dsaupd`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsaupd.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

function lap( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		a[ i + ( i * n ) ] = 2.0;
		if ( i < n - 1 ) {
			a[ i + ( ( i + 1 ) * n ) ] = -1.0;
			a[ ( i + 1 ) + ( i * n ) ] = -1.0;
		}
	}
	return a;
}

function dense( n ) {
	const a = new Float64Array( n * n );
	for ( let i = 1; i <= n; i++ ) {
		a[ ( i - 1 ) + ( ( i - 1 ) * n ) ] = i;
		if ( i < n ) {
			a[ ( i - 1 ) + ( i * n ) ] = 0.5;
			a[ i + ( ( i - 1 ) * n ) ] = 0.5;
		}
	}
	return a;
}

const INPUTS = {
	'LM_n10_nev3_ncv6': { n: 10, which: 'LM', nev: 3, ncv: 6, A: lap( 10 ) },
	'SA_n10_nev4_ncv8': { n: 10, which: 'SA', nev: 4, ncv: 8, A: lap( 10 ) },
	'LA_n8_nev2_ncv6': { n: 8, which: 'LA', nev: 2, ncv: 6, A: dense( 8 ) }
};

const TOL = 1e-9;


// FUNCTIONS //

function run( inp ) {
	const n = inp.n;
	const A = inp.A;
	const ncv = inp.ncv;
	const ldv = n;
	const V = new Float64Array( ldv * ncv );
	const resid = new Float64Array( n );
	for ( let r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const workd = new Float64Array( 3 * n );
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const workl = new Float64Array( lworkl );
	const iparam = new Int32Array( 11 );
	iparam[ 0 ] = 1;
	iparam[ 2 ] = 100;
	iparam[ 6 ] = 1;
	const ipntr = new Int32Array( 11 );
	const ido = new Int32Array( 1 );
	const state = {};
	let info = 1;
	let guard = 0;
	while ( guard++ < 100000 ) {
		info = dsaupd( state, ido, 'standard', n, inp.which, inp.nev, 0.0, resid, 1, 0, ncv, V, 1, ldv, 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, info );
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			const p = ipntr[ 0 ];
			const q = ipntr[ 1 ];
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ p + c ];
				}
				workd[ q + r ] = acc;
			}
		} else {
			break;
		}
	}

	// Ritz values / bounds live in workl at the 1-based pointers ipntr(6)/ipntr(7):
	const ritzOff = ipntr[ 5 ] - 1;
	const boundsOff = ipntr[ 6 ] - 1;
	const ritz = workl.slice( ritzOff, ritzOff + ncv );
	const bounds = workl.slice( boundsOff, boundsOff + ncv );
	return { ritz, bounds, resid, nconv: iparam[ 4 ], mxiter: iparam[ 2 ], info, ido: ido[ 0 ] };
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsaupd: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.ido, tc.ido, 'ido' );
		assert.strictEqual( out.nconv, tc.nconv, 'nconv' );
		assert.strictEqual( out.mxiter, tc.mxiter, 'mxiter' );
		for ( let i = 0; i < tc.ritz.length; i++ ) {
			assert.ok( close( out.ritz[ i ], tc.ritz[ i ] ), 'ritz[' + i + ']: expected ' + tc.ritz[ i ] + ', got ' + out.ritz[ i ] );
		}
		for ( let i = 0; i < tc.bounds.length; i++ ) {
			assert.ok( close( out.bounds[ i ], tc.bounds[ i ] ), 'bounds[' + i + ']' );
		}
		for ( let i = 0; i < tc.resid.length; i++ ) {
			assert.ok( close( out.resid[ i ], tc.resid[ i ] ), 'resid[' + i + ']' );
		}
	});
}


// PROPERTY AND ERROR TESTS //

/**
* Returns all eigenvalues (ascending) of a dense symmetric matrix, computed independently with LAPACK `dsyev`.
*
* @private
* @param {PositiveInteger} n - order
* @param {Float64Array} A - symmetric matrix (column-major)
* @returns {Float64Array} eigenvalues
*/
function eigenvalues( n, A ) {
	const w = new Float64Array( n );
	const info = dsyev( 'no-vectors', 'upper', n, A.slice(), 1, n, 0, w, 1, 0, new Float64Array( 64 * n ), 1, 0 );
	assert.strictEqual( info, 0, 'dsyev succeeds' );
	return w;
}

/**
* Drives the full mode-1 `dsaupd` reverse-communication loop for a dense standard problem.
*
* @private
* @param {Object} o - options
* @returns {Object} results
*/
function drive( o ) {
	const A = o.A;
	const n = Math.round( Math.sqrt( A.length ) );
	const ncv = o.ncv;
	const lworkl = ( o.lworkl === void 0 ) ? ( ncv * ncv ) + ( 8 * ncv ) : o.lworkl;
	const V = new Float64Array( Math.max( n, 1 ) * Math.max( ncv, 1 ) );
	const resid = new Float64Array( Math.max( n, 1 ) );
	const workd = new Float64Array( 3 * Math.max( n, 1 ) );
	const workl = new Float64Array( Math.max( lworkl, ( ncv * ncv ) + ( 8 * ncv ), 1 ) );
	const iparam = new Int32Array( 11 );
	const ipntr = new Int32Array( 11 );
	const ido = new Int32Array( 1 );
	const state = {};
	const npSeen = [];
	let info = o.info || 0;
	if ( o.resid ) {
		resid.set( o.resid );
	}
	iparam[ 0 ] = ( o.ishift === void 0 ) ? 1 : o.ishift;
	iparam[ 2 ] = ( o.mxiter === void 0 ) ? 300 : o.mxiter;
	iparam[ 6 ] = ( o.mode === void 0 ) ? 1 : o.mode;
	for ( let it = 0; it < 100000; it++ ) {
		info = ( o.fcn || dsaupd )( state, ido, o.bmat || 'standard', n, o.which || 'LM', o.nev, 0.0, resid, 1, 0, ncv, V, 1, Math.max( n, 1 ), 0, iparam, 1, 0, ipntr, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, info );
		if ( ido[ 0 ] === -1 || ido[ 0 ] === 1 ) {
			for ( let r = 0; r < n; r++ ) {
				let acc = 0.0;
				for ( let c = 0; c < n; c++ ) {
					acc += A[ r + ( c * n ) ] * workd[ ipntr[ 0 ] + c ];
				}
				workd[ ipntr[ 1 ] + r ] = acc;
			}
		} else if ( ido[ 0 ] === 3 ) {
			// Supply the exact shifts: the iparam[7] unwanted Ritz values, which lead the Ritz array workl(ipntr(6)); shifts go to workl(ipntr(11)) (1-based pointers):
			npSeen.push( iparam[ 7 ] );
			for ( let k = 0; k < iparam[ 7 ]; k++ ) {
				workl[ ipntr[ 10 ] - 1 + k ] = workl[ ipntr[ 5 ] - 1 + k ];
			}
		} else {
			break;
		}
	}
	const nconv = iparam[ 4 ];
	const ritzOff = ipntr[ 5 ] - 1;
	return {
		'info': info,
		'ido': ido[ 0 ],
		'iparam': iparam,
		'npSeen': npSeen,
		'ritz': Array.from( workl.slice( ritzOff, ritzOff + nconv ) ).sort( ( a, b ) => a - b )
	};
}

const NE = 12;
const DENSE12 = dense( NE );
const W12 = eigenvalues( NE, DENSE12 );

test( 'dsaupd: ishift = 0 asks for shifts (ido = 3, iparam[7] = np); exact user shifts converge to the largest eigenvalues (vs dsyev)', function t() {
	const out = drive({
		'A': DENSE12,
		'which': 'LA',
		'nev': 3,
		'ncv': 7,
		'ishift': 0
	});
	assert.strictEqual( out.info, 0, 'info is 0' );
	assert.ok( out.npSeen.length > 0, 'ido = 3 was requested' );
	assert.ok( out.npSeen.every( ( np ) => np === 4 ), 'iparam[7] reports np = ncv - nev = 4 shifts' );
	assert.strictEqual( out.iparam[ 4 ], 3, 'nconv' );
	const expected = Array.from( W12.slice( NE - 3 ) );
	for ( let i = 0; i < 3; i++ ) {
		assert.ok( Math.abs( out.ritz[ i ] - expected[ i ] ) <= 1e-10 * Math.abs( expected[ i ] ), 'ritz[' + i + '] = ' + out.ritz[ i ] + ' matches ' + expected[ i ] );
	}
});

test( 'dsaupd: returns info = 1 when the maximum number of iterations is reached', function t() {
	const out = drive({
		'A': DENSE12,
		'which': 'SM',
		'nev': 3,
		'ncv': 7,
		'mxiter': 1
	});
	assert.strictEqual( out.info, 1, 'info is 1' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );

	// As in the reference, the loop exits once ITER > MXITER, and iparam(3) returns ITER:
	assert.strictEqual( out.iparam[ 2 ], 2, 'iparam[2] returns the number of iterations taken' );
	assert.ok( out.iparam[ 4 ] < 3, 'fewer than nev Ritz values converged' );
});

test( 'dsaupd: returns info = -9 for a zero user-supplied starting vector', function t() {
	const out = drive({
		'A': DENSE12,
		'nev': 3,
		'ncv': 7,
		'info': 1,
		'resid': new Float64Array( NE )
	});
	assert.strictEqual( out.info, -9, 'info is -9' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
});

test( 'dsaupd: returns info = 3 when no shifts can be applied (starting vector in an invariant subspace)', function t() {
	// A = diag(1..10) and resid = e1 + e2: the Lanczos tridiagonal splits and both unwanted Ritz values have zero Ritz estimates.
	const n = 10;
	const D = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		D[ i * ( n + 1 ) ] = i + 1;
	}
	const resid = new Float64Array( n );
	resid[ 0 ] = 1.0;
	resid[ 1 ] = 1.0;
	const out = drive({
		'A': D,
		'which': 'LA',
		'nev': 1,
		'ncv': 3,
		'info': 1,
		'resid': resid
	});
	assert.strictEqual( out.info, 3, 'info is 3' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
	assert.strictEqual( out.iparam[ 4 ], 0, 'no Ritz value converged' );
});

const ERRORS = [
	[ 'N = 0', { 'A': new Float64Array( 0 ), 'nev': 1, 'ncv': 2 }, -1 ],
	[ 'nev = 0', { 'nev': 0, 'ncv': 4 }, -2 ],
	[ 'ncv = nev', { 'nev': 3, 'ncv': 3 }, -3 ],
	[ 'ncv > N', { 'nev': 3, 'ncv': 13 }, -3 ],
	[ 'mxiter = 0', { 'mxiter': 0 }, -4 ],
	[ 'lworkl too small', { 'lworkl': 50 }, -7 ],
	[ 'mode = 0', { 'mode': 0 }, -10 ],
	[ 'mode = 6', { 'mode': 6 }, -10 ],
	[ 'mode 1 with generalized bmat', { 'bmat': 'generalized' }, -11 ],
	[ 'ishift = 2', { 'ishift': 2 }, -12 ],
	[ 'ishift = -1', { 'ishift': -1 }, -12 ],
	[ 'nev = 1 with which = BE', { 'nev': 1, 'which': 'BE' }, -13 ]
];

for ( const [ name, o, code ] of ERRORS ) {
	test( 'dsaupd: ' + name + ' returns info = ' + code + ' with ido = 99', function t() {
		const out = drive( Object.assign({
			'A': DENSE12,
			'nev': 3,
			'ncv': 7
		}, o ) );
		assert.strictEqual( out.info, code, 'info is ' + code );
		assert.strictEqual( out.ido, 99, 'ido is 99' );
		assert.strictEqual( out.iparam[ 4 ], 0, 'iparam[4] untouched' );
	});
}

// The ndarray API rejects an invalid `which`/`bmat` with a TypeError, so the reference INFO codes -5/-6 are reachable only through base.js:
test( 'dsaupd (base): invalid which returns info = -5 and invalid bmat returns info = -6', function t() {
	let out = drive({
		'A': DENSE12,
		'nev': 3,
		'ncv': 7,
		'which': 'XX',
		'fcn': base
	});
	assert.strictEqual( out.info, -5, 'info is -5' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
	out = drive({
		'A': DENSE12,
		'nev': 3,
		'ncv': 7,
		'bmat': 'X',
		'fcn': base
	});
	assert.strictEqual( out.info, -6, 'info is -6' );
	assert.strictEqual( out.ido, 99, 'ido is 99' );
});
