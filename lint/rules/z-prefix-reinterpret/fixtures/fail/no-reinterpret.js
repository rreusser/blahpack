// target: lib/blas/zscal/lib/base.js
// expect: without reinterpret()
function zscal( N, Xv, offsetX ) {
	return Xv[ offsetX * 2 ];
}
export default zscal;
