program test_dlasyf_rook
  use test_utils
  implicit none
  ! Heavy rook-pivoting case (ticket 0102)
  double precision :: AB(40, 40), WB(40, 32), eB(40)
  integer :: IPIVB(40), ib, jb
  double precision :: a(100), w(100)
  integer :: ipiv(10), info, kb

  ! Test 1: 6x6 symmetric indefinite, UPLO='L', NB=3 (partial panel)
  a = 0.0d0
  a(1) = 2.0d0; a(2) = -1.0d0; a(3) = 0.0d0; a(4) = 1.0d0; a(5) = 0.0d0; a(6) = 0.0d0
  a(7) = 0.0d0; a(8) = 3.0d0; a(9) = -1.0d0; a(10) = 0.0d0; a(11) = 1.0d0; a(12) = 0.0d0
  a(13) = 0.0d0; a(14) = 0.0d0; a(15) = 2.0d0; a(16) = -1.0d0; a(17) = 0.0d0; a(18) = 1.0d0
  a(19) = 0.0d0; a(20) = 0.0d0; a(21) = 0.0d0; a(22) = 4.0d0; a(23) = -1.0d0; a(24) = 0.0d0
  a(25) = 0.0d0; a(26) = 0.0d0; a(27) = 0.0d0; a(28) = 0.0d0; a(29) = 3.0d0; a(30) = -1.0d0
  a(31) = 0.0d0; a(32) = 0.0d0; a(33) = 0.0d0; a(34) = 0.0d0; a(35) = 0.0d0; a(36) = 2.0d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('L', 6, 3, kb, a, 6, ipiv, w, 6, info)
  call begin_test('6x6_lower_nb3')
  call print_array('a', a, 36)
  call print_int_array('ipiv', ipiv, 6)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 2: 6x6 symmetric indefinite, UPLO='U', NB=3
  a = 0.0d0
  a(1) = 2.0d0
  a(7) = -1.0d0; a(8) = 3.0d0
  a(14) = -1.0d0; a(15) = 2.0d0
  a(19) = 1.0d0; a(22) = 4.0d0
  a(26) = 1.0d0; a(28) = -1.0d0; a(29) = 3.0d0
  a(33) = 1.0d0; a(35) = -1.0d0; a(36) = 2.0d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('U', 6, 3, kb, a, 6, ipiv, w, 6, info)
  call begin_test('6x6_upper_nb3')
  call print_array('a', a, 36)
  call print_int_array('ipiv', ipiv, 6)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 3: 6x6 with zero diagonal (forces 2x2 pivots), UPLO='L', NB=3
  a = 0.0d0
  a(1) = 0.0d0; a(2) = 3.0d0; a(3) = 1.0d0; a(4) = 2.0d0; a(5) = 0.0d0; a(6) = 1.0d0
  a(8) = 0.0d0; a(9) = 2.0d0; a(10) = 1.0d0; a(11) = 3.0d0; a(12) = 0.0d0
  a(15) = 0.0d0; a(16) = 1.0d0; a(17) = 2.0d0; a(18) = 3.0d0
  a(22) = 5.0d0; a(23) = 1.0d0; a(24) = 2.0d0
  a(29) = 0.0d0; a(30) = 1.0d0
  a(36) = 0.0d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('L', 6, 3, kb, a, 6, ipiv, w, 6, info)
  call begin_test('6x6_indef_lower_nb3')
  call print_array('a', a, 36)
  call print_int_array('ipiv', ipiv, 6)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 4: 6x6 with zero diagonal, UPLO='U', NB=3
  a = 0.0d0
  a(1) = 0.0d0
  a(7) = 3.0d0; a(8) = 0.0d0
  a(13) = 1.0d0; a(14) = 2.0d0; a(15) = 0.0d0
  a(19) = 2.0d0; a(20) = 1.0d0; a(21) = 1.0d0; a(22) = 5.0d0
  a(25) = 0.0d0; a(26) = 3.0d0; a(27) = 2.0d0; a(28) = 1.0d0; a(29) = 0.0d0
  a(31) = 1.0d0; a(32) = 0.0d0; a(33) = 3.0d0; a(34) = 2.0d0; a(35) = 1.0d0; a(36) = 0.0d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('U', 6, 3, kb, a, 6, ipiv, w, 6, info)
  call begin_test('6x6_indef_upper_nb3')
  call print_array('a', a, 36)
  call print_int_array('ipiv', ipiv, 6)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 5: NB >= N (full factorization), UPLO='L'
  a = 0.0d0
  a(1) = 4.0d0; a(2) = 1.0d0; a(3) = 2.0d0; a(4) = 0.5d0
  a(6) = 3.0d0; a(7) = 0.5d0; a(8) = 1.0d0
  a(11) = 5.0d0; a(12) = 0.2d0
  a(16) = 6.0d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('L', 4, 8, kb, a, 4, ipiv, w, 4, info)
  call begin_test('4x4_lower_full_nb8')
  call print_array('a', a, 16)
  call print_int_array('ipiv', ipiv, 4)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 6: NB >= N (full factorization), UPLO='U'
  a = 0.0d0
  a(1) = 4.0d0
  a(5) = 1.0d0; a(6) = 3.0d0
  a(9) = 2.0d0; a(10) = 0.5d0; a(11) = 5.0d0
  a(13) = 0.5d0; a(14) = 1.0d0; a(15) = 0.2d0; a(16) = 6.0d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('U', 4, 8, kb, a, 4, ipiv, w, 4, info)
  call begin_test('4x4_upper_full_nb8')
  call print_array('a', a, 16)
  call print_int_array('ipiv', ipiv, 4)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 7: rook chase pattern, LOWER, NB >= N. Exponentially growing off-diagonals
  ! force rook search to iterate with P != K at a 2x2 pivot.
  a = 0.0d0
  a(1) = 0.1d0; a(2) = 1.0d0; a(3) = 2.0d0; a(4) = 3.0d0; a(5) = 4.0d0
  a(7) = 0.1d0; a(8) = 5.0d0; a(9) = 10.0d0; a(10) = 20.0d0
  a(13) = 0.1d0; a(14) = 50.0d0; a(15) = 100.0d0
  a(19) = 0.1d0; a(20) = 500.0d0
  a(25) = 0.1d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('L', 5, 8, kb, a, 5, ipiv, w, 5, info)
  call begin_test('5x5_chase_lower_full')
  call print_array('a', a, 25)
  call print_int_array('ipiv', ipiv, 5)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 8: rook chase pattern, UPPER, NB >= N
  a = 0.0d0
  a(1) = 0.1d0
  a(6) = 1.0d0; a(7) = 0.1d0
  a(11) = 2.0d0; a(12) = 5.0d0; a(13) = 0.1d0
  a(16) = 3.0d0; a(17) = 10.0d0; a(18) = 50.0d0; a(19) = 0.1d0
  a(21) = 4.0d0; a(22) = 20.0d0; a(23) = 100.0d0; a(24) = 500.0d0; a(25) = 0.1d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('U', 5, 8, kb, a, 5, ipiv, w, 5, info)
  call begin_test('5x5_chase_upper_full')
  call print_array('a', a, 25)
  call print_int_array('ipiv', ipiv, 5)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 9: rook chase, LOWER, NB=3 (partial panel)
  a = 0.0d0
  a(1) = 0.1d0; a(2) = 1.0d0; a(3) = 2.0d0; a(4) = 3.0d0; a(5) = 4.0d0
  a(7) = 0.1d0; a(8) = 5.0d0; a(9) = 10.0d0; a(10) = 20.0d0
  a(13) = 0.1d0; a(14) = 50.0d0; a(15) = 100.0d0
  a(19) = 0.1d0; a(20) = 500.0d0
  a(25) = 0.1d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('L', 5, 3, kb, a, 5, ipiv, w, 5, info)
  call begin_test('5x5_chase_lower_nb3')
  call print_array('a', a, 25)
  call print_int_array('ipiv', ipiv, 5)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! Test 10: rook chase, UPPER, NB=3 (partial panel)
  a = 0.0d0
  a(1) = 0.1d0
  a(6) = 1.0d0; a(7) = 0.1d0
  a(11) = 2.0d0; a(12) = 5.0d0; a(13) = 0.1d0
  a(16) = 3.0d0; a(17) = 10.0d0; a(18) = 50.0d0; a(19) = 0.1d0
  a(21) = 4.0d0; a(22) = 20.0d0; a(23) = 100.0d0; a(24) = 500.0d0; a(25) = 0.1d0
  w = 0.0d0
  ipiv = 0
  kb = 0
  call dlasyf_rook('U', 5, 3, kb, a, 5, ipiv, w, 5, info)
  call begin_test('5x5_chase_upper_nb3')
  call print_array('a', a, 25)
  call print_int_array('ipiv', ipiv, 5)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! 40x40 matrix needing heavy rook pivoting (2x2 pivots with P != K),
  ! a_ij = sin(i*j + i + j - 2), NB=32, UPLO='L' (ticket 0102)
  do jb = 1, 40
    do ib = 1, 40
      AB(ib, jb) = sin(dble(ib*jb + ib + jb - 2))
    end do
  end do
  WB = 0.0d0
  eB = 0.0d0
  IPIVB = 0
  kb = 0
  call dlasyf_rook('L', 40, 32, kb, AB, 40, IPIVB, WB, 40, info)
  call begin_test('lower_40x40_pivot40_nb32')
  call print_array('a', AB, 1600)
  call print_int_array('ipiv', IPIVB, 40)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

  ! 40x40 matrix needing heavy rook pivoting (2x2 pivots with P != K),
  ! a_ij = sin(i*j + i + j - 2), NB=32, UPLO='U' (ticket 0102)
  do jb = 1, 40
    do ib = 1, 40
      AB(ib, jb) = sin(dble(ib*jb + ib + jb - 2))
    end do
  end do
  WB = 0.0d0
  eB = 0.0d0
  IPIVB = 0
  kb = 0
  call dlasyf_rook('U', 40, 32, kb, AB, 40, IPIVB, WB, 40, info)
  call begin_test('upper_40x40_pivot40_nb32')
  call print_array('a', AB, 1600)
  call print_int_array('ipiv', IPIVB, 40)
  call print_int('kb', kb)
  call print_int('info', info)
  call end_test()

end program
