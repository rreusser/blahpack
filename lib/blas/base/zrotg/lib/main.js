// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zrotg from './zrotg.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zrotg, 'ndarray', ndarray );


// EXPORTS //

export default zrotg;
