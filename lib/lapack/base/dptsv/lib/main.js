// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dptsv from './dptsv.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dptsv, 'ndarray', ndarray );


// EXPORTS //

export default dptsv;
