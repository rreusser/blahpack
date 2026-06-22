// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dpttrf from './dpttrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dpttrf, 'ndarray', ndarray );


// EXPORTS //

export default dpttrf;
