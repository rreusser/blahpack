// PASS — two separate 1D arrays whose names end in digits (VN1, VN2).
// Fortran: SUBROUTINE DLAQP2(M,N,OFFSET,A,LDA,JPVT,TAU,VN1,VN2,WORK)
// VN1 and VN2 are distinct 1D arrays, each expanding to arr,strideArr,offsetArr
// (strideVN1/offsetVN1, strideVN2/offsetVN2) — NOT the two strides of one 2D
// array. Exact array-name match resolves this.
function dlaqp2( M, N, offset, A, strideA1, strideA2, offsetA, JPVT, strideJPVT, offsetJPVT, TAU, strideTAU, offsetTAU, VN1, strideVN1, offsetVN1, VN2, strideVN2, offsetVN2, WORK, strideWork, offsetWork ) {
	return M + N + offset + A[ offsetA ] + JPVT[ offsetJPVT ] + TAU[ offsetTAU ] + VN1[ offsetVN1 ] + VN2[ offsetVN2 ] + WORK[ offsetWork ] + strideA1 + strideA2 + strideJPVT + strideTAU + strideVN1 + strideVN2 + strideWork;
}
export default dlaqp2;
