/**
* Independent, naive reference operations over LOGICAL matrices, generic over the
* scalar trait. These never call the library under test — they are obvious-by-
* inspection loops using only the trait's arithmetic — so residuals and
* reconstructions built from them remain trustworthy even when the routine under
* test is buggy.
*
* Transpose codes: 'n' (none), 't' (transpose), 'c' (conjugate transpose). For a
* real scalar, 'c' == 't'.
*/

import { LogicalMatrix } from './logical.js';

// HELPERS //

function opget( scalar, A, trans, i, j ) {
	if ( trans === 'n' ) {
		return A.get( i, j );
	}
	if ( trans === 'c' ) {
		return scalar.conj( A.get( j, i ) );
	}
	return A.get( j, i );
}


// MAIN //

/**
* C = op(A) * op(B) as a LogicalMatrix.
*
* @param {Object} scalar - scalar trait
* @param {LogicalMatrix} A
* @param {LogicalMatrix} B
* @param {Object} [opts] - { transa:'n'|'t'|'c', transb:'n'|'t'|'c' }
* @returns {LogicalMatrix}
*/
function matmul( scalar, A, B, opts ) {
	var o = opts || {};
	var ta = o.transa || 'n';
	var tb = o.transb || 'n';
	var m = ( ta === 'n' ) ? A.rows : A.cols;
	var k = ( ta === 'n' ) ? A.cols : A.rows;
	var n = ( tb === 'n' ) ? B.cols : B.rows;
	var C = new LogicalMatrix( scalar, m, n );
	var s;
	var i;
	var j;
	var p;
	for ( i = 0; i < m; i++ ) {
		for ( j = 0; j < n; j++ ) {
			s = scalar.zero;
			for ( p = 0; p < k; p++ ) {
				s = scalar.add( s, scalar.mul( opget( scalar, A, ta, i, p ), opget( scalar, B, tb, p, j ) ) );
			}
			C.set( i, j, s );
		}
	}
	return C;
}

/**
* y = op(A) * x, where `x` is an array of scalar values; returns an array of
* scalar values.
*
* @param {Object} scalar - scalar trait
* @param {LogicalMatrix} A
* @param {Array} x - scalar values
* @param {Object} [opts] - { trans:'n'|'t'|'c' }
* @returns {Array}
*/
function matvec( scalar, A, x, opts ) {
	var o = opts || {};
	var t = o.trans || 'n';
	var m = ( t === 'n' ) ? A.rows : A.cols;
	var k = ( t === 'n' ) ? A.cols : A.rows;
	var y = [];
	var s;
	var i;
	var p;
	for ( i = 0; i < m; i++ ) {
		s = scalar.zero;
		for ( p = 0; p < k; p++ ) {
			s = scalar.add( s, scalar.mul( opget( scalar, A, t, i, p ), x[ p ] ) );
		}
		y.push( s );
	}
	return y;
}


// EXPORTS //

export { matmul, matvec };
