/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zlaswp from './../lib/zlaswp.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'zlaswp is a function', function t() {
	assert.strictEqual( typeof zlaswp, 'function', 'is a function' );
});

test( 'zlaswp has expected arity', function t() {
	assert.strictEqual( zlaswp.length, 9, 'has expected arity' );
});

test( 'zlaswp throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zlaswp( 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, TypeError );
});

test( 'zlaswp throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zlaswp( 'row-major', -1, new Float64Array( 4 ), 2, 2, 2, new Float64Array( 4 ), 1, 2 );
	}, RangeError );
});

test( 'zlaswp locates a negative-stride IPIV of length |k2-k1|+1 (ticket 0068)', function t() {
	// [ N, k1, k2, incx, IPIV (in application order) ]: N differs from the
	// number of pivots, so an offset of (N-1)*|stride| reads the wrong entries.
	const cases = [
		[ 3, 0, 1, 1, [ 2, 3 ] ],
		[ 3, 1, 0, -1, [ 3, 2 ] ],
		[ 1, 0, 2, 1, [ 3, 2, 3 ] ]
	];
	cases.forEach( function each( c ) {
		const N = c[ 0 ];
		const k1 = c[ 1 ];
		const k2 = c[ 2 ];
		const incx = c[ 3 ];
		const piv = c[ 4 ];
		const np = piv.length;
		const LDA = 4;
		const raw = new Float64Array( 2 * LDA * N );
		const IPIVr = new Int32Array( np );
		let A1;
		let A2;
		let i;
		for ( i = 0; i < raw.length; i++ ) {
			raw[ i ] = i + 1;
		}
		for ( i = 0; i < np; i++ ) {
			IPIVr[ i ] = piv[ np - 1 - i ];
		}
		A1 = new Complex128Array( raw );
		A2 = new Complex128Array( raw );
		zlaswp( 'column-major', N, A1, LDA, k1, k2, IPIVr, -1, incx );
		ndarray( N, A2, 1, LDA, 0, k1, k2, new Int32Array( piv ), 1, 0, incx );
		const v1 = reinterpret( A1, 0 );
		const v2 = reinterpret( A2, 0 );
		assert.notDeepStrictEqual( v2, raw, 'rows were interchanged' );
		for ( i = 0; i < v1.length; i++ ) {
			assert.strictEqual( v1[ i ], v2[ i ], 'A[' + i + ']' );
		}
	});
});
