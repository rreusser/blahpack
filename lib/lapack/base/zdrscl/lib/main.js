// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zdrscl from './zdrscl.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zdrscl, 'ndarray', ndarray );


// EXPORTS //

export default zdrscl;
