// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgttrs from './zgttrs.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgttrs, 'ndarray', ndarray );


// EXPORTS //

export default zgttrs;
