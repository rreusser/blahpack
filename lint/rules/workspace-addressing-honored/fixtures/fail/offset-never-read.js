// target: lib/lapack/ztgevc/lib/base.js
// expect: is used but its declared `offsetWork` is never read
function ztgevc( N, WORK, strideWork, offsetWork ) {
	let j;
	for ( j = 0; j < N; j++ ) {
		WORK[ j * strideWork ] = 0.0;
	}
	return WORK;
}
export default ztgevc;
