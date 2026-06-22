import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgttrf from './../../zgttrf/lib/base.js';
import zgttrs from './../lib/ndarray.js';

// FIXTURES //

import notrans_single_rhs from './fixtures/notrans_single_rhs.json' with { type: 'json' };
import trans_single_rhs from './fixtures/trans_single_rhs.json' with { type: 'json' };
import conjtrans_single_rhs from './fixtures/conjtrans_single_rhs.json' with { type: 'json' };
import n_one from './fixtures/n_one.json' with { type: 'json' };
import pivot_multi_rhs from './fixtures/pivot_multi_rhs.json' with { type: 'json' };

function assertClose( actual, expected, tol, msg ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual );
}

function assertArrayClose( actual, expected, tol, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

function solveTridiag( trans, n, nrhs, dlArr, dArr, duArr, bArr ) {
	var dl = new Complex128Array( dlArr.length / 2 );
	var d = new Complex128Array( dArr.length / 2 );
	var du = new Complex128Array( duArr.length / 2 );
	var du2 = new Complex128Array( Math.max( n - 2, 0 ) );
	var B = new Complex128Array( n * nrhs );
	var ipiv = new Int32Array( n );
	var dlv = reinterpret( dl, 0 );
	var dv = reinterpret( d, 0 );
	var duv = reinterpret( du, 0 );
	var bv = reinterpret( B, 0 );
	var info;
	var i;

	for ( i = 0; i < dlArr.length; i++ ) { dlv[ i ] = dlArr[ i ]; }
	for ( i = 0; i < dArr.length; i++ ) { dv[ i ] = dArr[ i ]; }
	for ( i = 0; i < duArr.length; i++ ) { duv[ i ] = duArr[ i ]; }
	for ( i = 0; i < bArr.length; i++ ) { bv[ i ] = bArr[ i ]; }

	info = zgttrf( n, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0 );
	assert.equal( info, 0, 'zgttrf info' );

	info = zgttrs( trans, n, nrhs, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0, B, 2, 2 * n, 0 );
	assert.equal( info, 0, 'zgttrs info' );

	return bv;
}

test( 'zgttrs: no-transpose, single RHS (5x5)', function t() {
	var tc = notrans_single_rhs;
	var result = solveTridiag( 'no-transpose', 5, 1,
		[ -1, 0, -1, 0, -1, 0, -1, 0 ],
		[ 2, 1, 2, 1, 2, 1, 2, 1, 2, 1 ],
		[ -1, 0, -1, 0, -1, 0, -1, 0 ],
		[ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ]
	);
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zgttrs: transpose, single RHS (5x5)', function t() {
	var tc = trans_single_rhs;
	var result = solveTridiag( 'transpose', 5, 1,
		[ -1, 0, -1, 0, -1, 0, -1, 0 ],
		[ 2, 1, 2, 1, 2, 1, 2, 1, 2, 1 ],
		[ -1, 0, -1, 0, -1, 0, -1, 0 ],
		[ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ]
	);
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zgttrs: conjugate transpose, single RHS (5x5)', function t() {
	var tc = conjtrans_single_rhs;
	var result = solveTridiag( 'conjugate-transpose', 5, 1,
		[ -1, 0, -1, 0, -1, 0, -1, 0 ],
		[ 2, 1, 2, 1, 2, 1, 2, 1, 2, 1 ],
		[ -1, 0, -1, 0, -1, 0, -1, 0 ],
		[ 1, 0, 0, 0, 0, 0, 0, 0, 1, 0 ]
	);
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zgttrs: N=1', function t() {
	var tc = n_one;
	var result = solveTridiag( 'no-transpose', 1, 1, [], [ 5, 2 ], [], [ 10, 4 ] );
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});

test( 'zgttrs: N=0, quick return', function t() {
	var dl = new Complex128Array( 0 );
	var d = new Complex128Array( 0 );
	var du = new Complex128Array( 0 );
	var du2 = new Complex128Array( 0 );
	var B = new Complex128Array( 0 );
	var ipiv = new Int32Array( 0 );
	var info = zgttrs( 'no-transpose', 0, 1, dl, 1, 0, d, 1, 0, du, 1, 0, du2, 1, 0, ipiv, 1, 0, B, 2, 0, 0 );
	assert.equal( info, 0 );
});

test( 'zgttrs: pivoting forced, multiple RHS (5x5)', function t() {
	var tc = pivot_multi_rhs;
	var result = solveTridiag( 'no-transpose', 5, 2,
		[ 10, 1, 10, 1, 10, 1, 10, 1 ],
		[ 1, 0, 1, 0, 1, 0, 1, 0, 1, 0 ],
		[ 2, 0.5, 2, 0.5, 2, 0.5, 2, 0.5 ],
		[ 3, 1, 13, 2, 13, 2, 13, 2, 11, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0 ]
	);
	assertArrayClose( result, tc.B, 1e-14, 'B' );
});
