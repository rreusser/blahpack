
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpftri from './dpftri.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpftri, 'ndarray', ndarray );


// EXPORTS //

export default dpftri;
