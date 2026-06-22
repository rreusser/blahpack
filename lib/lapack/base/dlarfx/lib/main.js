// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import dlarfx from './dlarfx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( dlarfx, 'ndarray', ndarray );


// EXPORTS //

export default dlarfx;
