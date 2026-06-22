
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarzt from './zlarzt.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarzt, 'ndarray', ndarray );


// EXPORTS //

export default zlarzt;
