
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dsyconRook from './dsycon_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dsyconRook, 'ndarray', ndarray );


// EXPORTS //

export default dsyconRook;
