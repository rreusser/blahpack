
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgges from './zgges.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgges, 'ndarray', ndarray );


// EXPORTS //

export default zgges;
