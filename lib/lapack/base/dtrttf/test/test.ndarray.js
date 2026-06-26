

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrttf from './../lib/ndarray.js';

// FIXTURES //

import n5_n_l from './fixtures/n5_n_l.json' with { type: 'json' };
import n5_t_l from './fixtures/n5_t_l.json' with { type: 'json' };
import n5_n_u from './fixtures/n5_n_u.json' with { type: 'json' };
import n5_t_u from './fixtures/n5_t_u.json' with { type: 'json' };
import n6_n_l from './fixtures/n6_n_l.json' with { type: 'json' };
import n6_t_l from './fixtures/n6_t_l.json' with { type: 'json' };
import n6_n_u from './fixtures/n6_n_u.json' with { type: 'json' };
import n6_t_u from './fixtures/n6_t_u.json' with { type: 'json' };
import dtfttr from './../../dtfttr/lib/base.js';
var ndarray = dtrttf;
import wrapper from './../lib/dtrttf.js';

// FUNCTIONS //

function assertArrayEqual( actual, expected, msg ) {
	var i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i += 1 ) {
		assert.equal( actual[ i ], expected[ i ], msg + '[' + i + ']' );
	}
}

/**
* Flattens a column-major N-by-N matrix stored as flat array with LDA=N into a Float64Array.
*
* @private
* @param {Array} flat - column-major flat array of length N*N
* @param {number} N - order of the matrix
* @returns {Float64Array} Float64Array view
*/
function matrixFromFlat( flat, N ) {
	return new Float64Array( flat );
}

// TESTS //

test( 'dtrttf is a function', function t() {
	assert.equal( typeof dtrttf, 'function' );
});

test( 'dtrttf: N=0 quick return', function t() {
	var info;
	var ARF;
	var A;

	A = new Float64Array( 0 );
	ARF = new Float64Array( 0 );
	info = dtrttf( 'no-transpose', 'lower', 0, A, 1, 1, 0, 1, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dtrttf: N=1 quick return', function t() {
	var info;
	var ARF;
	var A;

	A = new Float64Array( [ 42.0 ] );
	ARF = new Float64Array( 1 );
	info = dtrttf( 'no-transpose', 'lower', 1, A, 1, 1, 0, 1, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( ARF[ 0 ], 42.0, 'arf0' );
});

test( 'dtrttf: N=5, no-transpose, lower (odd, normal, lower)', function t() {
	var tc = n5_n_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=5, transpose, lower (odd, transpose, lower)', function t() {
	var tc = n5_t_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=5, no-transpose, upper (odd, normal, upper)', function t() {
	var tc = n5_n_u;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'no-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=5, transpose, upper (odd, transpose, upper)', function t() {
	var tc = n5_t_u;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=6, no-transpose, lower (even, normal, lower)', function t() {
	var tc = n6_n_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=6, transpose, lower (even, transpose, lower)', function t() {
	var tc = n6_t_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=6, no-transpose, upper (even, normal, upper)', function t() {
	var tc = n6_n_u;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'no-transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=6, transpose, upper (even, transpose, upper)', function t() {
	var tc = n6_t_u;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = matrixFromFlat( tc.A, N );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'transpose', 'upper', N, A, 1, N, 0, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: N=2 minimal case (odd-even boundary)', function t() {
	var info;
	var ARF;
	var A;

	// N=2, lower, no-transpose: A = [[1,0],[2,3]] column-major = [1,2,0,3]
	A = new Float64Array( [ 1, 2, 0, 3 ] );
	ARF = new Float64Array( 3 );
	info = dtrttf( 'no-transpose', 'lower', 2, A, 1, 2, 0, 2, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );

	// N=2, upper, transpose
	A = new Float64Array( [ 10, 0, 20, 30 ] );
	ARF = new Float64Array( 3 );
	info = dtrttf( 'transpose', 'upper', 2, A, 1, 2, 0, 2, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
});

test( 'dtrttf: round-trip with dtfttr (all 4 combos, N=5)', function t() {
	var combos;
	var info;
	var ARF;
	var A2;
	var N;
	var A;
	var c;
	var i;
	var j;

	N = 5;
	combos = [
		[ 'no-transpose', 'lower' ],
		[ 'no-transpose', 'upper' ],
		[ 'transpose', 'lower' ],
		[ 'transpose', 'upper' ]
	];

	for ( c = 0; c < combos.length; c += 1 ) {
		// Build A with appropriate triangle:
		A = new Float64Array( N * N );
		if ( combos[ c ][ 1 ] === 'lower' ) {
			for ( j = 0; j < N; j += 1 ) {
				for ( i = j; i < N; i += 1 ) {
					A[ i + j * N ] = ( i + 1 ) * 10 + ( j + 1 );
				}
			}
		} else {
			for ( j = 0; j < N; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					A[ i + j * N ] = ( i + 1 ) * 10 + ( j + 1 );
				}
			}
		}

		// Convert TR -> RFP:
		ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
		info = dtrttf( combos[ c ][ 0 ], combos[ c ][ 1 ], N, A, 1, N, 0, N, ARF, 1, 0 );
		assert.equal( info, 0, 'info (' + combos[ c ][ 0 ] + ', ' + combos[ c ][ 1 ] + ')' );

		// Convert RFP -> TR:
		A2 = new Float64Array( N * N );
		info = dtfttr( combos[ c ][ 0 ], combos[ c ][ 1 ], N, ARF, 1, 0, A2, 1, N, 0, N );
		assert.equal( info, 0, 'dtfttr info (' + combos[ c ][ 0 ] + ', ' + combos[ c ][ 1 ] + ')' );

		// Verify round-trip:
		assertArrayEqual( Array.from( A2 ), Array.from( A ), 'round-trip (' + combos[ c ][ 0 ] + ', ' + combos[ c ][ 1 ] + ')' );
	}
});

test( 'dtrttf: round-trip with dtfttr (all 4 combos, N=6)', function t() {
	var combos;
	var info;
	var ARF;
	var A2;
	var N;
	var A;
	var c;
	var i;
	var j;

	N = 6;
	combos = [
		[ 'no-transpose', 'lower' ],
		[ 'no-transpose', 'upper' ],
		[ 'transpose', 'lower' ],
		[ 'transpose', 'upper' ]
	];

	for ( c = 0; c < combos.length; c += 1 ) {
		A = new Float64Array( N * N );
		if ( combos[ c ][ 1 ] === 'lower' ) {
			for ( j = 0; j < N; j += 1 ) {
				for ( i = j; i < N; i += 1 ) {
					A[ i + j * N ] = ( i + 1 ) * 10 + ( j + 1 );
				}
			}
		} else {
			for ( j = 0; j < N; j += 1 ) {
				for ( i = 0; i <= j; i += 1 ) {
					A[ i + j * N ] = ( i + 1 ) * 10 + ( j + 1 );
				}
			}
		}

		ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
		info = dtrttf( combos[ c ][ 0 ], combos[ c ][ 1 ], N, A, 1, N, 0, N, ARF, 1, 0 );
		assert.equal( info, 0, 'info (' + combos[ c ][ 0 ] + ', ' + combos[ c ][ 1 ] + ')' );

		A2 = new Float64Array( N * N );
		info = dtfttr( combos[ c ][ 0 ], combos[ c ][ 1 ], N, ARF, 1, 0, A2, 1, N, 0, N );
		assert.equal( info, 0, 'dtfttr info (' + combos[ c ][ 0 ] + ', ' + combos[ c ][ 1 ] + ')' );

		assertArrayEqual( Array.from( A2 ), Array.from( A ), 'round-trip (' + combos[ c ][ 0 ] + ', ' + combos[ c ][ 1 ] + ')' );
	}
});

test( 'dtrttf: N=1 with transpose, upper', function t() {
	var info;
	var ARF;
	var A;

	A = new Float64Array( [ 99.0 ] );
	ARF = new Float64Array( 1 );
	info = dtrttf( 'transpose', 'upper', 1, A, 1, 1, 0, 1, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assert.equal( ARF[ 0 ], 99.0, 'arf0' );
});

test( 'dtrttf: ndarray wrapper validates transr', function t() {
	assert.throws( function badTransr() {
		ndarray( 'invalid', 'lower', 3, new Float64Array( 9 ), 1, 3, 0, 3, new Float64Array( 6 ), 1, 0 );
	}, TypeError );
});

test( 'dtrttf: ndarray wrapper validates uplo', function t() {
	assert.throws( function badUplo() {
		ndarray( 'no-transpose', 'invalid', 3, new Float64Array( 9 ), 1, 3, 0, 3, new Float64Array( 6 ), 1, 0 );
	}, TypeError );
});

test( 'dtrttf: BLAS-style wrapper validates order', function t() {
	assert.throws( function badOrder() {
		wrapper( 'invalid', 'no-transpose', 'lower', 3, new Float64Array( 9 ), 3, new Float64Array( 6 ) );
	}, TypeError );
});

test( 'dtrttf: BLAS-style wrapper (column-major)', function t() {
	var tc = n5_n_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = new Float64Array( tc.A );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = wrapper( 'column-major', 'no-transpose', 'lower', N, A, N, ARF );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF' );
});

test( 'dtrttf: offsetA support', function t() {
	var tc = n5_n_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	// Prepend 3 padding elements
	A = new Float64Array( 3 + tc.A.length );
	A.set( tc.A, 3 );
	ARF = new Float64Array( ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'no-transpose', 'lower', N, A, 1, N, 3, N, ARF, 1, 0 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF ), tc.ARF, 'ARF with offsetA' );
});

test( 'dtrttf: offsetARF support', function t() {
	var tc = n5_n_l;
	var info;
	var ARF;
	var A;
	var N;

	N = tc.n;
	A = new Float64Array( tc.A );
	// Prepend 5 padding elements
	ARF = new Float64Array( 5 + ( N * ( N + 1 ) ) / 2 );
	info = dtrttf( 'no-transpose', 'lower', N, A, 1, N, 0, N, ARF, 1, 5 );
	assert.equal( info, 0, 'info' );
	assertArrayEqual( Array.from( ARF.subarray( 5 ) ), tc.ARF, 'ARF with offsetARF' );
});
