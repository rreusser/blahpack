// target: lib/lapack/dlasd5/lib/ndarray.js
// dlasd5's WORK is a documented output (WORK(j) = D(j) + sigma); its base.js honors strideWork, so no unit-stride assertion is required.
function dlasd5( i, d, strideD, offsetD, z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, strideWork, offsetWork ) {
	return base( i, d, strideD, offsetD, z, strideZ, offsetZ, DELTA, strideDELTA, offsetDELTA, rho, dsigma, WORK, strideWork, offsetWork );
}
export default dlasd5;
