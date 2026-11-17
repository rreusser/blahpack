// target: lib/blas/base/zscal/lib/base.js
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
function zscal( N, x, strideX, offsetX ) {
	const Xv = reinterpret( x, 0 );
	return Xv[ offsetX * 2 ];
}
export default zscal;
