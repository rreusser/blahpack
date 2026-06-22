// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgttrf from './zgttrf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgttrf, 'ndarray', ndarray );


// EXPORTS //

export default zgttrf;
