// target: lib/blas/zrot/lib/base.js
// One local reassigned as a reinterpret view of two arrays: an access through
// it may use either array's offset.
import reinterpret from '@stdlib/strided/base/reinterpret-complex128/lib/index.js';
function zrot( N, x, strideX, offsetX, y, strideY, offsetY, c, s ) {
	let v = reinterpret( x, 0 );
	const a = v[ offsetX * 2 ];
	v = reinterpret( y, 0 );
	return a + v[ offsetY * 2 ];
}
export default zrot;
