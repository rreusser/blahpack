

// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zgeql2 from './zgeql2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zgeql2, 'ndarray', ndarray );


// EXPORTS //

export default zgeql2;
