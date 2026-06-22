
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarfb_gett from './zlarfb_gett.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarfb_gett, 'ndarray', ndarray );


// EXPORTS //

export default zlarfb_gett;
