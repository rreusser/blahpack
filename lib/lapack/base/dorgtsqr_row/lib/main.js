
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorgtsqr_row from './dorgtsqr_row.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorgtsqr_row, 'ndarray', ndarray );


// EXPORTS //

export default dorgtsqr_row;
