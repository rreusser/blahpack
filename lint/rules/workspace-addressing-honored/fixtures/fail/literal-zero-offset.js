// target: lib/lapack/base/dgelss/lib/base.js
// expect: is forwarded with a literal offset `0`
function dgelss( N, A, strideA1, strideA2, offsetA, WORK, strideWork, offsetWork ) {
	dlacpy( 'full', N, N, WORK, 1, N, 0, A, strideA1, strideA2, offsetA );
	return WORK[ offsetWork ];
}
export default dgelss;
