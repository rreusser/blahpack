
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dorhr_col from './dorhr_col.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dorhr_col, 'ndarray', ndarray );


// EXPORTS //

export default dorhr_col;
