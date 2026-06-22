
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpftrs from './dpftrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpftrs, 'ndarray', ndarray );


// EXPORTS //

export default dpftrs;
