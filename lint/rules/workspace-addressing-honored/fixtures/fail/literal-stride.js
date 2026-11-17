// target: lib/lapack/base/dtrsen/lib/base.js
// expect: is forwarded with a literal stride `1`
function dtrsen( N, WORK, strideWork, offsetWork ) {
	dlacn2( N, WORK, 1, offsetWork + ( N * strideWork ) );
	return WORK[ offsetWork + ( N * strideWork ) ];
}
export default dtrsen;
