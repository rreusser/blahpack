// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytrs2 from './dsytrs2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsytrs2, 'ndarray', ndarray );


// EXPORTS //

export default dsytrs2;
