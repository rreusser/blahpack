// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlasy2 from './dlasy2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlasy2, 'ndarray', ndarray );


// EXPORTS //

export default dlasy2;
