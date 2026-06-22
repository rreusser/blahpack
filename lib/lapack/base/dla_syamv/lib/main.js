/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_syamv from './dla_syamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_syamv, 'ndarray', ndarray );


// EXPORTS //

export default dla_syamv;
