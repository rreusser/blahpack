// target: lib/lapack/dtrevc/lib/base.js
function dtrevc( N, WORK, strideWork, offsetWork ) {
	let j;
	for ( j = 0; j < N; j++ ) {
		WORK[ offsetWork + j ] = 0.0;
	}
	dlacn2( N, WORK, 1, offsetWork + N );
	return WORK[ offsetWork ];
}
export default dtrevc;
