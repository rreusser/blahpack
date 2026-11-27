// target: test/harness/checks.js
// expect: blindAssert
// `!( err > tol )` is true for NaN: the negation does not help.
import assert from 'node:assert/strict';

function check( err, tol ) {
	assert.ok( !( err > tol ), 'error ' + err );
}

export default check;
