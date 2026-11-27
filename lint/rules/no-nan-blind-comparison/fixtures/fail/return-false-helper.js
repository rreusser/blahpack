// target: lib/lapack/base/dlaqr5/test/test.ndarray.js
// expect: blindIf
// `false` means "not upper triangular": a NaN entry reads as zero.
function isUpperTriangular( H, N, tol ) {
	var i;
	var j;
	for ( j = 0; j < N; j++ ) {
		for ( i = j + 1; i < N; i++ ) {
			if ( Math.abs( H[ i + ( j * N ) ] ) >= tol ) return false;
		}
	}
	return true;
}

export default isUpperTriangular;
