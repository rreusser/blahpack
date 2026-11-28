// target: lib/lapack/dormql/lib/base.js
// The rule applies to the layout wrapper only; base.js and ndarray.js are other forms.
/* eslint-disable max-len, max-params */

import dorm2l from '../../dorm2l/lib/base.js';

function dormql( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork ) {
	return dorm2l( side, trans, M, N, K, A, strideA1, strideA2, offsetA, TAU, strideTAU, offsetTAU, C, strideC1, strideC2, offsetC, WORK, strideWork, offsetWork );
}

export default dormql;
