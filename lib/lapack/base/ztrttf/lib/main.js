// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import ztrttf from './ztrttf.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( ztrttf, 'ndarray', ndarray );


// EXPORTS //

export default ztrttf;
