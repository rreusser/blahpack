// target: lib/lapack/dsytrf/test/test.validate.js
// Comparisons of integers (sizes, pivots, block sizes, counters) are not
// NaN-blind in any way that matters, and are not reported.
function check( ipiv, k, N, NB, info, iters ) {
	if ( k > N - 2 || ipiv[ k + 1 ] !== ipiv[ k ] ) {
		throw new Error( 'malformed 2x2 pivot at ' + k );
	}
	if ( Math.min( N, k ) <= NB ) {
		throw new Error( 'not a blocked case' );
	}
	if ( info > 0 ) {
		throw new Error( 'singular' );
	}
	if ( iters > 100 ) {
		throw new Error( 'did not converge' );
	}
}

function band( r, c ) {
	if ( r > c + 1 ) {
		return 0.0;
	}
	return 1.0;
}

export { check, band };
