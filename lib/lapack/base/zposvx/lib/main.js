// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zposvx from './zposvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zposvx, 'ndarray', ndarray );


// EXPORTS //

export default zposvx;
