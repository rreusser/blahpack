// target: lib/lapack/base/dtrevc/lib/base.js
// expect: ignores the declared `strideWork`
function dtrevc( N, WORK, strideWork, offsetWork ) {
	let j;
	for ( j = 0; j < N; j++ ) {
		WORK[ offsetWork + j ] = 0.0;
	}
	return WORK[ offsetWork + ( N * strideWork ) ];
}
export default dtrevc;
