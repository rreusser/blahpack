// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zsyconRook from './zsycon_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zsyconRook, 'ndarray', ndarray );


// EXPORTS //

export default zsyconRook;
