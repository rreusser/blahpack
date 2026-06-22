// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpttrs from './dpttrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpttrs, 'ndarray', ndarray );


// EXPORTS //

export default dpttrs;
