// target: lib/blas/zsyr/test/test.ndarray.js
// expect: blindIf
import assert from 'node:assert/strict';

function assertClose( actual, expected, tol ) {
	if ( Math.abs( actual - expected ) > tol ) {
		assert.fail( 'expected ' + expected + ', got ' + actual );
	}
}

export default assertClose;
