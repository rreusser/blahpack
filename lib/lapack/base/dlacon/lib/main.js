
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlacon from './dlacon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlacon, 'ndarray', ndarray );


// EXPORTS //

export default dlacon;
