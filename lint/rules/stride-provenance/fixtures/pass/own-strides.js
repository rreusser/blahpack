// target: lib/lapack/base/dsterf/lib/base.js
// A vector handed to a matrix routine as an N×1 view: both strides come from
// strideD (the column stride is unused but still the array's own).
import dlascl from '../../dlascl/lib/base.js';
function dsterf( N, d, strideD, offsetD, e, strideE, offsetE ) {
	const l = 1;
	dlascl( 'general', 0, 0, 1.0, 2.0, N - l, 1, d, strideD, strideD, offsetD + ( l * strideD ) );
	return d[ offsetD + ( l * strideD ) ] + e[ offsetE ];
}
export default dsterf;
