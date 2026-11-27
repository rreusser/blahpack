// target: lib/lapack/dgesvd/test/test.validate.js
// expect: blindIf
function compare( actual, expected, tol ) {
	var errors = [];
	var d;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		d = actual[ i ] - expected[ i ];
		if ( d * d > tol * tol ) {
			errors.push( i );
		}
	}
	return errors;
}

export default compare;
