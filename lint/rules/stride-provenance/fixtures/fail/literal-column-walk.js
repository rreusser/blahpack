// target: lib/lapack/ztgsna/lib/base.js
// expect: literalStride
// ztgsna, before the fix: Fortran's `VR(1,KS), 1` translated as a literal 1.
import dznrm2 from './../../../../blas/dznrm2/lib/base.js';
function ztgsna( job, howmny, SELECT, strideSELECT, offsetSELECT, N, A, strideA1, strideA2, offsetA, B, strideB1, strideB2, offsetB, VL, strideVL1, strideVL2, offsetVL, VR, strideVR1, strideVR2, offsetVR, s, strideS, offsetS, DIF, strideDIF, offsetDIF, mm, m, WORK, strideWork, offsetWork, IWORK, strideIWork, offsetIWork ) {
	const ks = 1;
	return dznrm2( N, VR, 1, offsetVR + ( ks * strideVR2 ) );
}
export default ztgsna;
