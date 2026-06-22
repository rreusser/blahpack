// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgels from './zgels.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgels, 'ndarray', ndarray );


// EXPORTS //

export default zgels;
