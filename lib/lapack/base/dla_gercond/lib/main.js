/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_gercond from './dla_gercond.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_gercond, 'ndarray', ndarray );


// EXPORTS //

export default dla_gercond;
