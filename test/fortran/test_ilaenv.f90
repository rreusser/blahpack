program test_ilaenv
  ! Fixtures for ILAENV (generated name list; see the comments below).
  !
  ! 'name_NNN': ILAENV( ISPEC, NAME, OPTS, N1, N2, N3, N4 ) for ISPEC = 0..18
  ! and every (N1, N2, N3, N4) tuple of 'tuples', for:
  !   * every (NAME, OPTS) of an ILAENV call in data/lapack-3.12.0/SRC/[dz]*.f
  !     (135 pairs; an OPTS that the caller builds from its arguments is
  !     given one representative value: ILAENV does not read OPTS);
  !   * names that reach the branches no caller reaches: S/C prefixes,
  !     lower and mixed case, non-LAPACK prefixes, other suffixes.
  ! The tuples cross every threshold of ILAENV and IPARMQ (N1*N2 <= 131072,
  ! N1 <= 8192, N3 = 1/2, N2/N4 <= 64, the xTRSYL bounds, NH = N3-N2+1).
  ! 'ispec6_sweep': ISPEC = 6 (INT( REAL( MIN( N1, N2 ) ) * 1.6 )) over many N.
  use test_utils
  implicit none
  integer, parameter :: nnames = 193, ntup = 26
  character(len=20) :: names(nnames)
  character(len=4) :: opts(nnames)
  integer :: nlen(nnames), olen(nnames)
  integer :: tup(4, ntup)
  integer :: res(19*ntup), s6n(3100), s6r(3100)
  integer :: i, j, k, n6, ilaenv
  external ilaenv
  character(len=16) :: nm

  names(1) = 'DBDSDC'; nlen(1) = 6; opts(1) = ' '; olen(1) = 1
  names(2) = 'DGBTRF'; nlen(2) = 6; opts(2) = ' '; olen(2) = 1
  names(3) = 'DGEBRD'; nlen(3) = 6; opts(3) = ' '; olen(3) = 1
  names(4) = 'DGEHRD'; nlen(4) = 6; opts(4) = ' '; olen(4) = 1
  names(5) = 'DORGHR'; nlen(5) = 6; opts(5) = ' '; olen(5) = 1
  names(6) = 'DGELQ '; nlen(6) = 6; opts(6) = ' '; olen(6) = 1
  names(7) = 'DGELQF'; nlen(7) = 6; opts(7) = ' '; olen(7) = 1
  names(8) = 'DGEQRF'; nlen(8) = 6; opts(8) = ' '; olen(8) = 1
  names(9) = 'DORMQR'; nlen(9) = 6; opts(9) = 'LN'; olen(9) = 2
  names(10) = 'DORMQR'; nlen(10) = 6; opts(10) = 'LT'; olen(10) = 2
  names(11) = 'DORMLQ'; nlen(11) = 6; opts(11) = 'LT'; olen(11) = 2
  names(12) = 'DORMLQ'; nlen(12) = 6; opts(12) = 'LN'; olen(12) = 2
  names(13) = 'DGELSD'; nlen(13) = 6; opts(13) = ' '; olen(13) = 1
  names(14) = 'DORMBR'; nlen(14) = 6; opts(14) = 'QLT'; olen(14) = 3
  names(15) = 'DORMBR'; nlen(15) = 6; opts(15) = 'PLN'; olen(15) = 3
  names(16) = 'DGELSS'; nlen(16) = 6; opts(16) = ' '; olen(16) = 1
  names(17) = 'DGELST'; nlen(17) = 6; opts(17) = ' '; olen(17) = 1
  names(18) = 'DGERQF'; nlen(18) = 6; opts(18) = ' '; olen(18) = 1
  names(19) = 'DORMQR'; nlen(19) = 6; opts(19) = ' '; olen(19) = 1
  names(20) = 'DORMRQ'; nlen(20) = 6; opts(20) = ' '; olen(20) = 1
  names(21) = 'DGEQLF'; nlen(21) = 6; opts(21) = ' '; olen(21) = 1
  names(22) = 'DGEQP3RK'; nlen(22) = 8; opts(22) = ' '; olen(22) = 1
  names(23) = 'DGEQR '; nlen(23) = 6; opts(23) = ' '; olen(23) = 1
  names(24) = 'DGESVD'; nlen(24) = 6; opts(24) = 'AA'; olen(24) = 2
  names(25) = 'DORMLQ'; nlen(25) = 6; opts(25) = ' '; olen(25) = 1
  names(26) = 'DGETRF'; nlen(26) = 6; opts(26) = ' '; olen(26) = 1
  names(27) = 'DGETRI'; nlen(27) = 6; opts(27) = ' '; olen(27) = 1
  names(28) = 'DORGQR'; nlen(28) = 6; opts(28) = ' '; olen(28) = 1
  names(29) = 'DGGHD3'; nlen(29) = 6; opts(29) = ' '; olen(29) = 1
  names(30) = 'DGTTRS'; nlen(30) = 6; opts(30) = 'N'; olen(30) = 1
  names(31) = 'DHSEQR'; nlen(31) = 6; opts(31) = 'SI'; olen(31) = 2
  names(32) = 'DLAED0'; nlen(32) = 6; opts(32) = ' '; olen(32) = 1
  names(33) = 'DLAORHR_COL_GETRFNP'; nlen(33) = 19; opts(33) = ' '; olen(33) = 1
  names(34) = 'DLAQR0'; nlen(34) = 6; opts(34) = 'SV'; olen(34) = 2
  names(35) = 'DLAQR3'; nlen(35) = 6; opts(35) = 'SV'; olen(35) = 2
  names(36) = 'DLAQR4'; nlen(36) = 6; opts(36) = 'SV'; olen(36) = 2
  names(37) = 'DLAQZ0'; nlen(37) = 6; opts(37) = 'SV'; olen(37) = 2
  names(38) = 'DSTEBZ'; nlen(38) = 6; opts(38) = ' '; olen(38) = 1
  names(39) = 'DLASQ2'; nlen(39) = 6; opts(39) = 'N'; olen(39) = 1
  names(40) = 'DLATRS'; nlen(40) = 6; opts(40) = ''; olen(40) = 0
  names(41) = 'DLAUUM'; nlen(41) = 6; opts(41) = 'U'; olen(41) = 1
  names(42) = 'DORGLQ'; nlen(42) = 6; opts(42) = ' '; olen(42) = 1
  names(43) = 'DORGQL'; nlen(43) = 6; opts(43) = ' '; olen(43) = 1
  names(44) = 'DORGRQ'; nlen(44) = 6; opts(44) = ' '; olen(44) = 1
  names(45) = 'DORMQL'; nlen(45) = 6; opts(45) = 'LT'; olen(45) = 2
  names(46) = 'DORMRQ'; nlen(46) = 6; opts(46) = 'LT'; olen(46) = 2
  names(47) = 'DPBTRF'; nlen(47) = 6; opts(47) = 'U'; olen(47) = 1
  names(48) = 'DPOTRF'; nlen(48) = 6; opts(48) = 'U'; olen(48) = 1
  names(49) = 'DPTTRS'; nlen(49) = 6; opts(49) = ' '; olen(49) = 1
  names(50) = 'DSTEDC'; nlen(50) = 6; opts(50) = ' '; olen(50) = 1
  names(51) = 'DSTEVR'; nlen(51) = 6; opts(51) = 'N'; olen(51) = 1
  names(52) = 'DSYTRD'; nlen(52) = 6; opts(52) = 'U'; olen(52) = 1
  names(53) = 'DSYEVR'; nlen(53) = 6; opts(53) = 'N'; olen(53) = 1
  names(54) = 'DORMTR'; nlen(54) = 6; opts(54) = 'U'; olen(54) = 1
  names(55) = 'DSYGST'; nlen(55) = 6; opts(55) = 'U'; olen(55) = 1
  names(56) = 'DSYTRF'; nlen(56) = 6; opts(56) = 'U'; olen(56) = 1
  names(57) = 'DSYTRF_AA'; nlen(57) = 9; opts(57) = 'U'; olen(57) = 1
  names(58) = 'DSYTRF_AA_2STAGE'; nlen(58) = 16; opts(58) = 'U'; olen(58) = 1
  names(59) = 'DSYTRF_RK'; nlen(59) = 9; opts(59) = 'U'; olen(59) = 1
  names(60) = 'DSYTRF_ROOK'; nlen(60) = 11; opts(60) = 'U'; olen(60) = 1
  names(61) = 'DSYTRI2'; nlen(61) = 7; opts(61) = 'U'; olen(61) = 1
  names(62) = 'DSYTRI_3'; nlen(62) = 8; opts(62) = 'U'; olen(62) = 1
  names(63) = 'DTGSYL'; nlen(63) = 6; opts(63) = 'N'; olen(63) = 1
  names(64) = 'DTREVC'; nlen(64) = 6; opts(64) = 'RB'; olen(64) = 2
  names(65) = 'DTRSYL'; nlen(65) = 6; opts(65) = ''; olen(65) = 0
  names(66) = 'DTRTRI'; nlen(66) = 6; opts(66) = 'UN'; olen(66) = 2
  names(67) = 'ZGBTRF'; nlen(67) = 6; opts(67) = ' '; olen(67) = 1
  names(68) = 'ZGEBRD'; nlen(68) = 6; opts(68) = ' '; olen(68) = 1
  names(69) = 'ZGEHRD'; nlen(69) = 6; opts(69) = ' '; olen(69) = 1
  names(70) = 'ZUNGHR'; nlen(70) = 6; opts(70) = ' '; olen(70) = 1
  names(71) = 'ZGELQ '; nlen(71) = 6; opts(71) = ' '; olen(71) = 1
  names(72) = 'ZGELQF'; nlen(72) = 6; opts(72) = ' '; olen(72) = 1
  names(73) = 'ZGEQRF'; nlen(73) = 6; opts(73) = ' '; olen(73) = 1
  names(74) = 'ZUNMQR'; nlen(74) = 6; opts(74) = 'LN'; olen(74) = 2
  names(75) = 'ZUNMQR'; nlen(75) = 6; opts(75) = 'LC'; olen(75) = 2
  names(76) = 'ZUNMLQ'; nlen(76) = 6; opts(76) = 'LC'; olen(76) = 2
  names(77) = 'ZUNMLQ'; nlen(77) = 6; opts(77) = 'LN'; olen(77) = 2
  names(78) = 'ZGELSD'; nlen(78) = 6; opts(78) = ' '; olen(78) = 1
  names(79) = 'ZUNMBR'; nlen(79) = 6; opts(79) = 'QLC'; olen(79) = 3
  names(80) = 'ZUNMBR'; nlen(80) = 6; opts(80) = 'PLN'; olen(80) = 3
  names(81) = 'ZGELSS'; nlen(81) = 6; opts(81) = ' '; olen(81) = 1
  names(82) = 'ZGELST'; nlen(82) = 6; opts(82) = ' '; olen(82) = 1
  names(83) = 'ZGERQF'; nlen(83) = 6; opts(83) = ' '; olen(83) = 1
  names(84) = 'ZUNMQR'; nlen(84) = 6; opts(84) = ' '; olen(84) = 1
  names(85) = 'ZUNMRQ'; nlen(85) = 6; opts(85) = ' '; olen(85) = 1
  names(86) = 'ZGEQLF'; nlen(86) = 6; opts(86) = ' '; olen(86) = 1
  names(87) = 'ZGEQP3RK'; nlen(87) = 8; opts(87) = ' '; olen(87) = 1
  names(88) = 'ZGEQR '; nlen(88) = 6; opts(88) = ' '; olen(88) = 1
  names(89) = 'ZGESVD'; nlen(89) = 6; opts(89) = 'AA'; olen(89) = 2
  names(90) = 'ZGETRF'; nlen(90) = 6; opts(90) = ' '; olen(90) = 1
  names(91) = 'ZGETRI'; nlen(91) = 6; opts(91) = ' '; olen(91) = 1
  names(92) = 'ZUNGQR'; nlen(92) = 6; opts(92) = ' '; olen(92) = 1
  names(93) = 'ZGGHD3'; nlen(93) = 6; opts(93) = ' '; olen(93) = 1
  names(94) = 'ZGTTRS'; nlen(94) = 6; opts(94) = 'N'; olen(94) = 1
  names(95) = 'ZHETRD'; nlen(95) = 6; opts(95) = 'U'; olen(95) = 1
  names(96) = 'ZHEEVR'; nlen(96) = 6; opts(96) = 'N'; olen(96) = 1
  names(97) = 'ZUNMTR'; nlen(97) = 6; opts(97) = 'U'; olen(97) = 1
  names(98) = 'ZHEGST'; nlen(98) = 6; opts(98) = 'U'; olen(98) = 1
  names(99) = 'ZHETRF'; nlen(99) = 6; opts(99) = 'U'; olen(99) = 1
  names(100) = 'ZHETRF_ROOK'; nlen(100) = 11; opts(100) = 'U'; olen(100) = 1
  names(101) = 'ZHETRF_AA'; nlen(101) = 9; opts(101) = 'U'; olen(101) = 1
  names(102) = 'ZHETRF_AA_2STAGE'; nlen(102) = 16; opts(102) = 'U'; olen(102) = 1
  names(103) = 'ZHETRF_RK'; nlen(103) = 9; opts(103) = 'U'; olen(103) = 1
  names(104) = 'ZHETRI_3'; nlen(104) = 8; opts(104) = 'U'; olen(104) = 1
  names(105) = 'ZHSEQR'; nlen(105) = 6; opts(105) = 'SI'; olen(105) = 2
  names(106) = 'ZLAED0'; nlen(106) = 6; opts(106) = ' '; olen(106) = 1
  names(107) = 'ZLAQR0'; nlen(107) = 6; opts(107) = 'SV'; olen(107) = 2
  names(108) = 'ZLAQR3'; nlen(108) = 6; opts(108) = 'SV'; olen(108) = 2
  names(109) = 'ZLAQR4'; nlen(109) = 6; opts(109) = 'SV'; olen(109) = 2
  names(110) = 'ZLAQZ0'; nlen(110) = 6; opts(110) = 'SV'; olen(110) = 2
  names(111) = 'ZLATRS'; nlen(111) = 6; opts(111) = ''; olen(111) = 0
  names(112) = 'ZLAUNHR_COL_GETRFNP'; nlen(112) = 19; opts(112) = ' '; olen(112) = 1
  names(113) = 'ZLAUUM'; nlen(113) = 6; opts(113) = 'U'; olen(113) = 1
  names(114) = 'ZPBTRF'; nlen(114) = 6; opts(114) = 'U'; olen(114) = 1
  names(115) = 'ZPOTRF'; nlen(115) = 6; opts(115) = 'U'; olen(115) = 1
  names(116) = 'ZPTTRS'; nlen(116) = 6; opts(116) = 'U'; olen(116) = 1
  names(117) = 'ZSTEDC'; nlen(117) = 6; opts(117) = ' '; olen(117) = 1
  names(118) = 'ZSYTRF'; nlen(118) = 6; opts(118) = 'U'; olen(118) = 1
  names(119) = 'ZSYTRF_AA'; nlen(119) = 9; opts(119) = 'U'; olen(119) = 1
  names(120) = 'ZSYTRF_AA_2STAGE'; nlen(120) = 16; opts(120) = 'U'; olen(120) = 1
  names(121) = 'ZSYTRF_RK'; nlen(121) = 9; opts(121) = 'U'; olen(121) = 1
  names(122) = 'ZSYTRF_ROOK'; nlen(122) = 11; opts(122) = 'U'; olen(122) = 1
  names(123) = 'ZSYTRI2'; nlen(123) = 7; opts(123) = 'U'; olen(123) = 1
  names(124) = 'ZSYTRI_3'; nlen(124) = 8; opts(124) = 'U'; olen(124) = 1
  names(125) = 'ZTGSYL'; nlen(125) = 6; opts(125) = 'N'; olen(125) = 1
  names(126) = 'ZTREVC'; nlen(126) = 6; opts(126) = 'RB'; olen(126) = 2
  names(127) = 'ZTRSYL'; nlen(127) = 6; opts(127) = ''; olen(127) = 0
  names(128) = 'ZTRTRI'; nlen(128) = 6; opts(128) = 'UN'; olen(128) = 2
  names(129) = 'ZUNGLQ'; nlen(129) = 6; opts(129) = ' '; olen(129) = 1
  names(130) = 'ZUNGQL'; nlen(130) = 6; opts(130) = ' '; olen(130) = 1
  names(131) = 'ZUNGRQ'; nlen(131) = 6; opts(131) = ' '; olen(131) = 1
  names(132) = 'ZUNMQR'; nlen(132) = 6; opts(132) = 'LT'; olen(132) = 2
  names(133) = 'ZUNMLQ'; nlen(133) = 6; opts(133) = 'LT'; olen(133) = 2
  names(134) = 'ZUNMQL'; nlen(134) = 6; opts(134) = 'LT'; olen(134) = 2
  names(135) = 'ZUNMRQ'; nlen(135) = 6; opts(135) = 'LT'; olen(135) = 2
  names(136) = 'dgeqrf'; nlen(136) = 6; opts(136) = ' '; olen(136) = 1
  names(137) = 'dGEQRF'; nlen(137) = 6; opts(137) = ' '; olen(137) = 1
  names(138) = 'Dgeqrf'; nlen(138) = 6; opts(138) = ' '; olen(138) = 1
  names(139) = 'Zgeqrf'; nlen(139) = 6; opts(139) = ' '; olen(139) = 1
  names(140) = 'zunmqr'; nlen(140) = 6; opts(140) = 'LN'; olen(140) = 2
  names(141) = 'dsytrf_aa_2stage'; nlen(141) = 16; opts(141) = 'U'; olen(141) = 1
  names(142) = 'SGEQRF'; nlen(142) = 6; opts(142) = ' '; olen(142) = 1
  names(143) = 'CGEQRF'; nlen(143) = 6; opts(143) = ' '; olen(143) = 1
  names(144) = 'SSYTRD'; nlen(144) = 6; opts(144) = 'U'; olen(144) = 1
  names(145) = 'CHETRD'; nlen(145) = 6; opts(145) = 'U'; olen(145) = 1
  names(146) = 'SORMQR'; nlen(146) = 6; opts(146) = 'LN'; olen(146) = 2
  names(147) = 'CUNMQR'; nlen(147) = 6; opts(147) = 'LN'; olen(147) = 2
  names(148) = 'STRSYL'; nlen(148) = 6; opts(148) = 'NN'; olen(148) = 2
  names(149) = 'CTRSYL'; nlen(149) = 6; opts(149) = 'NN'; olen(149) = 2
  names(150) = 'XGEQRF'; nlen(150) = 6; opts(150) = ' '; olen(150) = 1
  names(151) = 'ILAENV'; nlen(151) = 6; opts(151) = ' '; olen(151) = 1
  names(152) = ''; nlen(152) = 0; opts(152) = ' '; olen(152) = 1
  names(153) = ' DGEQRF'; nlen(153) = 7; opts(153) = ' '; olen(153) = 1
  names(154) = 'DORGTR'; nlen(154) = 6; opts(154) = 'U'; olen(154) = 1
  names(155) = 'DORGBR'; nlen(155) = 6; opts(155) = 'Q'; olen(155) = 1
  names(156) = 'DORMHR'; nlen(156) = 6; opts(156) = 'LN'; olen(156) = 2
  names(157) = 'DORGL2'; nlen(157) = 6; opts(157) = ' '; olen(157) = 1
  names(158) = 'DORXQR'; nlen(158) = 6; opts(158) = ' '; olen(158) = 1
  names(159) = 'DORMTR'; nlen(159) = 6; opts(159) = 'LUN'; olen(159) = 3
  names(160) = 'DORMRZ'; nlen(160) = 6; opts(160) = 'LN'; olen(160) = 2
  names(161) = 'ZUNGTR'; nlen(161) = 6; opts(161) = 'U'; olen(161) = 1
  names(162) = 'ZUNGBR'; nlen(162) = 6; opts(162) = 'Q'; olen(162) = 1
  names(163) = 'ZUNMHR'; nlen(163) = 6; opts(163) = 'LN'; olen(163) = 2
  names(164) = 'ZSYTRD'; nlen(164) = 6; opts(164) = 'U'; olen(164) = 1
  names(165) = 'ZSYGST'; nlen(165) = 6; opts(165) = 'U'; olen(165) = 1
  names(166) = 'DHETRF'; nlen(166) = 6; opts(166) = 'U'; olen(166) = 1
  names(167) = 'DHETRD'; nlen(167) = 6; opts(167) = 'U'; olen(167) = 1
  names(168) = 'DUNGQR'; nlen(168) = 6; opts(168) = ' '; olen(168) = 1
  names(169) = 'ZORGQR'; nlen(169) = 6; opts(169) = ' '; olen(169) = 1
  names(170) = 'ZSTEBZ'; nlen(170) = 6; opts(170) = ' '; olen(170) = 1
  names(171) = 'DSTEQR'; nlen(171) = 6; opts(171) = ' '; olen(171) = 1
  names(172) = 'DGGHRD'; nlen(172) = 6; opts(172) = ' '; olen(172) = 1
  names(173) = 'DGGBAL'; nlen(173) = 6; opts(173) = ' '; olen(173) = 1
  names(174) = 'DGEQP3'; nlen(174) = 6; opts(174) = ' '; olen(174) = 1
  names(175) = 'DGEQR2'; nlen(175) = 6; opts(175) = ' '; olen(175) = 1
  names(176) = 'DPOTRS'; nlen(176) = 6; opts(176) = ' '; olen(176) = 1
  names(177) = 'DPBTRS'; nlen(177) = 6; opts(177) = ' '; olen(177) = 1
  names(178) = 'DGBTRS'; nlen(178) = 6; opts(178) = ' '; olen(178) = 1
  names(179) = 'DTRTRS'; nlen(179) = 6; opts(179) = ' '; olen(179) = 1
  names(180) = 'DLAXXX'; nlen(180) = 6; opts(180) = ' '; olen(180) = 1
  names(181) = 'DTRXXX'; nlen(181) = 6; opts(181) = ' '; olen(181) = 1
  names(182) = 'DPOXXX'; nlen(182) = 6; opts(182) = ' '; olen(182) = 1
  names(183) = 'DGBXXX'; nlen(183) = 6; opts(183) = ' '; olen(183) = 1
  names(184) = 'DPBXXX'; nlen(184) = 6; opts(184) = ' '; olen(184) = 1
  names(185) = 'DSYTRF_2STAGE'; nlen(185) = 13; opts(185) = 'U'; olen(185) = 1
  names(186) = 'DSYTRF_XY2Z'; nlen(186) = 11; opts(186) = 'U'; olen(186) = 1
  names(187) = 'ZHETRF_XY2Z'; nlen(187) = 11; opts(187) = 'U'; olen(187) = 1
  names(188) = 'DSYTRF2'; nlen(188) = 7; opts(188) = 'U'; olen(188) = 1
  names(189) = 'DGEXXX'; nlen(189) = 6; opts(189) = ' '; olen(189) = 1
  names(190) = 'ZHEXXX'; nlen(190) = 6; opts(190) = ' '; olen(190) = 1
  names(191) = 'DSYXXX'; nlen(191) = 6; opts(191) = ' '; olen(191) = 1
  names(192) = 'DLAORHR'; nlen(192) = 7; opts(192) = ' '; olen(192) = 1
  names(193) = 'DTREXC'; nlen(193) = 6; opts(193) = ' '; olen(193) = 1
  tup(:, 1) = (/ 0, 0, 0, 0 /)
  tup(:, 2) = (/ -1, -1, -1, -1 /)
  tup(:, 3) = (/ 1, 1, 1, 1 /)
  tup(:, 4) = (/ 10, 10, -1, -1 /)
  tup(:, 5) = (/ 100, 100, 1, -1 /)
  tup(:, 6) = (/ 100, 100, 2, -1 /)
  tup(:, 7) = (/ 100, 100, 100, 100 /)
  tup(:, 8) = (/ 9000, 10, 1, -1 /)
  tup(:, 9) = (/ 9000, 20, 1, -1 /)
  tup(:, 10) = (/ 9000, 20, 2, -1 /)
  tup(:, 11) = (/ 8192, 100, 1, 2 /)
  tup(:, 12) = (/ 8193, 17, 2, -1 /)
  tup(:, 13) = (/ 64, 64, 64, 64 /)
  tup(:, 14) = (/ 65, 65, 65, 65 /)
  tup(:, 15) = (/ 300, 300, 0, 0 /)
  tup(:, 16) = (/ 301, 400, 0, 0 /)
  tup(:, 17) = (/ 400, 500, 1, 2 /)
  tup(:, 18) = (/ 1000, 1000, 3, 3 /)
  tup(:, 19) = (/ 1500, 1600, 2, 1 /)
  tup(:, 20) = (/ 1600, 1600, 1, 1 /)
  tup(:, 21) = (/ 200, 1, 200, -1 /)
  tup(:, 22) = (/ 1000, 1, 600, -1 /)
  tup(:, 23) = (/ 7000, 1, 7000, -1 /)
  tup(:, 24) = (/ 5, 3, 4, 7 /)
  tup(:, 25) = (/ 31, 7, 31, 65 /)
  tup(:, 26) = (/ 50, 10, 200, -1 /)

  call begin_test('tuples')
  call print_int_array('n1', tup(1, :), ntup)
  call print_int_array('n2', tup(2, :), ntup)
  call print_int_array('n3', tup(3, :), ntup)
  call print_int_array('n4', tup(4, :), ntup)
  call end_test()

  ! res( ispec*ntup + j ) for ispec = 0..18 and tuple j
  do k = 1, nnames
    do i = 0, 18
      do j = 1, ntup
        res( i*ntup + j ) = ilaenv( i, names(k)(1:nlen(k)), opts(k)(1:olen(k)), &
                                    tup(1, j), tup(2, j), tup(3, j), tup(4, j) )
      end do
    end do
    write(nm, '(A,I3.3)') 'name_', k
    call begin_test(trim(nm))
    write(*, '(A,A,A)', advance='no') ',"routine":"', names(k)(1:nlen(k)), '"'
    write(*, '(A,A,A)', advance='no') ',"opts":"', opts(k)(1:olen(k)), '"'
    call print_int_array('result', res, 19*ntup)
    call end_test()
  end do

  ! ISPEC = 6 over N = -5..3000 and a few large N (N1 = N, N2 = N + 1)
  n6 = 0
  do i = -5, 3000
    n6 = n6 + 1
    s6n(n6) = i
  end do
  s6n(n6+1) = 16777215
  s6n(n6+2) = 16777217
  s6n(n6+3) = 100000007
  s6n(n6+4) = 1000000000
  n6 = n6 + 4
  do i = 1, n6
    s6r(i) = ilaenv( 6, 'DGESVD', 'AA', s6n(i), s6n(i) + 1, 0, 0 )
  end do
  call begin_test('ispec6_sweep')
  call print_int_array('n', s6n, n6)
  call print_int_array('result', s6r, n6)
  call end_test()

  ! xTRSYL's block size reads MIN( N1, N2 ): either argument order
  call begin_test('trsyl_order')
  call print_int('d_small_first', ilaenv( 1, 'DTRSYL', 'NN', 400, 2000, 0, 0 ))
  call print_int('d_large_first', ilaenv( 1, 'DTRSYL', 'NN', 2000, 400, 0, 0 ))
  call print_int('z_small_first', ilaenv( 1, 'ZTRSYL', 'NN', 400, 2000, 0, 0 ))
  call print_int('z_large_first', ilaenv( 1, 'ZTRSYL', 'NN', 2000, 400, 0, 0 ))
  call end_test()
end program
