// expect: arity
// FAIL — matrix B is expanded as B,strideB1,offsetB (missing strideB2). The
// parameter count then falls outside every count the Fortran expansion of
// DGEMM can produce.
function dgemm( transa, transb, M, N, K, alpha, A, strideA1, strideA2, offsetA, B, strideB1, offsetB, beta, C, strideC1, strideC2, offsetC ) {
	return transa + transb + M + N + K + alpha + beta + A[ offsetA ] + B[ offsetB ] + C[ offsetC ] + strideA1 + strideA2 + strideB1 + strideC1 + strideC2;
}
export default dgemm;
