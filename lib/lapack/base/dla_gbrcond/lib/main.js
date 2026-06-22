/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_gbrcond from './dla_gbrcond.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_gbrcond, 'ndarray', ndarray );


// EXPORTS //

export default dla_gbrcond;
