// target: lib/lapack/dsterf/lib/base.js
// expect: accessWithoutOffset
function dsterf( N, d, strideD, offsetD, e, strideE, offsetE ) {
	let i;
	let t = 0.0;
	for ( i = 0; i < N; i++ ) {
		t += d[ i * strideD ];
	}
	return t + e[ offsetE ];
}
export default dsterf;
