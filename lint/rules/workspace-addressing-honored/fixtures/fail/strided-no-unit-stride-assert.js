// target: lib/lapack/dgetri/lib/strided.js
// expect: never asserts it is 1
// dgetri's base.js forwards WORK to its callees with a literal unit stride,
// so it does not honor strideWork; strided.js must reject a non-unit one.
function dgetri( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork ) {
	return base( N, A, strideA1, strideA2, offsetA, IPIV, strideIPIV, offsetIPIV, WORK, strideWork, offsetWork );
}
export default dgetri;
