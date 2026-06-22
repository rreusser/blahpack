
// MODULES //

import setReadOnly from '@stdlib/utils/define-nonenumerable-read-only-property/lib/index.js';
import zlarfx from './zlarfx.js';
import ndarray from './ndarray.js';


// MAIN //

setReadOnly( zlarfx, 'ndarray', ndarray );


// EXPORTS //

export default zlarfx;
