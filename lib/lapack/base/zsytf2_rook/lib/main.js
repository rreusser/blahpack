
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsytf2Rook from './zsytf2_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsytf2Rook, 'ndarray', ndarray );


// EXPORTS //

export default zsytf2Rook;
