/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_geamv from './dla_geamv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_geamv, 'ndarray', ndarray );


// EXPORTS //

export default dla_geamv;
