// target: lib/lapack/base/dgels/lib/dgels.js
// expect: nary
import max from '@stdlib/math/base/special/fast/max/lib/index.js';

function check( LDB, M, N ) {
	return LDB < max( 1, M, N );
}

export default check;
