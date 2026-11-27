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

/* eslint-disable no-restricted-syntax */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dsygv from './../../../../lapack/base/dsygv/lib/base.js';
import { importWithDependencies } from './../../../../../test/harness/constants.js';
import dsband from './../lib/ndarray.js';


// FIXTURES //

// Reference outputs generated from the ARPACK Fortran (test/fortran/test_dsband.f90);
// regenerate with `./test/run_fortran.sh arpack dsband`.
const fixtureURL = new URL( './../../../../../test/fixtures/dsband.jsonl', import.meta.url );
const cases = readFileSync( fixtureURL, 'utf8' ).trim().split( '\n' ).map( function parse( line ) {
	return JSON.parse( line );
});

const LDA = 4; // 2*kl + ku + 1 for kl = ku = 1
const KL = 1;
const KU = 1;
const IDIAG = KL + KU + 1;
const ISUP = KL + KU;
const ISUB = KL + KU + 2;
const TOL = 1e-9;

const INPUTS = {
	'gen_shiftinv_n20': { n: 20, nev: 4, ncv: 10, mode: 3, bmat: 'generalized', which: 'LM', sigma: 0.0 },
	'std_regular_n16': { n: 16, nev: 3, ncv: 8, mode: 1, bmat: 'standard', which: 'SA', sigma: 0.0 },
	'std_shiftinv_n16': { n: 16, nev: 3, ncv: 8, mode: 3, bmat: 'standard', which: 'LM', sigma: 1.0 }
};


// FUNCTIONS //

function buildBands( n ) {
	const AB = new Float64Array( LDA * n );
	const MB = new Float64Array( LDA * n );
	const h = 1.0 / ( n + 1 );
	const r1 = 4.0 / 6.0;
	const r2 = 1.0 / 6.0;
	let j;
	for ( j = 1; j <= n; j++ ) {
		AB[ ( IDIAG - 1 ) + ( ( j - 1 ) * LDA ) ] = 2.0 / h;
		MB[ ( IDIAG - 1 ) + ( ( j - 1 ) * LDA ) ] = r1 * h;
	}
	for ( j = 1; j <= n - 1; j++ ) {
		AB[ ( ISUP - 1 ) + ( j * LDA ) ] = -1.0 / h;
		AB[ ( ISUB - 1 ) + ( ( j - 1 ) * LDA ) ] = -1.0 / h;
		MB[ ( ISUP - 1 ) + ( j * LDA ) ] = r2 * h;
		MB[ ( ISUB - 1 ) + ( ( j - 1 ) * LDA ) ] = r2 * h;
	}
	return { AB, MB };
}

function run( inp ) {
	const n = inp.n;
	const ncv = inp.ncv;
	const bands = buildBands( n );
	const RFAC = new Float64Array( LDA * n );
	const ldv = n;
	const V = new Float64Array( ldv * ncv );
	const d = new Float64Array( ncv );
	const resid = new Float64Array( n );
	let r;
	for ( r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	const workd = new Float64Array( 3 * n );
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const workl = new Float64Array( lworkl );
	const iparam = new Int32Array( 11 );
	iparam[ 2 ] = 300;
	iparam[ 6 ] = inp.mode;
	const iwork = new Int32Array( ( inp.iworkLength === void 0 ) ? n : inp.iworkLength );
	const select = new Int32Array( ncv );

	// Z aliases V (as in the ARPACK band driver); base takes them as separate parameters.
	const info = dsband( true, 'all', select, 1, 0, d, 1, 0, V, 1, ldv, 0, inp.sigma, n, bands.AB, 1, LDA, 0, bands.MB, 1, LDA, 0, RFAC, 1, LDA, 0, KL, KU, inp.which, inp.bmat, inp.nev, 0.0, resid, 1, 0, ncv, V, 1, ldv, 0, iparam, 1, 0, workd, 1, 0, workl, 1, 0, lworkl, iwork, 1, 0, 1 );

	const nconv = iparam[ 4 ];
	return { info, nconv, mxiter: iparam[ 2 ], d: d.slice( 0, inp.nev ), z: V.slice( 0, n * nconv ), n };
}

// Compares Ritz vector columns, allowing a global sign flip per column.
function columnDiff( got, exp, n, ncol ) {
	let maxd = 0;
	let c;
	let r;
	for ( c = 0; c < ncol; c++ ) {
		let mi = 0;
		let mv = 0;
		for ( r = 0; r < n; r++ ) {
			if ( Math.abs( exp[ ( c * n ) + r ] ) > mv ) {
				mv = Math.abs( exp[ ( c * n ) + r ] );
				mi = r;
			}
		}
		const s = ( Math.sign( got[ ( c * n ) + mi ] ) === Math.sign( exp[ ( c * n ) + mi ] ) ) ? 1 : -1;
		for ( r = 0; r < n; r++ ) {
			maxd = Math.max( maxd, Math.abs( ( s * got[ ( c * n ) + r ] ) - exp[ ( c * n ) + r ] ) );
		}
	}
	return maxd;
}

function close( a, b ) {
	return Math.abs( a - b ) <= TOL * Math.max( Math.abs( b ), 1.0 );
}


// TESTS //

for ( const tc of cases ) {
	test( 'dsband: ' + tc.name, function t() {
		const out = run( INPUTS[ tc.name ] );
		assert.strictEqual( out.info, tc.info, 'info' );
		assert.strictEqual( out.nconv, tc.nconv, 'nconv' );
		assert.strictEqual( out.mxiter, tc.mxiter, 'mxiter' );
		for ( let i = 0; i < tc.d.length; i++ ) {
			assert.ok( close( out.d[ i ], tc.d[ i ] ), 'd[' + i + ']: expected ' + tc.d[ i ] + ', got ' + out.d[ i ] );
		}
		const zd = columnDiff( out.z, tc.z, tc.n, tc.nconv );
		assert.ok( zd < 1e-8, 'Ritz vectors match (max diff ' + zd + ')' );
	});
}


// PROPERTY TESTS (independent oracle: LAPACK dsygv on the dense pencil) //

const NB = 12;

/**
* Returns a column-major symmetric tridiagonal matrix with constant diagonal `a` and off-diagonal `b`.
*
* @private
* @param {PositiveInteger} n - order
* @param {number} a - diagonal value
* @param {number} b - off-diagonal value
* @returns {Float64Array} matrix
*/
function tridiag( n, a, b ) {
	const out = new Float64Array( n * n );
	for ( let i = 0; i < n; i++ ) {
		out[ ( i * n ) + i ] = a;
		if ( i > 0 ) {
			out[ ( i * n ) + i - 1 ] = b;
			out[ ( ( i - 1 ) * n ) + i ] = b;
		}
	}
	return out;
}

/**
* Packs a dense column-major tridiagonal matrix into LAPACK band storage with `kl = ku = 1` (leading dimension `LDA`).
*
* @private
* @param {PositiveInteger} n - order
* @param {Float64Array} A - dense matrix
* @returns {Float64Array} band storage
*/
function toBand( n, A ) {
	const out = new Float64Array( LDA * n );
	for ( let j = 0; j < n; j++ ) {
		for ( let i = Math.max( 0, j - KU ); i <= Math.min( n - 1, j + KL ); i++ ) {
			out[ ( KL + KU + i - j ) + ( j * LDA ) ] = A[ ( j * n ) + i ];
		}
	}
	return out;
}

/**
* Returns all eigenvalues (ascending) of the pencil `(A, B)` computed independently with LAPACK `dsygv`.
*
* @private
* @param {PositiveInteger} n - order
* @param {Float64Array} A - symmetric matrix
* @param {Float64Array} B - symmetric positive definite matrix
* @returns {Float64Array} eigenvalues
*/
function pencilEigenvalues( n, A, B ) {
	const w = new Float64Array( n );
	const info = dsygv( 1, 'no-vectors', 'upper', n, A.slice(), 1, n, 0, B.slice(), 1, n, 0, w, 1, 0, new Float64Array( 64 * n ), 1, 0 );
	assert.strictEqual( info, 0, 'dsygv succeeds' );
	return w;
}

/**
* Returns the eigenvalues `lambda` of `w` that ARPACK selects with `which` applied to the spectral transform `nu = op( lambda )`, sorted ascending.
*
* @private
* @param {Float64Array} w - eigenvalues of the original pencil
* @param {Function} op - spectral transformation
* @param {string} which - selection code
* @param {PositiveInteger} k - count
* @returns {Array} selected eigenvalues
*/
function wanted( w, op, which, k ) {
	const asc = Array.from( w ).sort( ( a, b ) => op( a ) - op( b ) );
	let out;
	if ( which === 'LM' ) {
		out = Array.from( w ).sort( ( a, b ) => Math.abs( op( b ) ) - Math.abs( op( a ) ) ).slice( 0, k );
	} else if ( which === 'LA' ) {
		out = asc.slice( asc.length - k );
	} else {
		// 'BE': floor(k/2) from the low end, the rest from the high end.
		out = asc.slice( 0, Math.floor( k / 2 ) ).concat( asc.slice( asc.length - ( k - Math.floor( k / 2 ) ) ) );
	}
	return out.sort( ( a, b ) => a - b );
}

/**
* Runs `dsband` (ndarray API) on banded `A` and `M`, with selected arguments overridden.
*
* @private
* @param {Object} o - options
* @param {Function} [fcn] - dsband implementation
* @returns {Object} results
*/
function solve( o, fcn ) {
	const n = o.n || NB;
	const ncv = o.ncv || 8;
	const nev = o.nev || 3;
	const lworkl = ( ncv * ncv ) + ( 8 * ncv );
	const iparam = new Int32Array( 11 );
	const resid = new Float64Array( n );
	const d = new Float64Array( nev ).fill( -999.0 );
	const Z = new Float64Array( n * nev );
	for ( let r = 0; r < n; r++ ) {
		resid[ r ] = 1.0 + ( 0.1 * ( r + 1 ) );
	}
	iparam[ 2 ] = o.mxiter || 300;
	iparam[ 6 ] = o.mode;
	const info = ( fcn || dsband )( true, 'all', new Uint8Array( ncv ), 1, 0, d, 1, 0, Z, 1, n, 0, o.sigma || 0.0, n, toBand( n, o.A ), 1, LDA, 0, toBand( n, o.M ), 1, LDA, 0, new Float64Array( LDA * n ), 1, LDA, 0, KL, KU, o.which || 'LM', o.bmat, nev, 0.0, resid, 1, 0, ncv, new Float64Array( n * ncv ), 1, n, 0, iparam, 1, 0, new Float64Array( 3 * n ), 1, 0, new Float64Array( lworkl ), 1, 0, lworkl, new Int32Array( n ), 1, 0, ( o.infoIn === void 0 ) ? 1 : o.infoIn );
	return {
		'info': info,
		'nconv': iparam[ 4 ],
		'iter': iparam[ 2 ],
		'd': d,
		'Z': Z,
		'n': n
	};
}

/**
* Returns `max_i |(A*z - lambda*M*z)_i|` for a dense column-major `A` and `M`.
*
* @private
* @param {PositiveInteger} n - order
* @param {Float64Array} A - matrix
* @param {Float64Array} M - matrix
* @param {number} lambda - eigenvalue
* @param {Float64Array} Z - vectors
* @param {NonNegativeInteger} oz - column offset
* @returns {number} residual
*/
function residual( n, A, M, lambda, Z, oz ) {
	let res = 0.0;
	for ( let i = 0; i < n; i++ ) {
		let acc = 0.0;
		for ( let j = 0; j < n; j++ ) {
			acc += ( A[ ( j * n ) + i ] - ( lambda * M[ ( j * n ) + i ] ) ) * Z[ oz + j ];
		}
		res = Math.max( res, Math.abs( acc ) );
	}
	return res;
}

const HB = 1.0 / ( NB + 1 );
const STIFF = tridiag( NB, 2.0 / HB, -1.0 / HB );
const MASSB = tridiag( NB, 4.0 * HB / 6.0, HB / 6.0 );
const EYEB = tridiag( NB, 1.0, 0.0 );
const WG = pencilEigenvalues( NB, STIFF, MASSB );
const WS = pencilEigenvalues( NB, STIFF, EYEB );
const SIG = 50.0;

const MODES = [
	{ 'name': 'mode 1 (standard regular), which = BE', 'mode': 1, 'bmat': 'standard', 'which': 'BE', 'sigma': 0.0, 'M': EYEB, 'w': WS, 'op': ( x ) => x },
	{ 'name': 'mode 2 (generalized regular inverse), which = LA', 'mode': 2, 'bmat': 'generalized', 'which': 'LA', 'sigma': 0.0, 'M': MASSB, 'w': WG, 'op': ( x ) => x },
	{ 'name': 'mode 4 (buckling)', 'mode': 4, 'bmat': 'generalized', 'which': 'LM', 'sigma': SIG, 'M': MASSB, 'w': WG, 'op': ( x ) => x / ( x - SIG ) },
	{ 'name': 'mode 5 (generalized Cayley)', 'mode': 5, 'bmat': 'generalized', 'which': 'LM', 'sigma': SIG, 'M': MASSB, 'w': WG, 'op': ( x ) => ( x + SIG ) / ( x - SIG ) },
	{ 'name': 'mode 5 (standard Cayley)', 'mode': 5, 'bmat': 'standard', 'which': 'LM', 'sigma': SIG, 'M': EYEB, 'w': WS, 'op': ( x ) => ( x + SIG ) / ( x - SIG ) }
];

for ( const mc of MODES ) {
	test( 'dsband: ' + mc.name + ' returns the selected eigenpairs of A*z = lambda*M*z (vs dsygv)', function t() {
		const out = solve({
			'A': STIFF,
			'M': mc.M,
			'mode': mc.mode,
			'bmat': mc.bmat,
			'which': mc.which,
			'sigma': mc.sigma
		});
		assert.strictEqual( out.info, 0, 'info is 0' );
		assert.strictEqual( out.nconv, 3, 'nconv' );
		const expected = wanted( mc.w, mc.op, mc.which, 3 );
		for ( let i = 0; i < 3; i++ ) {
			assert.ok( Math.abs( out.d[ i ] - expected[ i ] ) <= 1e-10 * Math.abs( expected[ i ] ), 'd[' + i + '] = ' + out.d[ i ] + ' matches ' + expected[ i ] );
			const res = residual( NB, STIFF, mc.M, out.d[ i ], out.Z, i * NB );
			assert.ok( res <= 1e-9 * Math.abs( out.d[ i ] ), 'residual of eigenpair ' + i + ' is small (' + res + ')' );
		}
	});
}


// ERROR AND EARLY-RETURN TESTS //

test( 'dsband: a mode inconsistent with bmat (iparam[6] = 6) returns the input info without iterating', function t() {
	const out = solve({
		'A': STIFF,
		'M': MASSB,
		'mode': 6,
		'bmat': 'generalized',
		'infoIn': 1
	});
	assert.strictEqual( out.info, 1, 'info is returned unchanged' );
	assert.strictEqual( out.nconv, 0, 'iparam[4] untouched' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

const SINGULAR = [
	// Standard shift-invert with sigma = 0 on a zero A: A - sigma*I is singular.
	[ 'mode 3 (standard), A - sigma*I', { 'A': new Float64Array( NB * NB ), 'M': EYEB, 'mode': 3, 'bmat': 'standard' } ],
	// Generalized regular inverse with a zero M.
	[ 'mode 2, M', { 'A': STIFF, 'M': new Float64Array( NB * NB ), 'mode': 2, 'bmat': 'generalized' } ],
	// Generalized shift-invert with A = sigma*M.
	[ 'mode 3 (generalized), A - sigma*M', { 'A': MASSB.map( ( x ) => 2.0 * x ), 'M': MASSB, 'mode': 3, 'bmat': 'generalized', 'sigma': 2.0 } ]
];

for ( const [ name, o ] of SINGULAR ) {
	test( 'dsband: a singular ' + name + ' (dgbtrf failure) returns the input info without iterating', function t() {
		const out = solve( Object.assign( { 'infoIn': 1 }, o ) );
		assert.strictEqual( out.info, 1, 'info is returned unchanged' );
		assert.strictEqual( out.nconv, 0, 'iparam[4] untouched' );
		assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
	});
}

test( 'dsband: returns the dsaupd error code (ncv > N gives info = -3)', function t() {
	const out = solve({
		'A': STIFF,
		'M': EYEB,
		'mode': 1,
		'bmat': 'standard',
		'ncv': NB + 1
	});
	assert.strictEqual( out.info, -3, 'info is -3' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'dsband: returns info = 1 and skips dseupd when the iteration limit is reached with nothing converged', function t() {
	const out = solve({
		'A': STIFF,
		'M': EYEB,
		'mode': 1,
		'bmat': 'standard',
		'which': 'BE',
		'ncv': 4,
		'mxiter': 1
	});
	assert.strictEqual( out.info, 1, 'info is 1' );
	assert.strictEqual( out.nconv, 0, 'nothing converged' );
	assert.strictEqual( out.iter, 2, 'iparam[2] returns the iterations taken (the reference stops once ITER > MXITER)' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched (dseupd not called)' );
});

test( 'dsband: returns the dseupd error code when dseupd fails', async function t() {
	const m = await importWithDependencies( new URL( './../lib/base.js', import.meta.url ), {
		'./../../dseupd/lib/base.js': function dseupdFails() {
			return -14;
		}
	});
	const out = solve({
		'A': STIFF,
		'M': EYEB,
		'mode': 1,
		'bmat': 'standard',
		'which': 'LA'
	}, m.default );
	assert.strictEqual( out.info, -14, 'info is the dseupd error code' );
	assert.ok( out.d.every( ( x ) => x === -999.0 ), 'd untouched' );
});

test( 'dsband: an IWORK shorter than the documented N throws RangeError (ticket 0107)', function t() {
	const inp = Object.assign( {}, INPUTS.std_shiftinv_n16, { 'iworkLength': 15 } );
	assert.throws( function throws() {
		run( inp );
	}, /IWORK array must have at least 16 elements from offset 0/ );
});
