// target: lib/lapack/base/dgels/lib/dgels.js
import max from '@stdlib/math/base/special/fast/max/lib/index.js';

function check( LDB, M, N ) {
	// Nested binary calls, and the variadic Math.max, are fine.
	return LDB < max( 1, max( M, N ) ) || LDB < Math.max( 1, M, N );
}

export default check;
