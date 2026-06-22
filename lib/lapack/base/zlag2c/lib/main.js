
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlag2c from './zlag2c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlag2c, 'ndarray', ndarray );


// EXPORTS //

export default zlag2c;
