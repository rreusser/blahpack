

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zspsvx from './zspsvx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zspsvx, 'ndarray', ndarray );


// EXPORTS //

export default zspsvx;
