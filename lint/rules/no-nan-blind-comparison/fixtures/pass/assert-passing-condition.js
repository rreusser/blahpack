// target: lib/lapack/dgeqrf/test/test.strided.js
// Asserting the passing condition directly is NaN-safe.
import assert from 'node:assert/strict';

function assertClose( actual, expected, tol ) {
	var relErr = Math.abs( actual - expected ) / Math.max( Math.abs( expected ), 1.0 );
	assert.ok( relErr <= tol, 'expected ' + expected + ', got ' + actual );
}

export default assertClose;
