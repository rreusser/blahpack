// target: lib/blas/dger/test/test.strided.js
// Fail unless the passing condition holds: NaN fails it.
function assertArrayClose( actual, expected, tol, msg ) {
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] ) / Math.max( Math.abs( expected[ i ] ), 1.0 );
		if ( !( relErr <= tol ) ) {
			throw new Error( msg + '[' + i + ']: expected ' + expected[ i ] + ', got ' + actual[ i ] );
		}
	}
}

export default assertArrayClose;
