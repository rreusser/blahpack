// target: lib/lapack/dorbdb3/lib/base.js
// expect: foreignStride
// dorbdb3, before the fix: X21 rotated with X11's stride.
import drot from './../../../../blas/drot/lib/base.js';
function dorbdb3( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWork, offsetWork ) {
	drot( Q, X11, strideX112, offsetX11, X21, strideX112, offsetX21, 0.5, 0.5 );
	return 0;
}
export default dorbdb3;
