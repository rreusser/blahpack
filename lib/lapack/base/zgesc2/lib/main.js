
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgesc2 from './zgesc2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgesc2, 'ndarray', ndarray );


// EXPORTS //

export default zgesc2;
