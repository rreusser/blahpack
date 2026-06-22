/* eslint-disable no-restricted-syntax, stdlib/first-unit-test */

// MODULES //

import test from 'node:test';
import assert from 'node:assert/strict';
import Complex128Array from '@stdlib/array/complex128/lib/index.js';
import Complex128 from '@stdlib/complex/float64/ctor/lib/index.js';
import Float64Array from '@stdlib/array/float64/lib/index.js';
import ztrmm from './../lib/index.js';


// FUNCTIONS //

function approxEqual( actual, expected, tol, msg ) {
	var abs = Math.abs( actual - expected );
	var ref = Math.max( Math.abs( expected ), 1.0 );
	assert.ok( abs <= tol * ref, msg + ' got=' + actual + ' expected=' + expected );
}

// Build a Complex128Array (column-major) from interleaved [re,im,re,im,...] floats.
function cArr( pairs ) {
	var f = new Float64Array( pairs.length );
	var i;
	for ( i = 0; i < pairs.length; i++ ) {
		f[ i ] = pairs[ i ];
	}
	return new Complex128Array( f.buffer );
}

// Reinterpret Complex128Array to flat float pairs for assertion.
function flat( cx ) {
	return new Float64Array( cx.buffer, cx.byteOffset, cx.length * 2 );
}

function expectFlat( actual, expected, tol, msg ) {
	var f = flat( actual );
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		approxEqual( f[ i ], expected[ i ], tol, msg + '[' + i + ']' );
	}
}

// Slow naive reference ztrmm for verification.
// Operates on column-major Complex128 interleaved float arrays.
function refZtrmm( side, uplo, transa, diag, M, N, alphaR, alphaI, A, lda, B, ldb ) {
	// A is M x M if side='left', else N x N. Stored column-major with leading dim lda.
	// B is M x N column-major with leading dim ldb. Each entry is 2 floats (re,im).
	var nA = ( side === 'left' ) ? M : N;
	var Bnew = new Float64Array( B.length );
	var i;
	var j;
	var k;
	var sumR;
	var sumI;
	var aR;
	var aI;
	var bR;
	var bI;
	var idxA;
	var idxB;
	var inRange;
	var isUpper = ( uplo === 'upper' );
	for ( j = 0; j < N; j++ ) {
		for ( i = 0; i < M; i++ ) {
			sumR = 0;
			sumI = 0;
			if ( side === 'left' ) {
				// Bnew[i,j] = sum_k op(A)[i,k] * B[k,j]
				for ( k = 0; k < nA; k++ ) {
					if ( transa === 'no-transpose' ) {
						// A[i,k]
						if ( isUpper ) {
							inRange = ( i <= k );
						} else {
							inRange = ( i >= k );
						}
						idxA = 2 * ( i + k * lda );
					} else {
						// op(A)[i,k] = A[k,i]
						if ( isUpper ) {
							inRange = ( k <= i );
						} else {
							inRange = ( k >= i );
						}
						idxA = 2 * ( k + i * lda );
					}
					if ( !inRange ) {
						continue;
					}
					aR = A[ idxA ];
					aI = A[ idxA + 1 ];
					// On diagonal:
					if ( ( transa === 'no-transpose' && i === k ) || ( transa !== 'no-transpose' && k === i ) ) {
						if ( diag === 'unit' ) {
							aR = 1;
							aI = 0;
						}
					}
					if ( transa === 'conjugate-transpose' ) {
						aI = -aI;
					}
					idxB = 2 * ( k + j * ldb );
					bR = B[ idxB ];
					bI = B[ idxB + 1 ];
					sumR += aR * bR - aI * bI;
					sumI += aR * bI + aI * bR;
				}
			} else {
				// side='right': Bnew[i,j] = sum_k B[i,k] * op(A)[k,j]
				for ( k = 0; k < nA; k++ ) {
					if ( transa === 'no-transpose' ) {
						// A[k,j]
						if ( isUpper ) {
							inRange = ( k <= j );
						} else {
							inRange = ( k >= j );
						}
						idxA = 2 * ( k + j * lda );
					} else {
						// op(A)[k,j] = A[j,k]
						if ( isUpper ) {
							inRange = ( j <= k );
						} else {
							inRange = ( j >= k );
						}
						idxA = 2 * ( j + k * lda );
					}
					if ( !inRange ) {
						continue;
					}
					aR = A[ idxA ];
					aI = A[ idxA + 1 ];
					if ( ( transa === 'no-transpose' && k === j ) || ( transa !== 'no-transpose' && k === j ) ) {
						if ( diag === 'unit' ) {
							aR = 1;
							aI = 0;
						}
					}
					if ( transa === 'conjugate-transpose' ) {
						aI = -aI;
					}
					idxB = 2 * ( i + k * ldb );
					bR = B[ idxB ];
					bI = B[ idxB + 1 ];
					sumR += bR * aR - bI * aI;
					sumI += bR * aI + bI * aR;
				}
			}
			// Bnew[i,j] = alpha * sum
			Bnew[ 2 * ( i + j * ldb ) ] = alphaR * sumR - alphaI * sumI;
			Bnew[ 2 * ( i + j * ldb ) + 1 ] = alphaR * sumI + alphaI * sumR;
		}
	}
	return Bnew;
}

// Run ztrmm.ndarray vs reference and assert agreement.
function checkAgainstRef( side, uplo, transa, diag, M, N, alphaR, alphaI, Adata, Bdata ) {
	var lda = ( side === 'left' ) ? M : N;
	var ldb = M;
	var A = cArr( Adata );
	var B = cArr( Bdata );
	var alpha = new Complex128( alphaR, alphaI );
	var expected = refZtrmm( side, uplo, transa, diag, M, N, alphaR, alphaI, Adata, lda, Bdata, ldb );
	ztrmm.ndarray( side, uplo, transa, diag, M, N, alpha, A, 1, lda, 0, B, 1, ldb, 0 );
	expectFlat( B, expected, 1e-12, side + '/' + uplo + '/' + transa + '/' + diag );
}


// TESTS //

test( 'main export is a function', function t() {
	assert.strictEqual( typeof ztrmm, 'function', 'is a function' );
});

test( 'main export has an ndarray method', function t() {
	assert.strictEqual( typeof ztrmm.ndarray, 'function', 'has ndarray method' );
});

test( 'ndarray throws TypeError for invalid side', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'invalid', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray throws TypeError for invalid uplo', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'invalid', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray throws TypeError for invalid transa', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'invalid', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray throws TypeError for invalid diag', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'invalid', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	}, TypeError );
});

test( 'ndarray throws RangeError for negative M', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', -1, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	}, RangeError );
});

test( 'ndarray throws RangeError for negative N', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, -1, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	}, RangeError );
});

test( 'ndarray throws RangeError for zero strideA1', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 0, 2, 0, B, 1, 2, 0 );
	}, RangeError );
});

test( 'ndarray throws RangeError for zero strideA2', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 0, 0, B, 1, 2, 0 );
	}, RangeError );
});

test( 'ndarray throws RangeError for zero strideB1', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 0, 2, 0 );
	}, RangeError );
});

test( 'ndarray throws RangeError for zero strideB2', function t() {
	var A = new Complex128Array( [ 2, 1, 0, 0, 3, 1, 4, 2 ] );
	var B = new Complex128Array( [ 1, 0, 0, 1, 0, 1, 1, 0 ] );
	assert.throws( function f() {
		ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 0, 0 );
	}, RangeError );
});

// Quick-return tests
test( 'ndarray M=0 returns B unchanged', function t() {
	var Bdata = [ 1, 2, 3, 4 ];
	var B = cArr( Bdata );
	var A = cArr( [ 1, 0 ] );
	ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 0, 2, new Complex128( 5, 5 ), A, 1, 1, 0, B, 1, 1, 0 );
	expectFlat( B, Bdata, 1e-15, 'B' );
});

test( 'ndarray N=0 returns B unchanged', function t() {
	var Bdata = [ 1, 2, 3, 4 ];
	var B = cArr( Bdata );
	var A = cArr( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 0, new Complex128( 5, 5 ), A, 1, 2, 0, B, 1, 2, 0 );
	expectFlat( B, Bdata, 1e-15, 'B' );
});

test( 'ndarray alpha=0 zeroes B (left/upper/no-transpose)', function t() {
	var B = cArr( [ 7, 8, 9, 10, 11, 12, 13, 14 ] );
	var A = cArr( [ 1, 1, 0, 0, 2, 2, 3, 3 ] );
	ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	expectFlat( B, [ 0, 0, 0, 0, 0, 0, 0, 0 ], 1e-15, 'B' );
});

test( 'ndarray alpha=0 zeroes B (right/lower/conjugate-transpose)', function t() {
	var B = cArr( [ 7, 8, 9, 10, 11, 12, 13, 14 ] );
	var A = cArr( [ 1, 1, 0, 0, 2, 2, 3, 3 ] );
	ztrmm.ndarray( 'right', 'lower', 'conjugate-transpose', 'unit', 2, 2, new Complex128( 0, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	expectFlat( B, [ 0, 0, 0, 0, 0, 0, 0, 0 ], 1e-15, 'B' );
});

// Combinations: side x uplo x transa x diag, all 16, against the reference.
( function combinations() {
	var sides = [ 'left', 'right' ];
	var uplos = [ 'upper', 'lower' ];
	var transas = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
	var diags = [ 'unit', 'non-unit' ];
	var i;
	var j;
	var k;
	var l;
	// 2x2 example: A = [[1+i, 2-i], [0.3-0.4i, 3+0.5i]] (full storage; only the relevant triangle is read)
	// B = [[1, 0+1i], [-1+0.5i, 2-2i]]
	var Adata2 = [ 1, 1, 0.3, -0.4, 2, -1, 3, 0.5 ];
	var Bdata2 = [ 1, 0, -1, 0.5, 0, 1, 2, -2 ];
	for ( i = 0; i < sides.length; i++ ) {
		for ( j = 0; j < uplos.length; j++ ) {
			for ( k = 0; k < transas.length; k++ ) {
				for ( l = 0; l < diags.length; l++ ) {
					( function inner( S, U, T, D ) {
						test( 'ndarray combo ' + S + '/' + U + '/' + T + '/' + D + ' (M=N=2)', function t() {
							checkAgainstRef( S, U, T, D, 2, 2, 0.5, -0.7, Adata2.slice(), Bdata2.slice() );
						});
					}( sides[ i ], uplos[ j ], transas[ k ], diags[ l ] ) );
				}
			}
		}
	}
}() );

// Specific transpose-vs-conjugate-transpose check with imaginary off-diagonal.
test( 'ndarray transpose vs conjugate-transpose differ for complex A (left/upper)', function t() {
	// A = [[1, 0+2i], [0, 1]] (upper, non-unit)
	// B = [[1, 0], [0, 1]]
	// alpha = 1
	// transpose: op(A)[0,0]=1, op(A)[1,0]=0+2i, op(A)[0,1]=0, op(A)[1,1]=1
	//   B := A^T * B = [[1,0],[2i,1]]
	// conjugate-transpose: op(A)[1,0]=0-2i
	//   B := A^H * B = [[1,0],[-2i,1]]
	var Adata = [ 1, 0, 0, 0, 0, 2, 1, 0 ];
	var Bdata = [ 1, 0, 0, 0, 0, 0, 1, 0 ];
	var A1 = cArr( Adata.slice() );
	var B1 = cArr( Bdata.slice() );
	ztrmm.ndarray( 'left', 'upper', 'transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A1, 1, 2, 0, B1, 1, 2, 0 );
	expectFlat( B1, [ 1, 0, 0, 2, 0, 0, 1, 0 ], 1e-12, 'transpose' );
	var A2 = cArr( Adata.slice() );
	var B2 = cArr( Bdata.slice() );
	ztrmm.ndarray( 'left', 'upper', 'conjugate-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A2, 1, 2, 0, B2, 1, 2, 0 );
	expectFlat( B2, [ 1, 0, 0, -2, 0, 0, 1, 0 ], 1e-12, 'conj-transpose' );
});

// Hand-verified case for left/upper/no-transpose/non-unit, alpha=1.
test( 'ndarray hand-verified left/upper/no-transpose/non-unit', function t() {
	// A = [[2, 3], [0, 4]]; B = [[1, 0], [0, 1]]; alpha = 1
	// A*B = A = [[2,3],[0,4]]
	var A = cArr( [ 2, 0, 0, 0, 3, 0, 4, 0 ] );
	var B = cArr( [ 1, 0, 0, 0, 0, 0, 1, 0 ] );
	ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	expectFlat( B, [ 2, 0, 0, 0, 3, 0, 4, 0 ], 1e-12, 'B' );
});

// Hand-verified for right/lower/no-transpose/unit
test( 'ndarray hand-verified right/lower/no-transpose/unit', function t() {
	// A = [[1, 0], [5, 1]] (lower, unit means diag=1 implicit)
	// B = [[1, 1], [1, 1]]; alpha = 1
	// B*A: [1*1+1*5, 1*0+1*1; 1*1+1*5, 1*0+1*1] = [[6,1],[6,1]]
	var A = cArr( [ 999, 999, 5, 0, 0, 0, 999, 999 ] ); // unit: diagonal ignored
	var B = cArr( [ 1, 0, 1, 0, 1, 0, 1, 0 ] );
	ztrmm.ndarray( 'right', 'lower', 'no-transpose', 'unit', 2, 2, new Complex128( 1, 0 ), A, 1, 2, 0, B, 1, 2, 0 );
	expectFlat( B, [ 6, 0, 6, 0, 1, 0, 1, 0 ], 1e-12, 'B' );
});

// Larger 3x3 against the reference for extra coverage.
test( 'ndarray 3x3 against reference (all combos)', function t() {
	var sides = [ 'left', 'right' ];
	var uplos = [ 'upper', 'lower' ];
	var transas = [ 'no-transpose', 'transpose', 'conjugate-transpose' ];
	var diags = [ 'unit', 'non-unit' ];
	var i;
	var j;
	var k;
	var l;
	// 3x3 A, 3x3 B.
	var Adata = [
		1, 0.1, 0.2, -0.3, 0.4, 0.5,
		0.6, 0.7, 2, 0.2, 0.8, -0.9,
		1, -1, 0.5, 0.5, 3, 0.3
	];
	var Bdata = [
		1, 1, 0, 1, -1, 0,
		2, -2, 1, 0, 0, 1,
		3, 0, 0.5, 0.5, 1, 1
	];
	for ( i = 0; i < sides.length; i++ ) {
		for ( j = 0; j < uplos.length; j++ ) {
			for ( k = 0; k < transas.length; k++ ) {
				for ( l = 0; l < diags.length; l++ ) {
					checkAgainstRef( sides[ i ], uplos[ j ], transas[ k ], diags[ l ], 3, 3, 0.7, 0.3, Adata.slice(), Bdata.slice() );
				}
			}
		}
	}
});

// 3x2 (M != N) for side='left' edge cases.
test( 'ndarray M=3 N=2 left/upper/no-transpose/non-unit', function t() {
	var A = cArr( [
		1, 0, 0, 0, 0, 0,
		0.5, 0.5, 2, 0, 0, 0,
		1, -1, 0.3, 0.3, 3, 0
	] );
	var B = cArr( [ 1, 0, 0, 1, 1, 1, 2, 0, 0, 2, 1, 2 ] );
	// Run; just verify it doesn't throw and result is finite.
	ztrmm.ndarray( 'left', 'upper', 'no-transpose', 'non-unit', 3, 2, new Complex128( 1, 0 ), A, 1, 3, 0, B, 1, 3, 0 );
	var f = flat( B );
	var i;
	for ( i = 0; i < f.length; i++ ) {
		assert.ok( Number.isFinite( f[ i ] ), 'B[' + i + '] is finite' );
	}
});
