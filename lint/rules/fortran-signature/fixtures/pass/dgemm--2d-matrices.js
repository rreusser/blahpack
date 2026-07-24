// PASS — 2D matrices with leading dimensions.
// Fortran: SUBROUTINE DGEMM(TRANSA,TRANSB,M,N,K,ALPHA,A,LDA,B,LDB,BETA,C,LDC)
// Each matrix + LDx expands to A,strideA1,strideA2,offsetA; LDA/LDB/LDC are
// consumed; CHARACTER and scalar args pass through.
function dgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	return transa + transb + M + N + K + alpha + beta + A[ offsetA ] + B[ offsetB ] + C[ offsetC ] + strideA1 + strideA2 + strideB1 + strideB2 + strideC1 + strideC2;
}
export default dgemm;
