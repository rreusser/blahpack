// target: lib/lapack/zgehrd/test/test.ndarray.js
// expect: blindIf
// "fail when both the absolute and the relative error are big": NaN fails neither.
import assert from 'node:assert/strict';

function assertClose( actual, expected, tol ) {
	var diff;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		diff = Math.abs( actual[ i ] - expected[ i ] );
		if ( diff > tol && diff / Math.max( Math.abs( expected[ i ] ), 1.0 ) > tol ) {
			assert.fail( 'index ' + i );
		}
	}
}

export default assertClose;
