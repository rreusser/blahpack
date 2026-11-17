// target: lib/lapack/base/dgerfs/lib/base.js
// expect: is used but its declared `strideWork` is never read
function dgerfs( N, WORK, strideWork, offsetWork ) {
	return WORK[ offsetWork ];
}
export default dgerfs;
