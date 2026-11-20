// target: lib/lapack/base/dorgbr/lib/dorgbr.js
// expect: nary
import smallest from '@stdlib/math/base/special/min/lib/index.js';

function size( M, N, K ) {
	return smallest( M, N, K );
}

export default size;
