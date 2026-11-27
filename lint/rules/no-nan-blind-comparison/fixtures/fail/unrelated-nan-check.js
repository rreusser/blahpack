// target: lib/lapack/base/dgetrf/test/test.ndarray.js
// expect: blindIf
// A NaN check of A[ i ] does not vouch for a comparison of B[ i ]: indices
// and the Math namespace are not shared values.
function check( A, B, C, tol ) {
	var i;
	for ( i = 0; i < A.length; i++ ) {
		if ( !isFinite( Math.abs( A[ i ] ) ) ) {
			throw new Error( 'A is not finite' );
		}
		if ( Math.abs( B[ i ] - C[ i ] ) > tol ) {
			throw new Error( 'mismatch at ' + i );
		}
	}
}

export default check;
