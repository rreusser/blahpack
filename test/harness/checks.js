/**
* The assertion vocabulary for property-based validation, generic over the
* scalar trait and operating on LOGICAL matrices / arrays of scalar values.
*
* Numeric checks are scaled by a dimension-aware tolerance (`~ c*n*eps`) rather
* than compared bit-exact, because floating-point reordering between the
* reference and the routine is expected. The exception is layout invariance,
* where changing only addressing must reproduce output BIT-FOR-BIT
* (`assertAllExactEqual`). A NaN is never tolerated: because unused storage is
* poisoned with NaN, any NaN in an output means an out-of-bounds read, so
* `assertFinite` runs at the start of every numeric check.
*/

import { matmul } from './reference.js';
import { norm2, frobenius, maxAbs } from './norms.js';

var EPS = 2.220446049250313e-16;

// HELPERS //

function tol( n, factor ) {
	return ( factor === void 0 ? 10 : factor ) * Math.max( n, 1 ) * EPS;
}

function fail( msg ) {
	throw new Error( msg );
}

/**
* Flatten a LogicalMatrix to a flat array of real components (column-major, then
* re/im), for bit-exact comparison across layouts.
*
* @param {Object} scalar - scalar trait
* @param {LogicalMatrix} M
* @returns {Array<number>}
*/
function flattenLogical( scalar, M ) {
	var out = [];
	var c;
	var i;
	var j;
	var k;
	for ( j = 0; j < M.cols; j++ ) {
		for ( i = 0; i < M.rows; i++ ) {
			c = scalar.components( M.get( i, j ) );
			for ( k = 0; k < c.length; k++ ) {
				out.push( c[ k ] );
			}
		}
	}
	return out;
}


// MAIN //

/**
* Assert every value in an array (of scalar values) or LogicalMatrix is finite.
*/
function assertFinite( scalar, X, label ) {
	var name = label || 'output';
	var i;
	var j;
	if ( X.rows !== void 0 ) {
		for ( i = 0; i < X.rows; i++ ) {
			for ( j = 0; j < X.cols; j++ ) {
				if ( !scalar.isFinite( X.get( i, j ) ) ) {
					fail( name+': non-finite value at ('+i+','+j+') (likely out-of-bounds read into poisoned padding)' );
				}
			}
		}
		return;
	}
	for ( i = 0; i < X.length; i++ ) {
		if ( !scalar.isFinite( X[ i ] ) ) {
			fail( name+': non-finite value at index '+i+' (likely out-of-bounds read into poisoned padding)' );
		}
	}
}

function assertScaled( err, scale, t, label ) {
	var rel = err / ( scale + EPS );
	if ( !( rel <= t ) ) {
		fail( label+': relative error '+rel.toExponential( 3 )+' exceeds tolerance '+t.toExponential( 3 )+' (abs '+err.toExponential( 3 )+', scale '+scale.toExponential( 3 )+')' );
	}
}

/**
* Assert the residual `‖op(A)*x - b‖ / (‖A‖‖x‖ + ‖b‖) <= tol`.
* `x`, `b` are arrays of scalar values.
*/
function assertResidual( scalar, A, x, b, opts ) {
	var o = opts || {};
	var label = o.label || 'linear residual';
	var n = Math.max( A.rows, A.cols );
	var t = o.trans || 'n';
	var m = ( t === 'n' ) ? A.rows : A.cols;
	var k = ( t === 'n' ) ? A.cols : A.rows;
	var r = [];
	var s;
	var i;
	var p;
	for ( i = 0; i < m; i++ ) {
		s = scalar.zero;
		for ( p = 0; p < k; p++ ) {
			s = scalar.add( s, scalar.mul(
				( t === 'n' ) ? A.get( i, p ) : ( t === 'c' ? scalar.conj( A.get( p, i ) ) : A.get( p, i ) ),
				x[ p ]
			) );
		}
		r.push( scalar.sub( s, b[ i ] ) );
	}
	assertFinite( scalar, r, label+' (residual)' );
	var scale = ( frobenius( scalar, A ) * norm2( scalar, x ) ) + norm2( scalar, b );
	assertScaled( norm2( scalar, r ), scale, tol( n, o.factor ), label );
}

/**
* Assert a reconstruction `‖D - M‖_F / ‖M‖_F <= tol`, both LogicalMatrix.
*/
function assertReconstruct( scalar, D, M, opts ) {
	var o = opts || {};
	var label = o.label || 'reconstruction';
	var n = Math.max( M.rows, M.cols );
	var diff = [];
	var i;
	var j;
	for ( j = 0; j < M.cols; j++ ) {
		for ( i = 0; i < M.rows; i++ ) {
			diff.push( scalar.sub( D.get( i, j ), M.get( i, j ) ) );
		}
	}
	assertFinite( scalar, diff, label+' (D - M)' );
	assertScaled( norm2( scalar, diff ), frobenius( scalar, M ), tol( n, o.factor === void 0 ? 20 : o.factor ), label );
}

/**
* Assert a rectangular sub-block [r0,r1) x [c0,c1) of a LogicalMatrix is zero.
*/
function assertZeroBlock( scalar, M, r0, r1, c0, c1, opts ) {
	var o = opts || {};
	var label = o.label || 'zero block';
	var scale = ( o.scale === void 0 ) ? maxAbs( scalar, M ) : o.scale;
	var t = tol( Math.max( M.rows, M.cols ), o.factor === void 0 ? 20 : o.factor );
	var mag;
	var i;
	var j;
	for ( i = r0; i < r1; i++ ) {
		for ( j = c0; j < c1; j++ ) {
			if ( !scalar.isFinite( M.get( i, j ) ) ) {
				fail( label+': non-finite value at ('+i+','+j+')' );
			}
			mag = scalar.abs( M.get( i, j ) );
			if ( mag > t * ( scale + EPS ) ) {
				fail( label+': entry ('+i+','+j+') modulus '+mag.toExponential( 3 )+' is not zero (tol '+( t * scale ).toExponential( 3 )+')' );
			}
		}
	}
}

/**
* Assert the columns of Q are orthonormal: `‖Qᴴ Q - I‖_F / sqrt(n) <= tol`.
* Uses conjugate transpose, so this is unitarity for complex Q.
*/
function assertOrthonormal( scalar, Q, opts ) {
	var o = opts || {};
	var label = o.label || 'orthonormal columns';
	var n = Q.cols;
	var G = matmul( scalar, Q, Q, { 'transa': 'c' } );
	var diff = [];
	var i;
	var j;
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			diff.push( scalar.sub( G.get( i, j ), i === j ? scalar.one : scalar.zero ) );
		}
	}
	assertFinite( scalar, diff, label );
	assertScaled( norm2( scalar, diff ), Math.sqrt( n ), tol( n, o.factor === void 0 ? 20 : o.factor ), label );
}

/**
* Assert two flat numeric-component arrays are BIT-FOR-BIT identical (Object.is).
*/
function assertExactEqual( a, b, label ) {
	var name = label || 'exact equality';
	var i;
	if ( a.length !== b.length ) {
		fail( name+': length mismatch '+a.length+' vs '+b.length );
	}
	for ( i = 0; i < a.length; i++ ) {
		if ( !Object.is( a[ i ], b[ i ] ) ) {
			fail( name+': differ at component '+i+': '+a[ i ]+' vs '+b[ i ] );
		}
	}
}

/**
* Assert every flat array in a list equals the first, bit-for-bit. The engine of
* layout-invariance fuzzing.
*/
function assertAllExactEqual( arrays, label ) {
	var name = label || 'layout invariance';
	var i;
	for ( i = 1; i < arrays.length; i++ ) {
		assertExactEqual( arrays[ 0 ], arrays[ i ], name+' [variant '+i+' vs 0]' );
	}
}


// EXPORTS //

export {
	EPS,
	tol,
	flattenLogical,
	assertFinite,
	assertScaled,
	assertResidual,
	assertReconstruct,
	assertZeroBlock,
	assertOrthonormal,
	assertExactEqual,
	assertAllExactEqual
};
