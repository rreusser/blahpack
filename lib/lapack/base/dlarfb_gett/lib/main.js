
/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarfb_gett from './dlarfb_gett.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarfb_gett, 'ndarray', ndarray );


// EXPORTS //

export default dlarfb_gett;
