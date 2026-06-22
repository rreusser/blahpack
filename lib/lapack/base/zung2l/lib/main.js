// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zung2l from './zung2l.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zung2l, 'ndarray', ndarray );


// EXPORTS //

export default zung2l;
