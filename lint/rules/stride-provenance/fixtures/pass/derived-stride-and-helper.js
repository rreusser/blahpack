// target: lib/lapack/base/dorbdb3/lib/base.js
// Strides derived from the array's own (`sx`), an index computed in a local
// helper closure, and workspace forwarded with a literal unit stride (D5b).
import drot from './../../../../blas/base/drot/lib/base.js';
import dlarfgp from '../../dlarfgp/lib/base.js';
function dorbdb3( M, P, Q, X11, strideX111, strideX112, offsetX11, X21, strideX211, strideX212, offsetX21, THETA, strideTHETA, offsetTHETA, PHI, stridePHI, offsetPHI, TAUP1, strideTAUP1, offsetTAUP1, TAUP2, strideTAUP2, offsetTAUP2, TAUQ1, strideTAUQ1, offsetTAUQ1, WORK, strideWork, offsetWork ) {
	const sx = strideX212;
	const ix = function ix( i, j ) {
		return offsetX21 + ( i * strideX211 ) + ( j * strideX212 );
	};
	drot( Q, X11, strideX112, offsetX11, X21, sx, ix( 1, 1 ), 0.5, 0.5 );
	dlarfgp( Q, X21, ix( 0, 0 ), X21, strideX212, ix( 0, 1 ), TAUQ1, offsetTAUQ1 );
	return X21[ ix( 2, 2 ) ] + WORK[ offsetWork ] + THETA[ offsetTHETA ] + PHI[ offsetPHI ] + TAUP1[ offsetTAUP1 ] + TAUP2[ offsetTAUP2 ];
}
export default dorbdb3;
