/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import zunmql from './../lib/zunmql.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zgeql2 from '../../zgeql2/lib/base.js';
import zunmqlNd from './../lib/ndarray.js';


// TESTS //

test( 'zunmql is a function', function t() {
	assert.strictEqual( typeof zunmql, 'function', 'is a function' );
});

test( 'zunmql has expected arity', function t() {
	assert.strictEqual( zunmql.length, 13, 'has expected arity' );
});

test( 'zunmql throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zunmql( 'invalid', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmql throws TypeError for invalid side', function t() {
	assert.throws( function throws() {
		zunmql( 'row-major', 'invalid', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmql throws TypeError for invalid trans', function t() {
	assert.throws( function throws() {
		zunmql( 'row-major', 'left', 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zunmql throws RangeError for negative M', function t() {
	assert.throws( function throws() {
		zunmql( 'row-major', 'left', 'no-transpose', -1, new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmql throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zunmql( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), -1, new Float64Array( 4 ), new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmql throws RangeError for negative K', function t() {
	assert.throws( function throws() {
		zunmql( 'row-major', 'left', 'no-transpose', new Float64Array( 4 ), new Float64Array( 4 ), -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zunmql: WORK = null allocates the optimal workspace (blocked path, K > NB)', function t() {
	const N = 40;
	const TAU = new Complex128Array( N );
	const A = new Complex128Array( N * N );
	const C0 = new Complex128Array( N * N );
	let i;
	const Av = reinterpret( A, 0 );
	const Cv = reinterpret( C0, 0 );
	for ( i = 0; i < 2 * N * N; i++ ) {
		Av[ i ] = Math.sin( ( 0.37 * i * i ) + 1.3 );
		Cv[ i ] = Math.cos( ( 0.23 * i ) + 0.7 );
	}
	zgeql2( N, N, A, 1, N, 0, TAU, 1, 0, new Complex128Array( N ), 1, 0 );
	[ 'left', 'right' ].forEach( function eachSide( side ) {
		[ 'no-transpose', 'conjugate-transpose' ].forEach( function eachTrans( trans ) {
			const expected = new Complex128Array( C0 );
			const C = new Complex128Array( C0 );
			zunmqlNd( side, trans, N, N, N, A, 1, N, 0, TAU, 1, 0, expected, 1, N, 0, new Complex128Array( ( N * 32 ) + 4160 ), 1, 0 );
			const info = zunmql( 'column-major', side, trans, N, N, N, A, N, TAU, 1, C, N, null );
			assert.strictEqual( info, 0, 'info' );
			assert.deepStrictEqual( reinterpret( C, 0 ), reinterpret( expected, 0 ), side + '/' + trans );
		});
	});
});
