// target: lib/lapack/base/dgghrd/lib/dgghrd.js
// The reference checks LDQ, but the spec could not translate it (`js: null`): the hand translation is not constrained.
/* eslint-disable max-len, max-params */

import format from '@stdlib/string/format/lib/index.js';
import max from '@stdlib/math/base/special/fast/max/lib/index.js';
import base from './base.js';

function dgghrd( order, compq, compz, N, ilo, ihi, A, LDA, B, LDB, Q, LDQ, Z, LDZ ) {
	if ( ( ( compq !== 'none' ) && LDQ < N ) || LDQ < 1 ) {
		throw new RangeError( format( 'invalid argument. Twelfth argument is invalid. Value: `%d`.', LDQ ) );
	}
	return base( compq, compz, N, ilo, ihi, A, 1, LDA, 0, B, 1, LDB, 0, Q, 1, LDQ, 0, Z, 1, LDZ, 0 );
}

export default dgghrd;
