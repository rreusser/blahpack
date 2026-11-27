// target: lib/lapack/base/dgeqrf/lib/base.js
// Module sources are not tests; the rule applies to test files only.
function guard( err, tol ) {
	if ( err > tol ) {
		throw new Error( 'too big' );
	}
}

export default guard;
