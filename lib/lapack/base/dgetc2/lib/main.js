// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dgetc2 from './dgetc2.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dgetc2, 'ndarray', ndarray );


// EXPORTS //

export default dgetc2;
