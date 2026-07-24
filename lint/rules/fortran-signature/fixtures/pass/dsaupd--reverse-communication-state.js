// PASS — ARPACK reverse-communication state + kept lworkl + kept info.
// Fortran: SUBROUTINE DSAUPD(IDO,BMAT,N,WHICH,NEV,TOL,RESID,NCV,V,LDV,IPARAM,IPNTR,WORKD,WORKL,LWORKL,INFO)
// The IDO reverse-communication protocol has no SAVE in JS, so a leading
// `state` object is threaded (no Fortran counterpart). LWORKL and INFO are kept
// (allowed, not required). Signature transcribed in supplemental.json.
function dsaupd( state, ido, bmat, N, which, nev, tol, resid, strideResid, offsetResid, ncv, V, strideV1, strideV2, offsetV, iparam, strideIparam, offsetIparam, ipntr, strideIpntr, offsetIpntr, workd, strideWorkd, offsetWorkd, workl, strideWorkl, offsetWorkl, lworkl, infoIn ) {
	return N + nev;
}
export default dsaupd;
