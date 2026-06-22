/* eslint-disable camelcase */

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dla_syrcond from './dla_syrcond.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dla_syrcond, 'ndarray', ndarray );


// EXPORTS //

export default dla_syrcond;
