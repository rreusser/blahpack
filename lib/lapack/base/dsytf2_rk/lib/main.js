
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytf2rk from './dsytf2_rk.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsytf2rk, 'ndarray', ndarray );


// EXPORTS //

export default dsytf2rk;
