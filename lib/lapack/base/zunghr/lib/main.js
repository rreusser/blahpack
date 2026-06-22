// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zunghr from './zunghr.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zunghr, 'ndarray', ndarray );


// EXPORTS //

export default zunghr;
