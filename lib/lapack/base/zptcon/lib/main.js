// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zptcon from './zptcon.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zptcon, 'ndarray', ndarray );


// EXPORTS //

export default zptcon;
