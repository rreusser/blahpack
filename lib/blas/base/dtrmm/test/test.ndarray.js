/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import dtrmm from './../lib/ndarray.js';
const ndarray = dtrmm;

import left_upper_n from './fixtures/left_upper_n.json' with { type: 'json' };
import left_lower_n from './fixtures/left_lower_n.json' with { type: 'json' };
import left_upper_t from './fixtures/left_upper_t.json' with { type: 'json' };
import left_lower_t from './fixtures/left_lower_t.json' with { type: 'json' };
import right_upper_n from './fixtures/right_upper_n.json' with { type: 'json' };
import right_lower_n from './fixtures/right_lower_n.json' with { type: 'json' };
import right_upper_t from './fixtures/right_upper_t.json' with { type: 'json' };
import right_lower_t from './fixtures/right_lower_t.json' with { type: 'json' };
import alpha_zero from './fixtures/alpha_zero.json' with { type: 'json' };
import unit_diag from './fixtures/unit_diag.json' with { type: 'json' };

const fixtures = {
	'left_upper_n': left_upper_n,
	'left_lower_n': left_lower_n,
	'left_upper_t': left_upper_t,
	'left_lower_t': left_lower_t
};

/**
* Asserts that two arrays are element-wise approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertArrayClose( actual, expected, tol, msg ) {
	let relErr, i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 ); // eslint-disable-line max-len
		if ( relErr > tol ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] ); // eslint-disable-line max-len
		}
	}
}

/**
* SetupTriUpper3.
*
* @private
* @param {*} a - a
*/
function setupTriUpper3( a ) {
	// Upper tri 3x3 col-major LDA=3: [2 3 4; 0 5 6; 0 0 7]
	a[ 0 ] = 2; a[ 3 ] = 3; a[ 6 ] = 4;
	a[ 4 ] = 5; a[ 7 ] = 6;
	a[ 8 ] = 7;
}

/**
* SetupTriLower3.
*
* @private
* @param {*} a - a
*/
function setupTriLower3( a ) {
	// Lower tri 3x3 col-major LDA=3: [2 0 0; 3 5 0; 4 6 7]
	a[ 0 ] = 2; a[ 1 ] = 3; a[ 2 ] = 4;
	a[ 4 ] = 5; a[ 5 ] = 6;
	a[ 8 ] = 7;
}

/**
* SetupB3x2.
*
* @private
* @param {*} b - b
*/
function setupB3x2( b ) {
	b[ 0 ] = 1; b[ 1 ] = 2; b[ 2 ] = 3;
	b[ 3 ] = 4; b[ 4 ] = 5; b[ 5 ] = 6;
}

const cases = [
	{
		'name': 'left_upper_n',
		's': 'left',
		'u': 'upper',
		't': 'no-transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriUpper3,
		'aLda': 3
	}, // eslint-disable-line max-len
	{
		'name': 'left_lower_n',
		's': 'left',
		'u': 'lower',
		't': 'no-transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriLower3,
		'aLda': 3
	}, // eslint-disable-line max-len
	{
		'name': 'left_upper_t',
		's': 'left',
		'u': 'upper',
		't': 'transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriUpper3,
		'aLda': 3
	}, // eslint-disable-line max-len
	{
		'name': 'left_lower_t',
		's': 'left',
		'u': 'lower',
		't': 'transpose',
		'd': 'non-unit',
		'm': 3,
		'n': 2,
		'al': 1,
		'aFn': setupTriLower3,
		'aLda': 3
	} // eslint-disable-line max-len
];

cases.forEach( function forEach( c ) {
	test( 'dtrmm: ' + c.name, function t() {
		const tc = fixtures[ c.name ];
		const a = new Float64Array( 16 );
		const b = new Float64Array( 16 );
		c.aFn( a );
		setupB3x2( b );
		dtrmm( c.s, c.u, c.t, c.d, c.m, c.n, c.al, a, 1, c.aLda, 0, b, 1, 3, 0 );
		assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
	});
});

test( 'dtrmm: right upper N', function t() {

	const tc = right_upper_n;
	const a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 2 ] = 3;
	a[ 3 ] = 5;
	const b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'upper', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: right lower N', function t() {

	const tc = right_lower_n;
	const a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 1 ] = 3;
	a[ 3 ] = 5;
	const b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'lower', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: right upper T', function t() {

	const tc = right_upper_t;
	const a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 2 ] = 3;
	a[ 3 ] = 5;
	const b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'upper', 'transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: right lower T', function t() {

	const tc = right_lower_t;
	const a = new Float64Array( 16 );
	a[ 0 ] = 2;
	a[ 1 ] = 3;
	a[ 3 ] = 5;
	const b = new Float64Array( 16 );
	b[ 0 ] = 1;
	b[ 1 ] = 2;
	b[ 2 ] = 3;
	b[ 3 ] = 4;
	b[ 4 ] = 5;
	b[ 5 ] = 6;
	dtrmm( 'right', 'lower', 'transpose', 'non-unit', 3, 2, 1.0, a, 1, 2, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: alpha=0', function t() {

	const tc = alpha_zero;
	const a = new Float64Array( 16 );
	setupTriUpper3( a );
	const b = new Float64Array( 16 );
	setupB3x2( b );
	dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, 0.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

test( 'dtrmm: M=0 quick return', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( [ 99 ] );
	dtrmm( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, 1.0, a, 1, 1, 0, b, 1, 1, 0 ); // eslint-disable-line max-len
	if ( b[ 0 ] !== 99 ) {
		throw new Error( 'B changed on M=0' );
	}
});

test( 'dtrmm: unit diag', function t() {

	const tc = unit_diag;
	const a = new Float64Array( 16 );
	a[ 0 ] = 99;
	a[ 3 ] = 3;
	a[ 6 ] = 4;
	a[ 4 ] = 99;
	a[ 7 ] = 6;
	a[ 8 ] = 99;
	const b = new Float64Array( 16 );
	setupB3x2( b );
	dtrmm( 'left', 'upper', 'no-transpose', 'unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b, 0, tc.b.length ), tc.b, 1e-14, 'B' ); // eslint-disable-line max-len
});

// NDARRAY VALIDATION TESTS //

test( 'ndarray: throws TypeError for invalid side', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'invalid', 'upper', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid uplo', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'invalid', 'no-transpose', 'non-unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid transa', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'invalid', 'non-unit', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws TypeError for invalid diag', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'invalid', 3, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, TypeError );
});

test( 'ndarray: throws RangeError for negative M', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', -1, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

test( 'ndarray: throws RangeError for negative N', function t() {
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	assert.throws( function f() {
		ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 3, -1, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	}, RangeError );
});

// TILED-PATH TESTS //

/**
* Returns op(A)[r][c] for a triangular matrix, honoring the stored triangle and unit diagonal.
*
* @private
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {Float64Array} A - triangular matrix
* @param {integer} sa1 - stride of first dimension
* @param {integer} sa2 - stride of second dimension
* @param {NonNegativeInteger} r - row index of op(A)
* @param {NonNegativeInteger} c - column index of op(A)
* @returns {number} op(A)[r][c]
*/
function entA( uplo, transa, diag, A, sa1, sa2, r, c ) {
	let rr, cc;
	if ( transa === 'no-transpose' ) {
		rr = r;
		cc = c;
	} else {
		rr = c;
		cc = r;
	}
	if ( rr === cc ) {
		return ( diag === 'unit' ) ? 1.0 : A[ ( rr * sa1 ) + ( cc * sa2 ) ];
	}
	if ( ( uplo === 'upper' && rr < cc ) || ( uplo === 'lower' && rr > cc ) ) {
		return A[ ( rr * sa1 ) + ( cc * sa2 ) ];
	}
	return 0.0;
}

/**
* Naive reference dtrmm: B := alpha*op(A)*B or B := alpha*B*op(A), in-place.
*
* @private
* @param {string} side - `'left'` or `'right'`
* @param {string} uplo - `'upper'` or `'lower'`
* @param {string} transa - `'no-transpose'` or `'transpose'`
* @param {string} diag - `'unit'` or `'non-unit'`
* @param {NonNegativeInteger} M - number of rows of B
* @param {NonNegativeInteger} N - number of columns of B
* @param {number} alpha - scalar multiplier
* @param {Float64Array} A - triangular matrix
* @param {integer} sa1 - stride of first dimension of A
* @param {integer} sa2 - stride of second dimension of A
* @param {Float64Array} B - matrix, modified in-place
* @param {integer} sb1 - stride of first dimension of B
* @param {integer} sb2 - stride of second dimension of B
* @returns {Float64Array} B
*/
function naiveTrmm( side, uplo, transa, diag, M, N, alpha, A, sa1, sa2, B, sb1, sb2 ) { // eslint-disable-line max-params
	let sum, i, j, l;
	const Bold = [];
	for ( i = 0; i < M; i++ ) {
		Bold.push( [] );
		for ( j = 0; j < N; j++ ) {
			Bold[ i ].push( B[ ( i * sb1 ) + ( j * sb2 ) ] );
		}
	}
	const K = ( side === 'left' ) ? M : N;
	for ( i = 0; i < M; i++ ) {
		for ( j = 0; j < N; j++ ) {
			sum = 0.0;
			for ( l = 0; l < K; l++ ) {
				if ( side === 'left' ) {
					sum += entA( uplo, transa, diag, A, sa1, sa2, i, l ) * Bold[ l ][ j ];
				} else {
					sum += Bold[ i ][ l ] * entA( uplo, transa, diag, A, sa1, sa2, l, j );
				}
			}
			B[ ( i * sb1 ) + ( j * sb2 ) ] = alpha * sum;
		}
	}
	return B;
}

test( 'ndarray: tiled main paths + remainders (9x7 and 12x12, all side/uplo/transa/diag combos, both layouts)', function t() {
	let expected, stored, transa, layout, side, uplo, diag, Bact, msg, sa1, sa2;
	let sb1, sb2, sh, cs, A, M, N, K, i, r, c;
	const shapes = [ [ 9, 7 ], [ 12, 12 ] ];
	for ( sh = 0; sh < shapes.length; sh++ ) {
		M = shapes[ sh ][ 0 ];
		N = shapes[ sh ][ 1 ];
		for ( cs = 0; cs < 32; cs++ ) {
			side = ( cs & 1 ) ? 'right' : 'left';
			uplo = ( cs & 2 ) ? 'lower' : 'upper';
			transa = ( cs & 4 ) ? 'transpose' : 'no-transpose';
			diag = ( cs & 8 ) ? 'unit' : 'non-unit';
			layout = ( cs & 16 ) ? 'row' : 'col';
			K = ( side === 'left' ) ? M : N;
			sa1 = ( layout === 'col' ) ? 1 : K;
			sa2 = ( layout === 'col' ) ? K : 1;
			sb1 = ( layout === 'col' ) ? 1 : N;
			sb2 = ( layout === 'col' ) ? M : 1;
			// Poison the unstored triangle (and the diagonal for `diag` = 'unit') with NaN so any illegal read of A fails loudly:
			A = new Float64Array( K * K );
			for ( r = 0; r < K; r++ ) {
				for ( c = 0; c < K; c++ ) {
					stored = ( uplo === 'upper' ) ? ( r <= c ) : ( r >= c );
					if ( r === c ) {
						A[ ( r * sa1 ) + ( c * sa2 ) ] = ( diag === 'unit' ) ? NaN : 2.0 + Math.sin( r + 1.0 );
					} else if ( stored ) {
						A[ ( r * sa1 ) + ( c * sa2 ) ] = Math.sin( ( r * K ) + c + 1.0 ) / K;
					} else {
						A[ ( r * sa1 ) + ( c * sa2 ) ] = NaN;
					}
				}
			}
			Bact = new Float64Array( M * N );
			for ( i = 0; i < M * N; i++ ) {
				Bact[ i ] = Math.cos( i + 0.5 );
			}
			expected = naiveTrmm( side, uplo, transa, diag, M, N, 0.7, A, sa1, sa2, new Float64Array( Bact ), sb1, sb2 );
			ndarray( side, uplo, transa, diag, M, N, 0.7, A, sa1, sa2, 0, Bact, sb1, sb2, 0 );
			msg = M + 'x' + N + ' ' + side + '/' + uplo + '/' + transa + '/' + diag + '/' + layout + ' B';
			assertArrayClose( Bact, expected, 1e-12, msg );
		}
	}
});

test( 'ndarray: empty matrices (M=0 or N=0) leave B untouched', function t() {
	let i;
	const a = new Float64Array( 16 );
	const b = new Float64Array( 16 );
	for ( i = 0; i < b.length; i++ ) {
		b[ i ] = i + 1.0;
	}
	const expected = Array.prototype.slice.call( b );
	ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 3, 0, 1.0, a, 1, 3, 0, b, 1, 3, 0 ); // eslint-disable-line max-len
	assertArrayClose( Array.prototype.slice.call( b ), expected, 0.0, 'B' );
});
