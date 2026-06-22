
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlacon from './zlacon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlacon, 'ndarray', ndarray );


// EXPORTS //

export default zlacon;
