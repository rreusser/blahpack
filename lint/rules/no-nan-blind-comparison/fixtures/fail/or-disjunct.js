// target: lib/lapack/zgetrf/test/test.strided.js
// expect: blindIf
// Every disjunct of an `||` is false on NaN, so each blind comparison counts.
function assertComplexClose( re, im, expRe, expIm, tol ) {
	if ( Math.abs( re - expRe ) > tol || Math.abs( im - expIm ) > tol ) {
		throw new Error( 'mismatch' );
	}
}

export default assertComplexClose;
