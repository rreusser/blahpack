// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrsen from './ztrsen.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrsen, 'ndarray', ndarray );


// EXPORTS //

export default ztrsen;
