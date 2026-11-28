// target: lib/lapack/dlarft/test/test.strided.js
// The failure is in the `else`: NaN takes it.
function check( err, tol ) {
	if ( err <= tol ) {
		return true;
	} else {
		throw new Error( 'error ' + err );
	}
}

export default check;
