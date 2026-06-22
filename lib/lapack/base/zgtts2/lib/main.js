// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgtts2 from './zgtts2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgtts2, 'ndarray', ndarray );


// EXPORTS //

export default zgtts2;
