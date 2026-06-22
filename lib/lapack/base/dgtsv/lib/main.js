// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgtsv from './dgtsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgtsv, 'ndarray', ndarray );


// EXPORTS //

export default dgtsv;
