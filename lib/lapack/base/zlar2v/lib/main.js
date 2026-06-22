// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlar2v from './zlar2v.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlar2v, 'ndarray', ndarray );


// EXPORTS //

export default zlar2v;
