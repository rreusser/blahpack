/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_gbamv from './dla_gbamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_gbamv, 'ndarray', ndarray );


// EXPORTS //

export default dla_gbamv;
