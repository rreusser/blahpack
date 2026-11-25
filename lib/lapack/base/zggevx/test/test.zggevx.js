
/* eslint-disable no-restricted-syntax, stdlib/first-unit-test, max-len, max-params, max-lines, max-statements, max-lines-per-function */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zggevx from './../lib/zggevx.js';


// FUNCTIONS //

function mkMat( arr ) {
	return new Complex128Array( new Float64Array( arr ) );
}


// TESTS //

test( 'zggevx is a function', function t() {
	assert.strictEqual( typeof zggevx, 'function', 'is a function' );
});

test( 'zggevx: column-major basic 2x2 diag, no vectors', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	const B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	const ALPHA = new Complex128Array( 2 );
	const BETA = new Complex128Array( 2 );
	const VL = new Complex128Array( 4 );
	const VR = new Complex128Array( 4 );
	const LSCALE = new Float64Array( 2 );
	const RSCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	const r = zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, A, 2, B, 2, ALPHA, 1, BETA, 1, VL, 2, VR, 2, ilo, ihi, LSCALE, 1, RSCALE, 1, abnrm, bbnrm, RCONDE, 1, RCONDV, 1, null, null, null, null );
	assert.equal( r, 0, 'info' );
});

test( 'zggevx: row-major basic 2x2 diag, compute vectors', function t() {
	const ilo = new Int32Array( 1 );
	const ihi = new Int32Array( 1 );
	const abnrm = new Float64Array( 1 );
	const bbnrm = new Float64Array( 1 );
	const A = mkMat( [ 4.0, 0.0, 0.0, 0.0, 0.0, 0.0, 6.0, 0.0 ] );
	const B = mkMat( [ 2.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.0, 0.0 ] );
	const ALPHA = new Complex128Array( 2 );
	const BETA = new Complex128Array( 2 );
	const VL = new Complex128Array( 4 );
	const VR = new Complex128Array( 4 );
	const LSCALE = new Float64Array( 2 );
	const RSCALE = new Float64Array( 2 );
	const RCONDE = new Float64Array( 2 );
	const RCONDV = new Float64Array( 2 );
	const r = zggevx( 'row-major', 'both', 'compute-vectors', 'compute-vectors', 'none', 2, A, 2, B, 2, ALPHA, 1, BETA, 1, VL, 2, VR, 2, ilo, ihi, LSCALE, 1, RSCALE, 1, abnrm, bbnrm, RCONDE, 1, RCONDV, 1, null, null, null, null );
	assert.equal( r, 0, 'info' );
});

test( 'zggevx throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		zggevx( 'invalid', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null, null, null );
	}, TypeError );
});

test( 'zggevx throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', -1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null, null, null );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDA < N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null, null, null );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDB < N', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null, null, null );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDVL < 1', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 0, new Complex128Array( 4 ), 2, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null, null, null );
	}, RangeError );
});

test( 'zggevx throws RangeError when LDVR < 1', function t() {
	assert.throws( function throws() {
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		zggevx( 'column-major', 'none', 'no-vectors', 'no-vectors', 'none', 2, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 2, new Complex128Array( 2 ), 1, new Complex128Array( 2 ), 1, new Complex128Array( 4 ), 2, new Complex128Array( 4 ), 0, ilo, ihi, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, abnrm, bbnrm, new Float64Array( 2 ), 1, new Float64Array( 2 ), 1, null, null, null, null );
	}, RangeError );
});

test( 'zggevx: N=33 (> NB=32) with WORK = null matches an ample explicit WORK (both orders)', function t() {
	const N = 33;
	const ORDERS = [ 'column-major', 'row-major' ];
	let oi;
	let i;
	function make( seed ) {
		const out = [];
		let x = seed;
		let n;
		for ( n = 0; n < 2 * N * N; n++ ) {
			x = ( ( x * 1103515245 ) + 12345 ) % 2147483648;
			out.push( ( x / 2147483648 ) - 0.5 );
		}
		return out;
	}
	function run( order, work ) {
		const ALPHA = new Complex128Array( N );
		const BETA = new Complex128Array( N );
		const VL = new Complex128Array( N * N );
		const VR = new Complex128Array( N * N );
		const ilo = new Int32Array( 1 );
		const ihi = new Int32Array( 1 );
		const abnrm = new Float64Array( 1 );
		const bbnrm = new Float64Array( 1 );
		const info = zggevx( order, 'both', 'compute-vectors', 'compute-vectors', 'none', N, mkMat( make( 3 ) ), N, mkMat( make( 5 ) ), N, ALPHA, 1, BETA, 1, VL, N, VR, N, ilo, ihi, new Float64Array( N ), 1, new Float64Array( N ), 1, abnrm, bbnrm, new Float64Array( N ), 1, new Float64Array( N ), 1, work, null, null, null );
		return [ info, ilo[ 0 ], ihi[ 0 ], abnrm[ 0 ], bbnrm[ 0 ] ].concat( Array.from( reinterpret( ALPHA, 0 ) ), Array.from( reinterpret( BETA, 0 ) ), Array.from( reinterpret( VL, 0 ) ), Array.from( reinterpret( VR, 0 ) ) );
	}
	for ( oi = 0; oi < ORDERS.length; oi++ ) {
		const got = run( ORDERS[ oi ], null );
		const expected = run( ORDERS[ oi ], new Complex128Array( 4 * ( N + ( N * 32 ) + ( 33 * 32 ) ) ) );
		assert.equal( got[ 0 ], 0, 'info' );
		assert.equal( got.length, expected.length, 'length' );
		for ( i = 0; i < expected.length; i++ ) {
			assert.ok( Math.abs( got[ i ] - expected[ i ] ) <= 1e-12 * Math.max( Math.abs( expected[ i ] ), 1.0 ), ORDERS[ oi ] + ' [' + i + ']: expected ' + expected[ i ] + ', got ' + got[ i ] );
		}
	}
});
