// target: lib/lapack/dgeqrf/test/test.ndarray.js
// expect: blindIf
import assert from 'node:assert/strict';

function check( resid, eps ) {
	if ( resid >= 30.0 * eps ) {
		assert.ok( false, 'residual too large: ' + resid );
	}
}

export default check;
