/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import EPS from '@stdlib/constants/float64/eps/lib/index.js';
import dtrsyl from './../lib/ndarray.js';

// FIXTURES //

import nn_basic_2x2 from './fixtures/nn_basic_2x2.json' with { type: 'json' };
import nn_isgn__1 from './fixtures/nn_isgn_-1.json' with { type: 'json' };
import tn_basic from './fixtures/tn_basic.json' with { type: 'json' };
import tt_basic from './fixtures/tt_basic.json' with { type: 'json' };
import nt_basic from './fixtures/nt_basic.json' with { type: 'json' };
import m_0 from './fixtures/m_0.json' with { type: 'json' };
import n_0 from './fixtures/n_0.json' with { type: 'json' };
import nn_3x3_quasi_tri from './fixtures/nn_3x3_quasi-tri.json' with { type: 'json' };
import m_1_n_1 from './fixtures/m_1_n_1.json' with { type: 'json' };
import tn_3x3_quasi_tri from './fixtures/tn_3x3_quasi-tri.json' with { type: 'json' };
import tt_3x3_quasi_tri from './fixtures/tt_3x3_quasi-tri.json' with { type: 'json' };
import nt_3x3_quasi_tri from './fixtures/nt_3x3_quasi-tri.json' with { type: 'json' };
import nn_4x4_quasi_tri_both from './fixtures/nn_4x4_quasi-tri_both.json' with { type: 'json' };
import tn_4x4_quasi_tri_both from './fixtures/tn_4x4_quasi-tri_both.json' with { type: 'json' };
import tt_4x4_quasi_tri_both from './fixtures/tt_4x4_quasi-tri_both.json' with { type: 'json' };
import nt_4x4_quasi_tri_both from './fixtures/nt_4x4_quasi-tri_both.json' with { type: 'json' };
import nn_4x4_quasi_tri_both_isgn__1 from './fixtures/nn_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import tn_4x4_quasi_tri_both_isgn__1 from './fixtures/tn_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import tt_4x4_quasi_tri_both_isgn__1 from './fixtures/tt_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import nt_4x4_quasi_tri_both_isgn__1 from './fixtures/nt_4x4_quasi-tri_both_isgn_-1.json' with { type: 'json' };
import nn_4x4_scaled from './fixtures/nn_4x4_scaled.json' with { type: 'json' };
import nn_4x4_near_singular from './fixtures/nn_4x4_near-singular.json' with { type: 'json' };
import tn_4x4_scaled from './fixtures/tn_4x4_scaled.json' with { type: 'json' };
import tn_4x4_near_singular from './fixtures/tn_4x4_near-singular.json' with { type: 'json' };
import tt_4x4_scaled from './fixtures/tt_4x4_scaled.json' with { type: 'json' };
import tt_4x4_near_singular from './fixtures/tt_4x4_near-singular.json' with { type: 'json' };
import nt_4x4_scaled from './fixtures/nt_4x4_scaled.json' with { type: 'json' };
import nt_4x4_near_singular from './fixtures/nt_4x4_near-singular.json' with { type: 'json' };

// FUNCTIONS //

/**
* Asserts that two numbers are approximately equal.
*
* @private
* @param {*} actual - actual value
* @param {*} expected - expected value
* @param {number} tol - tolerance
* @param {string} msg - assertion message
*/
function assertClose( actual, expected, tol, msg ) {
	const relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 ); // eslint-disable-line max-len
	assert.ok( relErr <= tol, msg + ': expected ' + expected + ', got ' + actual + ' (relErr=' + relErr + ')' ); // eslint-disable-line max-len
}

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
	let i;
	assert.equal( actual.length, expected.length, msg + ': length mismatch' );
	for ( i = 0; i < expected.length; i++ ) {
		assertClose( actual[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

/**
* Pack an MxN submatrix from a column-major LDA array into a dense M*N column-major array.
*/
function packMatrix( C, LDA, M, N ) {
	const out = [];
	let i, j;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			out.push( C[ i + j * LDA ] );
		}
	}
	return out;
}

/**
* Build the 4x4 test matrix A with 2x2 blocks at (1,1)-(2,2) and (3,3)-(4,4).
* A(1,1)=1.0, A(1,2)=0.5, A(2,1)=-0.5, A(2,2)=1.0
* A(3,3)=3.0, A(3,4)=0.4, A(4,3)=-0.6, A(4,4)=3.0
* Upper part: A(1,3)=0.3, A(1,4)=0.1, A(2,3)=0.2, A(2,4)=0.05
*/
function buildA4( LDA ) {
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0; A[ 0 + 1*LDA ] = 0.5; A[ 0 + 2*LDA ] = 0.3; A[ 0 + 3*LDA ] = 0.1; // eslint-disable-line max-len
	A[ 1 + 0*LDA ] = -0.5; A[ 1 + 1*LDA ] = 1.0; A[ 1 + 2*LDA ] = 0.2; A[ 1 + 3*LDA ] = 0.05; // eslint-disable-line max-len
	A[ 2 + 2*LDA ] = 3.0; A[ 2 + 3*LDA ] = 0.4;
	A[ 3 + 2*LDA ] = -0.6; A[ 3 + 3*LDA ] = 3.0;
	return A;
}

/**
* Build the 4x4 test matrix B with a 2x2 block at (3,3)-(4,4).
* B(1,1)=2.0, B(1,2)=0.1, B(1,3)=0.2, B(1,4)=0.05
* B(2,2)=4.0, B(2,3)=0.3, B(2,4)=0.1
* B(3,3)=5.0, B(3,4)=0.7, B(4,3)=-0.7, B(4,4)=5.0
*/
function buildB4( LDA ) {
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0; B[ 0 + 1*LDA ] = 0.1; B[ 0 + 2*LDA ] = 0.2; B[ 0 + 3*LDA ] = 0.05; // eslint-disable-line max-len
	B[ 1 + 1*LDA ] = 4.0; B[ 1 + 2*LDA ] = 0.3; B[ 1 + 3*LDA ] = 0.1;
	B[ 2 + 2*LDA ] = 5.0; B[ 2 + 3*LDA ] = 0.7;
	B[ 3 + 2*LDA ] = -0.7; B[ 3 + 3*LDA ] = 5.0;
	return B;
}

/**
* BuildC4.
*
* @private
* @param {*} LDA - LDA
* @returns {*} result
*/
function buildC4( LDA ) {
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0; C[ 0 + 1*LDA ] = 2.0; C[ 0 + 2*LDA ] = 3.0; C[ 0 + 3*LDA ] = 4.0; // eslint-disable-line max-len
	C[ 1 + 0*LDA ] = 5.0; C[ 1 + 1*LDA ] = 6.0; C[ 1 + 2*LDA ] = 7.0; C[ 1 + 3*LDA ] = 8.0; // eslint-disable-line max-len
	C[ 2 + 0*LDA ] = 9.0; C[ 2 + 1*LDA ] = 10.0; C[ 2 + 2*LDA ] = 11.0; C[ 2 + 3*LDA ] = 12.0; // eslint-disable-line max-len
	C[ 3 + 0*LDA ] = 13.0; C[ 3 + 1*LDA ] = 14.0; C[ 3 + 2*LDA ] = 15.0; C[ 3 + 3*LDA ] = 16.0; // eslint-disable-line max-len
	return C;
}

/**
* Builds a 4x4 quasi-triangular A with a 1x1, a 2x2 (rows 2-3) and a 1x1 diagonal block.
*
* @private
* @param {integer} LDA - leading dimension
* @returns {Float64Array} matrix
*/
function buildAS( LDA ) {
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0; A[ 0 + 1*LDA ] = 0.5; A[ 0 + 2*LDA ] = 0.3; A[ 0 + 3*LDA ] = 0.1; // eslint-disable-line max-len
	A[ 1 + 1*LDA ] = 2.0; A[ 1 + 2*LDA ] = 0.4; A[ 1 + 3*LDA ] = 0.2;
	A[ 2 + 1*LDA ] = -0.6; A[ 2 + 2*LDA ] = 2.0; A[ 2 + 3*LDA ] = 0.3;
	A[ 3 + 3*LDA ] = 3.0;
	return A;
}

/**
* Builds a 4x4 quasi-triangular A whose 2x2 block (rows 2-3) has real eigenvalues 0 and 2.
*
* @private
* @param {integer} LDA - leading dimension
* @returns {Float64Array} matrix
*/
function buildAN( LDA ) {
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 1*LDA ] = 1.0; A[ 0 + 2*LDA ] = 0.3; A[ 0 + 3*LDA ] = 0.1;
	A[ 1 + 1*LDA ] = 1.0; A[ 1 + 2*LDA ] = 1.0; A[ 1 + 3*LDA ] = 0.2;
	A[ 2 + 1*LDA ] = 1.0; A[ 2 + 2*LDA ] = 1.0; A[ 2 + 3*LDA ] = 0.4;
	A[ 3 + 3*LDA ] = 3.0;
	return A;
}

/**
* Builds a 4x4 quasi-triangular B whose eigenvalues (0, 2, -2, -3) cancel those of `buildAN`.
*
* @private
* @param {integer} LDA - leading dimension
* @returns {Float64Array} matrix
*/
function buildBN( LDA ) {
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 1.0; B[ 0 + 1*LDA ] = 1.0; B[ 0 + 2*LDA ] = 0.2; B[ 0 + 3*LDA ] = 0.1; // eslint-disable-line max-len
	B[ 1 + 0*LDA ] = 1.0; B[ 1 + 1*LDA ] = 1.0; B[ 1 + 2*LDA ] = 0.3; B[ 1 + 3*LDA ] = 0.2; // eslint-disable-line max-len
	B[ 2 + 2*LDA ] = -2.0; B[ 2 + 3*LDA ] = 0.5;
	B[ 3 + 3*LDA ] = -3.0;
	return B;
}

/**
* Multiplies every element of a matrix by a factor, in place.
*
* @private
* @param {Float64Array} X - matrix
* @param {number} s - factor
* @returns {Float64Array} `X`
*/
function scaled( X, s ) {
	for ( let i = 0; i < X.length; i++ ) {
		X[ i ] *= s;
	}
	return X;
}

/**
* Converts a typed array to a plain array.
*
* @private
* @param {TypedArray} arr - input array
* @returns {Array} output array
*/
function toArray( arr ) {
	const out = [];
	let i;
	for ( i = 0; i < arr.length; i++ ) {
		out.push( arr[ i ] );
	}
	return out;
}

/**
* Builds a column-major `Float64Array` from a list of rows.
*
* @private
* @param {Array<Array<number>>} rows - matrix rows
* @returns {Float64Array} column-major matrix (leading dimension = number of rows)
*/
function fromRows( rows ) {
	const n = rows.length;
	const ncol = ( n === 0 ) ? 0 : rows[ 0 ].length;
	const out = new Float64Array( n * ncol );
	let i;
	let j;
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < ncol; j++ ) {
			out[ i + ( j * n ) ] = rows[ i ][ j ];
		}
	}
	return out;
}

/**
* Returns element `(i,j)` of `op(Z)` for a column-major `n`-by-`n` matrix `Z`.
*
* @private
* @param {Float64Array} Z - matrix
* @param {NonNegativeInteger} n - order
* @param {string} trans - `'no-transpose'` or `'transpose'`
* @param {NonNegativeInteger} i - row index
* @param {NonNegativeInteger} j - column index
* @returns {number} element
*/
function opElem( Z, n, trans, i, j ) {
	if ( trans === 'transpose' ) {
		return Z[ j + ( i * n ) ];
	}
	return Z[ i + ( j * n ) ];
}

/**
* Returns the infinity norm (max row sum) of a column-major `m`-by-`n` matrix.
*
* @private
* @param {Float64Array} Z - matrix
* @param {NonNegativeInteger} m - rows
* @param {NonNegativeInteger} n - columns
* @returns {number} norm
*/
function normInf( Z, m, n ) {
	let best = 0.0;
	let s;
	let i;
	let j;
	for ( i = 0; i < m; i++ ) {
		s = 0.0;
		for ( j = 0; j < n; j++ ) {
			s += Math.abs( Z[ i + ( j * m ) ] );
		}
		best = Math.max( best, s );
	}
	return best;
}

/**
* Computes the residual `op(A)*X + isgn*X*op(B) - scale*C` (infinity norm) and the backward-stability bound `(||A|| + ||B||) * ||X||` for the solution `X` of the Sylvester equation.
*
* @private
* @param {string} trana - transpose option for `A`
* @param {string} tranb - transpose option for `B`
* @param {integer} isgn - sign
* @param {NonNegativeInteger} M - order of `A`
* @param {NonNegativeInteger} N - order of `B`
* @param {Float64Array} A - original `A` (column-major, LDA = M)
* @param {Float64Array} B - original `B` (column-major, LDB = N)
* @param {Float64Array} C - original right-hand side (column-major, LDC = M)
* @param {Float64Array} X - computed solution (column-major, LDX = M)
* @param {number} scale - returned scale factor
* @returns {Object} `{ res, bound }`
*/
function sylvesterResidual( trana, tranb, isgn, M, N, A, B, C, X, scale ) {
	const R = new Float64Array( M * N );
	let s;
	let i;
	let j;
	let k;
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			s = -scale * C[ i + ( j * M ) ];
			for ( k = 0; k < M; k++ ) {
				s += opElem( A, M, trana, i, k ) * X[ k + ( j * M ) ];
			}
			for ( k = 0; k < N; k++ ) {
				s += isgn * X[ i + ( k * M ) ] * opElem( B, N, tranb, k, j );
			}
			R[ i + ( j * M ) ] = s;
		}
	}
	return {
		'res': normInf( R, M, N ),
		'bound': ( normInf( A, M, M ) + normInf( B, N, N ) ) * normInf( X, M, N )
	};
}

/**
* Solves the Sylvester equation via the ndarray interface on copies of the inputs and checks the residual.
*
* @private
* @param {string} trana - transpose option for `A`
* @param {string} tranb - transpose option for `B`
* @param {integer} isgn - sign
* @param {Array<Array<number>>} Arows - rows of `A`
* @param {Array<Array<number>>} Brows - rows of `B`
* @param {Array<Array<number>>} Crows - rows of `C`
* @param {string} msg - assertion message prefix
* @returns {Object} `{ info, scale, X, C }`
*/
function solveAndCheck( trana, tranb, isgn, Arows, Brows, Crows, msg ) {
	const M = Arows.length;
	const N = Brows.length;
	const A = fromRows( Arows );
	const B = fromRows( Brows );
	const C = fromRows( Crows );
	const X = new Float64Array( C );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( trana, tranb, isgn, M, N, A, 1, M, 0, B, 1, N, 0, X, 1, M, 0, scale ); // eslint-disable-line max-len
	const r = sylvesterResidual( trana, tranb, isgn, M, N, A, B, C, X, scale[ 0 ] ); // eslint-disable-line max-len
	let i;
	for ( i = 0; i < X.length; i++ ) {
		assert.ok( Number.isFinite( X[ i ] ), msg + ': X[' + i + '] is finite' );
	}
	assert.ok( r.res <= 30.0 * EPS * r.bound, msg + ': residual ' + r.res + ' exceeds ' + ( 30.0 * EPS * r.bound ) ); // eslint-disable-line max-len
	return {
		'info': info,
		'scale': scale[ 0 ],
		'X': X,
		'C': C
	};
}

// TESTS //

test( 'dtrsyl: NN basic 2x2', function t() {

	const tc = nn_basic_2x2;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: NN isgn=-1', function t() {

	const tc = nn_isgn__1;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', -1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TN basic', function t() {

	const tc = tn_basic;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'no-transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: conjugate-transpose is accepted and equals transpose (reference accepts C)', function t() {
	const tc = tn_basic;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'conjugate-transpose', 'no-transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TT basic', function t() {

	const tc = tt_basic;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: NT basic', function t() {

	const tc = nt_basic;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 2.0;
	A[ 1 + 1*LDA ] = 3.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 2.0;
	B[ 0 + 1*LDA ] = 1.0;
	B[ 1 + 1*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 5.0;
	C[ 0 + 1*LDA ] = 6.0;
	C[ 1 + 0*LDA ] = 7.0;
	C[ 1 + 1*LDA ] = 8.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'transpose', 1, 2, 2, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: M=0', function t() {

	const tc = m_0;
	const A = new Float64Array( 16 );
	const B = new Float64Array( 16 );
	const C = new Float64Array( 16 );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 0, 2, A, 1, 4, 0, B, 1, 4, 0, C, 1, 4, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'dtrsyl: N=0', function t() {

	const tc = n_0;
	const A = new Float64Array( 16 );
	const B = new Float64Array( 16 );
	const C = new Float64Array( 16 );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 2, 0, A, 1, 4, 0, B, 1, 4, 0, C, 1, 4, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
});

test( 'dtrsyl: NN 3x3 quasi-tri', function t() {

	const tc = nn_3x3_quasi_tri;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: M=1 N=1', function t() {

	const tc = m_1_n_1;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 ] = 2.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 ] = 3.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 ] = 10.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 1, 1, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TN 3x3 quasi-tri', function t() {

	const tc = tn_3x3_quasi_tri;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'no-transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: TT 3x3 quasi-tri', function t() {

	const tc = tt_3x3_quasi_tri;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

test( 'dtrsyl: NT 3x3 quasi-tri', function t() {

	const tc = nt_3x3_quasi_tri;
	const LDA = 4;
	const A = new Float64Array( LDA * LDA );
	A[ 0 + 0*LDA ] = 1.0;
	A[ 0 + 1*LDA ] = 0.5;
	A[ 0 + 2*LDA ] = 0.3;
	A[ 1 + 1*LDA ] = 2.0;
	A[ 1 + 2*LDA ] = 0.4;
	A[ 2 + 1*LDA ] = -0.5;
	A[ 2 + 2*LDA ] = 2.0;
	const B = new Float64Array( LDA * LDA );
	B[ 0 + 0*LDA ] = 3.0;
	B[ 0 + 1*LDA ] = 0.2;
	B[ 0 + 2*LDA ] = 0.1;
	B[ 1 + 1*LDA ] = 4.0;
	B[ 1 + 2*LDA ] = 0.3;
	B[ 2 + 1*LDA ] = -0.3;
	B[ 2 + 2*LDA ] = 4.0;
	const C = new Float64Array( LDA * LDA );
	C[ 0 + 0*LDA ] = 1.0;
	C[ 0 + 1*LDA ] = 2.0;
	C[ 0 + 2*LDA ] = 3.0;
	C[ 1 + 0*LDA ] = 4.0;
	C[ 1 + 1*LDA ] = 5.0;
	C[ 1 + 2*LDA ] = 6.0;
	C[ 2 + 0*LDA ] = 7.0;
	C[ 2 + 1*LDA ] = 8.0;
	C[ 2 + 2*LDA ] = 9.0;
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'transpose', 1, 3, 3, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( toArray( C ), tc.C, 1e-14, 'C' );
});

// 4x4 tests with 2x2 blocks in BOTH A and B

test( 'dtrsyl: NN 4x4 quasi-tri both', function t() {

	const tc = nn_4x4_quasi_tri_both;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TN 4x4 quasi-tri both', function t() {

	const tc = tn_4x4_quasi_tri_both;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TT 4x4 quasi-tri both', function t() {

	const tc = tt_4x4_quasi_tri_both;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NT 4x4 quasi-tri both', function t() {

	const tc = nt_4x4_quasi_tri_both;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NN 4x4 quasi-tri both isgn=-1', function t() {

	const tc = nn_4x4_quasi_tri_both_isgn__1;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TN 4x4 quasi-tri both isgn=-1', function t() {

	const tc = tn_4x4_quasi_tri_both_isgn__1;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'no-transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TT 4x4 quasi-tri both isgn=-1', function t() {

	const tc = tt_4x4_quasi_tri_both_isgn__1;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NT 4x4 quasi-tri both isgn=-1', function t() {

	const tc = nt_4x4_quasi_tri_both_isgn__1;
	const LDA = 4;
	const A = buildA4( LDA );
	const B = buildB4( LDA );
	const C = buildC4( LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'transpose', -1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

// Residual-based tests: near-singular perturbation (info = 1) and overflow scaling (scale < 1)

const TRANS_COMBOS = [
	[ 'no-transpose', 'no-transpose' ],
	[ 'transpose', 'no-transpose' ],
	[ 'transpose', 'transpose' ],
	[ 'no-transpose', 'transpose' ]
];

test( 'dtrsyl: residual is small for A and B mixing 1x1 and 2x2 blocks (all trana/tranb, isgn = +/-1)', function t() {
	// A: 1x1 block, 2x2 block [[1.5, 0.8],[-0.5, 1.5]], 1x1 block (M = 4)
	const Arows = [
		[ 3.0, 0.4, -0.2, 0.7 ],
		[ 0.0, 1.5, 0.8, 0.3 ],
		[ 0.0, -0.5, 1.5, -0.6 ],
		[ 0.0, 0.0, 0.0, -2.0 ]
	];
	// B: 2x2 block [[0.5, 1.2],[-0.7, 0.5]], 1x1 block (N = 3)
	const Brows = [
		[ 0.5, 1.2, 0.25 ],
		[ -0.7, 0.5, -0.4 ],
		[ 0.0, 0.0, 4.0 ]
	];
	const Crows = [
		[ 1.0, -2.0, 3.0 ],
		[ 0.5, 4.0, -1.0 ],
		[ -3.0, 2.0, 1.5 ],
		[ 2.5, -0.5, 1.0 ]
	];
	let out;
	let i;
	let s;
	for ( i = 0; i < TRANS_COMBOS.length; i++ ) {
		for ( s = -1; s <= 1; s += 2 ) {
			out = solveAndCheck( TRANS_COMBOS[ i ][ 0 ], TRANS_COMBOS[ i ][ 1 ], s, Arows, Brows, Crows, TRANS_COMBOS[ i ].join( '/' ) + ' isgn=' + s ); // eslint-disable-line max-len
			assert.strictEqual( out.info, 0, 'info' );
			assert.strictEqual( out.scale, 1.0, 'scale' );
		}
	}
});

test( 'dtrsyl: 2x2-2x2 blocks sharing eigenvalues return info = 1 (dlasy2 perturbation, all trana/tranb)', function t() {
	// A has eigenvalues 1 +/- i
	const Arows = [ [ 1.0, 1.0 ], [ -1.0, 1.0 ] ];
	// isgn = +1: B has eigenvalues -1 +/- i, so A + B is singular
	const BrowsPos = [ [ -1.0, 1.0 ], [ -1.0, -1.0 ] ];
	// isgn = -1: B = A, so A - B is singular
	const BrowsNeg = [ [ 1.0, 1.0 ], [ -1.0, 1.0 ] ];
	const Crows = [ [ 1.0, 3.0 ], [ 2.0, 4.0 ] ];
	let out;
	let i;
	for ( i = 0; i < TRANS_COMBOS.length; i++ ) {
		out = solveAndCheck( TRANS_COMBOS[ i ][ 0 ], TRANS_COMBOS[ i ][ 1 ], 1, Arows, BrowsPos, Crows, TRANS_COMBOS[ i ].join( '/' ) + ' isgn=1' ); // eslint-disable-line max-len
		assert.strictEqual( out.info, 1, TRANS_COMBOS[ i ].join( '/' ) + ' isgn=1: info' ); // eslint-disable-line max-len
		assert.strictEqual( out.scale, 1.0, 'scale' );
		out = solveAndCheck( TRANS_COMBOS[ i ][ 0 ], TRANS_COMBOS[ i ][ 1 ], -1, Arows, BrowsNeg, Crows, TRANS_COMBOS[ i ].join( '/' ) + ' isgn=-1' ); // eslint-disable-line max-len
		assert.strictEqual( out.info, 1, TRANS_COMBOS[ i ].join( '/' ) + ' isgn=-1: info' ); // eslint-disable-line max-len
		assert.strictEqual( out.scale, 1.0, 'scale' );
	}
});

test( 'dtrsyl: 2x2-2x2 blocks with a huge right-hand side are scaled without flagging info (all trana/tranb)', function t() {
	const Arows = [ [ 1.0e-3, 1.0e-3 ], [ -1.0e-3, 1.0e-3 ] ];
	const Brows = [ [ 1.0e-3, 1.0e-3 ], [ -1.0e-3, 1.0e-3 ] ];
	const Crows = [ [ 1.0e300, 1.0e300 ], [ 1.0e300, 1.0e300 ] ];
	let out;
	let i;
	out = solveAndCheck( 'no-transpose', 'no-transpose', 1, Arows, Brows, Crows, 'NN' ); // eslint-disable-line max-len
	assert.strictEqual( out.info, 0, 'info' );
	assertClose( out.scale, 6.25e-302, 1e-14, 'scale' );
	for ( i = 1; i < TRANS_COMBOS.length; i++ ) {
		out = solveAndCheck( TRANS_COMBOS[ i ][ 0 ], TRANS_COMBOS[ i ][ 1 ], 1, Arows, Brows, Crows, TRANS_COMBOS[ i ].join( '/' ) ); // eslint-disable-line max-len
		assert.strictEqual( out.info, 0, 'info' );
		assert.ok( out.scale > 0.0 && out.scale < 1.0, 'scale in (0,1): ' + out.scale ); // eslint-disable-line max-len
	}
});

test( 'dtrsyl: near-singular 1x1-1x1, 2x2-1x1, 1x1-2x2 and 2x2-2x2 block pairs return info = 1 with a small residual (all trana/tranb, isgn = +/-1)', function t() {
	const tiny = 1.0e-20;
	let Brows2;
	let Arows2;
	let Brows;
	let Arows;
	let Crows;
	let cases;
	let msg;
	let out;
	let tr;
	let b;
	let i;
	let j;
	let s;
	for ( s = -1; s <= 1; s += 2 ) {
		// a + isgn*b = 0 for a = 2 and b = -isgn*2:
		b = -s * 2.0;

		// 1x1 diagonal entries equal to a (or b) plus a 2x2 block whose shifted diagonal cancels and whose off-diagonals are tiny (below smin):
		Arows = [ [ 2.0 ] ];
		Brows = [ [ b ] ];
		Arows2 = [ [ 2.0, tiny ], [ -tiny, 2.0 ] ];
		Brows2 = [ [ b, tiny ], [ -tiny, b ] ];
		cases = [
			[ '1x1-1x1', Arows, Brows, [ [ 1.0 ] ] ],
			[ '2x2-1x1', Arows2, Brows, [ [ 1.0 ], [ -2.0 ] ] ],
			[ '1x1-2x2', Arows, Brows2, [ [ 1.0, -2.0 ] ] ],
			[ '2x2-2x2', Arows2, Brows2, [ [ 1.0, 3.0 ], [ -2.0, 0.5 ] ] ],
			[ 'mixed 3x3', [ [ 2.0, 0.5, -0.3 ], [ 0.0, 2.0, tiny ], [ 0.0, -tiny, 2.0 ] ], [ [ b, tiny, 0.4 ], [ -tiny, b, 0.2 ], [ 0.0, 0.0, b ] ], [ [ 1.0, 2.0, 3.0 ], [ -1.0, 0.5, 2.0 ], [ 0.25, -3.0, 1.0 ] ] ] // eslint-disable-line max-len
		];
		for ( i = 0; i < TRANS_COMBOS.length; i++ ) {
			tr = TRANS_COMBOS[ i ];
			for ( j = 0; j < cases.length; j++ ) {
				Crows = cases[ j ][ 3 ];
				msg = tr.join( '/' ) + ' isgn=' + s + ' ' + cases[ j ][ 0 ];
				out = solveAndCheck( tr[ 0 ], tr[ 1 ], s, cases[ j ][ 1 ], cases[ j ][ 2 ], Crows, msg ); // eslint-disable-line max-len
				assert.strictEqual( out.info, 1, msg + ': info' );
				assert.strictEqual( out.scale, 1.0, msg + ': scale' );

				// The perturbed solution is large (the system is singular):
				assert.ok( normInf( out.X, out.C.length / cases[ j ][ 2 ].length, cases[ j ][ 2 ].length ) > 1.0e10, msg + ': |X| large' ); // eslint-disable-line max-len
			}
		}
	}
});

test( 'dtrsyl: 1x1-1x1, 2x2-1x1, 1x1-2x2 and 2x2-2x2 block pairs with a huge right-hand side are scaled (0 < scale < 1, info = 0, all trana/tranb, isgn = +/-1)', function t() {
	const big = 1.0e300;
	const Arows = [ [ 1.0e-8 ] ];
	const Brows = [ [ 3.0e-8 ] ];
	const Arows2 = [ [ 1.0e-8, 2.0e-8 ], [ -1.0e-8, 1.0e-8 ] ];
	const Brows2 = [ [ 3.0e-8, 1.0e-8 ], [ -2.0e-8, 3.0e-8 ] ];
	const cases = [
		[ '1x1-1x1', Arows, Brows, [ [ big ] ] ],
		[ '2x2-1x1', Arows2, Brows, [ [ big ], [ -big ] ] ],
		[ '1x1-2x2', Arows, Brows2, [ [ big, -big ] ] ],
		[ '2x2-2x2', Arows2, Brows2, [ [ big, -big ], [ big, big ] ] ]
	];
	let msg;
	let out;
	let tr;
	let i;
	let j;
	let s;
	for ( s = -1; s <= 1; s += 2 ) {
		for ( i = 0; i < TRANS_COMBOS.length; i++ ) {
			tr = TRANS_COMBOS[ i ];
			for ( j = 0; j < cases.length; j++ ) {
				msg = tr.join( '/' ) + ' isgn=' + s + ' ' + cases[ j ][ 0 ];
				out = solveAndCheck( tr[ 0 ], tr[ 1 ], s, cases[ j ][ 1 ], cases[ j ][ 2 ], cases[ j ][ 3 ], msg ); // eslint-disable-line max-len
				assert.strictEqual( out.info, 0, msg + ': info' );
				assert.ok( out.scale > 0.0 && out.scale < 1.0, msg + ': scale in (0,1): ' + out.scale ); // eslint-disable-line max-len
			}
		}
	}
});

test( 'dtrsyl: NN 4x4 scaled', function t() {
	// A (1x1, 2x2, 1x1 blocks) and B scaled by 1e-3, C by 1e300: every block pairing rescales (scaloc < 1).
	const tc = nn_4x4_scaled;
	const LDA = 4;
	const A = scaled( buildAS( LDA ), 1e-3 );
	const B = scaled( buildB4( LDA ), 1e-3 );
	const C = scaled( buildC4( LDA ), 1e300 );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NN 4x4 near-singular', function t() {
	// Eigenvalues of A and B sum to zero: blocks are perturbed to smin (info = 1). C = 0, since a nonzero RHS is amplified by 1/smin and the result would be roundoff.
	const tc = nn_4x4_near_singular;
	const LDA = 4;
	const A = buildAN( LDA );
	const B = buildBN( LDA );
	const C = new Float64Array( LDA * LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TN 4x4 scaled', function t() {
	// A (1x1, 2x2, 1x1 blocks) and B scaled by 1e-3, C by 1e300: every block pairing rescales (scaloc < 1).
	const tc = tn_4x4_scaled;
	const LDA = 4;
	const A = scaled( buildAS( LDA ), 1e-3 );
	const B = scaled( buildB4( LDA ), 1e-3 );
	const C = scaled( buildC4( LDA ), 1e300 );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TN 4x4 near-singular', function t() {
	// Eigenvalues of A and B sum to zero: blocks are perturbed to smin (info = 1). C = 0, since a nonzero RHS is amplified by 1/smin and the result would be roundoff.
	const tc = tn_4x4_near_singular;
	const LDA = 4;
	const A = buildAN( LDA );
	const B = buildBN( LDA );
	const C = new Float64Array( LDA * LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'no-transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TT 4x4 scaled', function t() {
	// A (1x1, 2x2, 1x1 blocks) and B scaled by 1e-3, C by 1e300: every block pairing rescales (scaloc < 1).
	const tc = tt_4x4_scaled;
	const LDA = 4;
	const A = scaled( buildAS( LDA ), 1e-3 );
	const B = scaled( buildB4( LDA ), 1e-3 );
	const C = scaled( buildC4( LDA ), 1e300 );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: TT 4x4 near-singular', function t() {
	// Eigenvalues of A and B sum to zero: blocks are perturbed to smin (info = 1). C = 0, since a nonzero RHS is amplified by 1/smin and the result would be roundoff.
	const tc = tt_4x4_near_singular;
	const LDA = 4;
	const A = buildAN( LDA );
	const B = buildBN( LDA );
	const C = new Float64Array( LDA * LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NT 4x4 scaled', function t() {
	// A (1x1, 2x2, 1x1 blocks) and B scaled by 1e-3, C by 1e300: every block pairing rescales (scaloc < 1).
	const tc = nt_4x4_scaled;
	const LDA = 4;
	const A = scaled( buildAS( LDA ), 1e-3 );
	const B = scaled( buildB4( LDA ), 1e-3 );
	const C = scaled( buildC4( LDA ), 1e300 );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});

test( 'dtrsyl: NT 4x4 near-singular', function t() {
	// Eigenvalues of A and B sum to zero: blocks are perturbed to smin (info = 1). C = 0, since a nonzero RHS is amplified by 1/smin and the result would be roundoff.
	const tc = nt_4x4_near_singular;
	const LDA = 4;
	const A = buildAN( LDA );
	const B = buildBN( LDA );
	const C = new Float64Array( LDA * LDA );
	const scale = new Float64Array( 1 );
	const info = dtrsyl( 'no-transpose', 'transpose', 1, 4, 4, A, 1, LDA, 0, B, 1, LDA, 0, C, 1, LDA, 0, scale ); // eslint-disable-line max-len
	assert.strictEqual( info, tc.info, 'info' );
	assertClose( scale[ 0 ], tc.scale, 1e-14, 'scale' );
	assertArrayClose( packMatrix( C, LDA, 4, 4 ), tc.C, 1e-12, 'C' );
});
