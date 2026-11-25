// target: lib/lapack/base/dlag2s/lib/dlag2s.js
// The layout comes from an enclosing `if ( order === … )` (its `else` is the other layout).
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';

function dlag2s( order, M, N, A, LDA, SA, LDSA ) {
	if ( order === 'column-major' ) {
		if ( LDA < max( 1, M ) ) {
			throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', M, LDA ) );
		}
	} else if ( LDA < max( 1, N ) ) {
		throw new RangeError( format( 'invalid argument. Fifth argument must be greater than or equal to max(1,%d). Value: `%d`.', N, LDA ) );
	}
	return base( M, N, A, 1, LDA, 0, SA, 1, LDSA, 0 );
}

export default dlag2s;
