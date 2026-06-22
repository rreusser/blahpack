// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zheconRook from './zhecon_rook.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zheconRook, 'ndarray', ndarray );


// EXPORTS //

export default zheconRook;
