/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import Int32Array from '@stdlib/array/int32/lib/index.js';
import dtrsen from './../lib/dtrsen.js';
import ndarray from './../lib/ndarray.js';


// TESTS //

test( 'dtrsen is a function', function t() {
	assert.strictEqual( typeof dtrsen, 'function', 'is a function' );
});

test( 'dtrsen has expected arity', function t() {
	assert.strictEqual( dtrsen.length, 19, 'has expected arity' );
});

test( 'dtrsen throws RangeError for negative N', function t() {
	assert.throws( function throws() {
		dtrsen( 'column-major', 'none', 'none', new Float64Array( 4 ), 1, -1, new Float64Array( 4 ), 2, new Float64Array( 4 ), 2, new Float64Array( 4 ), 1, new Float64Array( 4 ), 1, new Float64Array( 4 ), 2, 2, new Float64Array( 4 ), new Float64Array( 4 ) );
	}, RangeError );
});

test( 'dtrsen allocates a sufficient workspace when WORK and IWORK are null (ticket 0096)', function t() { // eslint-disable-line max-len
	const jobs = [ 'none', 'eigenvalues', 'subspace', 'both' ];
	let T1, T2, Q1, Q2, a, b, i, j;
	for ( j = 0; j < jobs.length; j++ ) {
		T1 = new Float64Array([ 4.0, -1.5, 0.0, 0.0, 1.5, 4.0, 0.0, 0.0, 0.3, 0.4, 1.0, 0.0, 0.2, 0.1, 0.5, 2.0 ]); // eslint-disable-line max-len
		T2 = new Float64Array( T1 );
		Q1 = new Float64Array([ 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1 ]);
		Q2 = new Float64Array( Q1 );
		a = [ new Float64Array( 4 ), new Float64Array( 4 ), new Int32Array( 1 ), new Float64Array( 1 ), new Float64Array( 1 ) ]; // eslint-disable-line max-len
		b = [ new Float64Array( 4 ), new Float64Array( 4 ), new Int32Array( 1 ), new Float64Array( 1 ), new Float64Array( 1 ) ]; // eslint-disable-line max-len
		dtrsen( 'column-major', jobs[ j ], 'update', new Uint8Array([ 0, 1, 0, 1 ]), 1, 4, T1, 4, Q1, 4, a[ 0 ], 1, a[ 1 ], 1, a[ 2 ], a[ 3 ], a[ 4 ], null, null ); // eslint-disable-line max-len
		ndarray( jobs[ j ], 'update', new Uint8Array([ 0, 1, 0, 1 ]), 1, 0, 4, T2, 1, 4, 0, Q2, 1, 4, 0, b[ 0 ], 1, 0, b[ 1 ], 1, 0, b[ 2 ], b[ 3 ], b[ 4 ], new Float64Array( 100 ), 1, 0, new Int32Array( 100 ), 1, 0 ); // eslint-disable-line max-len
		assert.deepEqual( T1, T2, jobs[ j ] );
		assert.deepEqual( Q1, Q2, jobs[ j ] );
		for ( i = 0; i < a.length; i++ ) {
			assert.deepEqual( a[ i ], b[ i ], jobs[ j ] + ' output ' + i );
		}
	}
});
