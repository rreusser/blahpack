
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsytf2Rook from './dsytf2_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsytf2Rook, 'ndarray', ndarray );


// EXPORTS //

export default dsytf2Rook;
