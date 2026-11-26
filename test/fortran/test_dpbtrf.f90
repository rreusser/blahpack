program test_dpbtrf
  use test_utils
  implicit none

  double precision :: ab(100)
  integer :: info, ldab

  ! The reference's blocked path needs ILAENV( 1, 'DPBTRF' ) = 32, which it
  ! gives only when KD > 64, and NB <= KD
  integer, parameter :: N_BLK = 100, KD_BLK = 65
  integer, parameter :: LDAB_BLK = KD_BLK + 1
  double precision :: ab_blk(LDAB_BLK, N_BLK)
  integer :: i, j

  ! ===== Test 1: UPLO='U', N=5, KD=1 (tridiagonal, unblocked path) =====
  ! A = tridiag(-1, 2, -1)
  ldab = 2
  ab = 0.0d0
  ab(1) = 0.0d0;  ab(2) = 2.0d0
  ab(3) = -1.0d0; ab(4) = 2.0d0
  ab(5) = -1.0d0; ab(6) = 2.0d0
  ab(7) = -1.0d0; ab(8) = 2.0d0
  ab(9) = -1.0d0; ab(10) = 2.0d0

  call dpbtrf('U', 5, 1, ab, ldab, info)
  call begin_test('upper_tridiag_5')
  call print_int('info', info)
  call print_array('ab', ab, 10)
  call end_test()

  ! ===== Test 2: UPLO='L', N=5, KD=1 (tridiagonal, unblocked path) =====
  ldab = 2
  ab = 0.0d0
  ab(1) = 2.0d0;  ab(2) = -1.0d0
  ab(3) = 2.0d0;  ab(4) = -1.0d0
  ab(5) = 2.0d0;  ab(6) = -1.0d0
  ab(7) = 2.0d0;  ab(8) = -1.0d0
  ab(9) = 2.0d0;  ab(10) = 0.0d0

  call dpbtrf('L', 5, 1, ab, ldab, info)
  call begin_test('lower_tridiag_5')
  call print_int('info', info)
  call print_array('ab', ab, 10)
  call end_test()

  ! ===== Test 3: N=0 (quick return) =====
  call dpbtrf('U', 0, 0, ab, 1, info)
  call begin_test('n_zero')
  call print_int('info', info)
  call end_test()

  ! ===== Test 4: N=1 =====
  ab(1) = 4.0d0
  call dpbtrf('L', 1, 0, ab, 1, info)
  call begin_test('n_one')
  call print_int('info', info)
  call print_array('ab', ab, 1)
  call end_test()

  ! ===== Test 5: UPLO='U', N=4, KD=2 (pentadiagonal) =====
  ldab = 3
  ab = 0.0d0
  ! Col 1
  ab(1) = 0.0d0; ab(2) = 0.0d0; ab(3) = 4.0d0
  ! Col 2
  ab(4) = 0.0d0; ab(5) = -1.0d0; ab(6) = 4.0d0
  ! Col 3
  ab(7) = 0.5d0; ab(8) = -1.0d0; ab(9) = 4.0d0
  ! Col 4
  ab(10) = 0.5d0; ab(11) = -1.0d0; ab(12) = 4.0d0

  call dpbtrf('U', 4, 2, ab, ldab, info)
  call begin_test('upper_penta_4')
  call print_int('info', info)
  call print_array('ab', ab, 12)
  call end_test()

  ! ===== Test 6: UPLO='L', N=4, KD=2 (pentadiagonal) =====
  ldab = 3
  ab = 0.0d0
  ! Col 1
  ab(1) = 4.0d0; ab(2) = -1.0d0; ab(3) = 0.5d0
  ! Col 2
  ab(4) = 4.0d0; ab(5) = -1.0d0; ab(6) = 0.5d0
  ! Col 3
  ab(7) = 4.0d0; ab(8) = -1.0d0; ab(9) = 0.0d0
  ! Col 4
  ab(10) = 4.0d0; ab(11) = 0.0d0; ab(12) = 0.0d0

  call dpbtrf('L', 4, 2, ab, ldab, info)
  call begin_test('lower_penta_4')
  call print_int('info', info)
  call print_array('ab', ab, 12)
  call end_test()

  ! ===== Test 7: Not positive definite =====
  ldab = 2
  ab = 0.0d0
  ab(1) = 1.0d0; ab(2) = 2.0d0
  ab(3) = 1.0d0; ab(4) = 0.0d0

  call dpbtrf('L', 2, 1, ab, ldab, info)
  call begin_test('not_posdef')
  call print_int('info', info)
  call print_array('ab', ab, 4)
  call end_test()

  ! ===== Test 8: UPLO='U', N=8, KD=2 (exercises blocked path if NB<=KD) =====
  ! Diag-dominant SPD banded matrix
  ldab = 3
  ab = 0.0d0
  ! Build: diag=6, 1st superdiag=-1, 2nd superdiag=0.5
  ! Col 1
  ab(1) = 0.0d0; ab(2) = 0.0d0; ab(3) = 6.0d0
  ! Col 2
  ab(4) = 0.0d0; ab(5) = -1.0d0; ab(6) = 6.0d0
  ! Col 3
  ab(7) = 0.5d0; ab(8) = -1.0d0; ab(9) = 6.0d0
  ! Col 4
  ab(10) = 0.5d0; ab(11) = -1.0d0; ab(12) = 6.0d0
  ! Col 5
  ab(13) = 0.5d0; ab(14) = -1.0d0; ab(15) = 6.0d0
  ! Col 6
  ab(16) = 0.5d0; ab(17) = -1.0d0; ab(18) = 6.0d0
  ! Col 7
  ab(19) = 0.5d0; ab(20) = -1.0d0; ab(21) = 6.0d0
  ! Col 8
  ab(22) = 0.5d0; ab(23) = -1.0d0; ab(24) = 6.0d0

  call dpbtrf('U', 8, 2, ab, ldab, info)
  call begin_test('upper_banded_8')
  call print_int('info', info)
  call print_array('ab', ab, 24)
  call end_test()

  ! ===== Test 9: UPLO='L', N=8, KD=2 =====
  ldab = 3
  ab = 0.0d0
  ! Build: diag=6, 1st subdiag=-1, 2nd subdiag=0.5
  ! Col 1
  ab(1) = 6.0d0; ab(2) = -1.0d0; ab(3) = 0.5d0
  ! Col 2
  ab(4) = 6.0d0; ab(5) = -1.0d0; ab(6) = 0.5d0
  ! Col 3
  ab(7) = 6.0d0; ab(8) = -1.0d0; ab(9) = 0.5d0
  ! Col 4
  ab(10) = 6.0d0; ab(11) = -1.0d0; ab(12) = 0.5d0
  ! Col 5
  ab(13) = 6.0d0; ab(14) = -1.0d0; ab(15) = 0.5d0
  ! Col 6
  ab(16) = 6.0d0; ab(17) = -1.0d0; ab(18) = 0.5d0
  ! Col 7
  ab(19) = 6.0d0; ab(20) = -1.0d0; ab(21) = 0.0d0
  ! Col 8
  ab(22) = 6.0d0; ab(23) = 0.0d0; ab(24) = 0.0d0

  call dpbtrf('L', 8, 2, ab, ldab, info)
  call begin_test('lower_banded_8')
  call print_int('info', info)
  call print_array('ab', ab, 24)
  call end_test()

  ! ===== Test 10: UPLO='U', N=100, KD=65 (blocked path) =====
  ! A diagonally dominant SPD banded matrix: for i /= j,
  ! A(i,j) = ( MOD( 7*(i+j) + i*j, 13 ) - 6 ) / 8
  ab_blk = 0.0d0
  do j = 1, N_BLK
    ab_blk(KD_BLK + 1, j) = 100.0d0
    do i = max(1, j - KD_BLK), j - 1
      ab_blk(KD_BLK + 1 + i - j, j) = dble(mod(7*(i+j) + i*j, 13) - 6) / 8.0d0
    end do
  end do
  call dpbtrf('U', N_BLK, KD_BLK, ab_blk, LDAB_BLK, info)
  call begin_test('upper_blocked')
  call print_int('info', info)
  call print_matrix('ab', ab_blk, LDAB_BLK, LDAB_BLK, N_BLK)
  call end_test()

  ! ===== Test 11: UPLO='L', N=100, KD=65 (blocked path), the same matrix =====
  ab_blk = 0.0d0
  do j = 1, N_BLK
    ab_blk(1, j) = 100.0d0
    do i = j + 1, min(N_BLK, j + KD_BLK)
      ab_blk(1 + i - j, j) = dble(mod(7*(i+j) + i*j, 13) - 6) / 8.0d0
    end do
  end do
  call dpbtrf('L', N_BLK, KD_BLK, ab_blk, LDAB_BLK, info)
  call begin_test('lower_blocked')
  call print_int('info', info)
  call print_matrix('ab', ab_blk, LDAB_BLK, LDAB_BLK, N_BLK)
  call end_test()

end program
