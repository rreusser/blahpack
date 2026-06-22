// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dzasum from './dzasum.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dzasum, 'ndarray', ndarray );


// EXPORTS //

export default dzasum;
