// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dzsum1 from './dzsum1.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dzsum1, 'ndarray', ndarray );


// EXPORTS //

export default dzsum1;
