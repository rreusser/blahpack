// target: lib/lapack/dsterf/lib/base.js
// expect: foreignOffset
import dlascl from '../../dlascl/lib/base.js';
function dsterf( N, d, strideD, offsetD, e, strideE, offsetE ) {
	dlascl( 'general', 0, 0, 1.0, 2.0, N, 1, d, strideD, strideD, 0 );
	return e[ offsetE ];
}
export default dsterf;
