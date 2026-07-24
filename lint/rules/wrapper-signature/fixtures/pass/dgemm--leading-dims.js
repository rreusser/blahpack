// PASS — the CBLAS-style form: `order` prepended, matrices carry a leading
// dimension (LDA/LDB/LDC) instead of strides+offset. LD parameters are not
// naming-checked (they use Fortran-native names), and there are no stride
// parameters to resolve.
function dgemm( order, transa, transb, M, N, K, alpha, A, LDA, B, LDB, beta, C, LDC ) {
	return order + transa + transb + M + N + K + alpha + beta + A[ 0 ] + B[ 0 ] + C[ 0 ] + LDA + LDB + LDC;
}
export default dgemm;
