// target: lib/lapack/dgges/test/test.js
// expect: blindIf
// A pass flag cleared on a big error stays true for NaN.
import assert from 'node:assert/strict';

function assertColumnClose( actual, expected, tol ) {
	var matchPos = true;
	var relErr;
	var i;
	for ( i = 0; i < expected.length; i++ ) {
		relErr = Math.abs( actual[ i ] - expected[ i ] );
		if ( relErr > tol ) {
			matchPos = false;
		}
	}
	assert.ok( matchPos, 'column matches' );
}

export default assertColumnClose;
