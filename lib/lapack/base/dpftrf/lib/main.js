
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpftrf from './dpftrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpftrf, 'ndarray', ndarray );


// EXPORTS //

export default dpftrf;
