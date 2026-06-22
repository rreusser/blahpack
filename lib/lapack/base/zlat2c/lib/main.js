
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlat2c from './zlat2c.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlat2c, 'ndarray', ndarray );


// EXPORTS //

export default zlat2c;
