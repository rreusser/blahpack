
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zungr2 from './zungr2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zungr2, 'ndarray', ndarray );


// EXPORTS //

export default zungr2;
