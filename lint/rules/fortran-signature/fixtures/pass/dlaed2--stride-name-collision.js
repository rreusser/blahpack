// PASS — stride-name collision between a 2D array and a 1D array.
// Fortran: SUBROUTINE DLAED2(K,N,N1,D,Q,LDQ,INDXQ,RHO,Z,DLAMBDA,W,Q2,INDX,INDXC,INDXP,COLTYP,INFO)
// 2D array Q claims strideQ1/strideQ2. The 1D array Q2 would also want
// "strideQ2", so it is disambiguated to strideQ21 (its sole dimension) while
// keeping offsetQ2. The rule accepts this narrow collision form.
function dlaed2( N, n1, d, strideD, offsetD, Q, strideQ1, strideQ2, offsetQ, INDXQ, strideINDXQ, offsetINDXQ, rho, z, strideZ, offsetZ, DLAMBDA, strideDLAMBDA, offsetDLAMBDA, w, strideW, offsetW, Q2, strideQ21, offsetQ2, INDX, strideINDX, offsetINDX, INDXC, strideINDXC, offsetINDXC, INDXP, strideINDXP, offsetINDXP, COLTYP, strideCOLTYP, offsetCOLTYP ) {
	return N + n1;
}
export default dlaed2;
