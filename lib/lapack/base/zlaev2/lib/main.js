
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlaev2 from './zlaev2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlaev2, 'ndarray', ndarray );


// EXPORTS //

export default zlaev2;
