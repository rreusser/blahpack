// target: lib/lapack/base/dlangb/lib/dlangb.js
// Band storage: column-major LDAB is bounded by the spec rows (KL+KU+1), row-major by the columns (N).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';

function dlangb( order, norm, N, KL, KU, AB, LDAB, WORK ) {
	if ( order === 'row-major' && LDAB < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDAB ) );
	}
	if ( order === 'column-major' && LDAB < max( 1, KL + KU + 1 ) ) {
		throw new RangeError( format( 'invalid argument. Seventh argument must be greater than or equal to max(1,%d). Value: `%d`.', KL + KU + 1, LDAB ) );
	}
	return base( norm, N, KL, KU, AB, 1, LDAB, 0, WORK, 1, 0 );
}

export default dlangb;
