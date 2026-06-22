
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zungtsqr_row from './zungtsqr_row.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zungtsqr_row, 'ndarray', ndarray );


// EXPORTS //

export default zungtsqr_row;
