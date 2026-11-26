// target: lib/lapack/base/dgeqrf/lib/base.js
// expect: does not import the ilaenv module
function dgeqrf( M, N ) {
	return M + N;
}
export default dgeqrf;
