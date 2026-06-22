// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zhetf2 from './zhetf2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zhetf2, 'ndarray', ndarray );


// EXPORTS //

export default zhetf2;
