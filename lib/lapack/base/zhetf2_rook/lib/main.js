
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetf2Rook from './zhetf2_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetf2Rook, 'ndarray', ndarray );


// EXPORTS //

export default zhetf2Rook;
