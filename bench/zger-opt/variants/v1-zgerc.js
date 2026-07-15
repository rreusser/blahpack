// Optimized zgerc: register-blocked, layout-adaptive complex rank-1 update
// (conjugates y). Shares one kernel with zgeru; `conj` resolved outside loops.
import makeZger from './make-kernel.js';

export default makeZger( true );
