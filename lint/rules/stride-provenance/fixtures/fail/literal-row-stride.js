// target: lib/lapack/base/dsterf/lib/base.js
// expect: literalStride
// dsterf, before the fix: an N×1 view of `d` with row stride 1.
import dlascl from '../../dlascl/lib/base.js';
function dsterf( N, d, strideD, offsetD, e, strideE, offsetE ) {
	dlascl( 'general', 0, 0, 1.0, 2.0, N, 1, d, 1, strideD, offsetD );
	return e[ offsetE ];
}
export default dsterf;
