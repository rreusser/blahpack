/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
import zhpgst from './../lib/zhpgst.js';
import ndarray from './../lib/ndarray.js';


// FUNCTIONS //

/**
* Asserts that two complex arrays are element-wise identical.
*
* @private
* @param {Complex128Array} actual - actual value
* @param {Complex128Array} expected - expected value
* @param {string} msg - assertion message
*/
function assertSame( actual, expected, msg ) {
	const a = reinterpret( actual, 0 );
	const e = reinterpret( expected, 0 );
	let i;
	assert.strictEqual( a.length, e.length, msg + ': length' );
	for ( i = 0; i < e.length; i++ ) {
		assert.strictEqual( a[ i ], e[ i ], msg + '[' + i + ']' );
	}
}


// TESTS //

test( 'zhpgst is a function', function t() {
	assert.strictEqual( typeof zhpgst, 'function', 'is a function' );
});

test( 'zhpgst has expected arity', function t() {
	assert.strictEqual( zhpgst.length, 6, 'has expected arity' );
});

test( 'zhpgst throws TypeError for invalid uplo', function t() {
	assert.throws( function throws() {
		zhpgst( 'column-major', 2, 'invalid', new Float64Array( 4 ), new Float64Array( 4 ), new Float64Array( 4 ) );
	}, TypeError );
});

test( 'zhpgst throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		zhpgst( 'column-major', 2, 'upper', -1, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'zhpgst throws TypeError for invalid order', function t() {
	assert.throws( function throws() {
		zhpgst( 'invalid', 1, 'upper', 2, new Complex128Array( 3 ), new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpgst throws RangeError for invalid itype', function t() {
	assert.throws( function throws() {
		zhpgst( 'column-major', 4, 'upper', 2, new Complex128Array( 3 ), new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'zhpgst throws TypeError for row-major order (packed storage is column-major only)', function t() {
	assert.throws( function throws() {
		zhpgst( 'row-major', 1, 'upper', 2, new Complex128Array( 3 ), new Complex128Array( 3 ) ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'zhpgst (column-major) matches ndarray for all itype and uplo', function t() {
	// Hermitian A (3x3) and triangular Cholesky factor of B, packed column-major:
	const A = {
		'upper': [ 4, 0, 1, 2, 5, 0, -1, 1, 2, -3, 6, 0 ],
		'lower': [ 4, 0, 1, -2, -1, -1, 5, 0, 2, 3, 6, 0 ]
	};
	const B = {
		'upper': [ 2, 0, 0.5, 0.25, 1.5, 0, -0.3, 0.1, 0.2, -0.4, 1.25, 0 ],
		'lower': [ 2, 0, 0.5, -0.25, -0.3, -0.1, 1.5, 0, 0.2, 0.4, 1.25, 0 ]
	};
	const uplos = [ 'upper', 'lower' ];
	let itype;
	let info1;
	let info2;
	let AP1;
	let AP2;
	let BP;
	let u;
	let i;
	for ( itype = 1; itype <= 3; itype++ ) {
		for ( i = 0; i < uplos.length; i++ ) {
			u = uplos[ i ];
			AP1 = new Complex128Array( new Float64Array( A[ u ] ) );
			AP2 = new Complex128Array( new Float64Array( A[ u ] ) );
			BP = new Complex128Array( new Float64Array( B[ u ] ) );
			info1 = zhpgst( 'column-major', itype, u, 3, AP1, BP );
			info2 = ndarray( itype, u, 3, AP2, 1, 0, BP, 1, 0 );
			assert.strictEqual( info1, 0, 'info' );
			assert.strictEqual( info1, info2, 'info matches' );
			assertSame( AP1, AP2, 'itype=' + itype + ' ' + u );
			assert.notDeepStrictEqual( Array.from( reinterpret( AP1, 0 ) ), A[ u ], 'AP was transformed' ); // eslint-disable-line max-len
		}
	}
});
