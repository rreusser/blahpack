program test_dgbtrf
  use test_utils
  implicit none
  double precision :: AB4(4, 10), AB7(7, 10), AB5(5, 10), AB1(1, 10)
  integer :: ipiv(10), info

  ! Parameters for blocked test
  integer, parameter :: KL_BIG = 33, KU_BIG = 33
  integer, parameter :: N_BIG = 100
  integer, parameter :: LDAB_BIG = 2*KL_BIG + KU_BIG + 1
  double precision :: AB_big(LDAB_BIG, N_BIG)
  double precision :: AB_packed(LDAB_BIG * N_BIG)
  integer :: ipiv_big(N_BIG)
  integer :: i, j, kv_big

  ! Parameters for the reference's blocked path: ILAENV( 1, 'DGBTRF' ) is
  ! 32 only when KU > 64, and DGBTRF blocks only when NB <= KL
  integer, parameter :: KL_BLK = 33, KU_BLK = 65
  integer, parameter :: N_BLK = 100
  integer, parameter :: LDAB_BLK = 2*KL_BLK + KU_BLK + 1
  double precision :: AB_blk(LDAB_BLK, N_BLK)
  integer :: ipiv_blk(N_BLK)

  ! ============================================================
  ! Test 1: 4x4 tridiagonal (KL=1, KU=1), LDAB=4
  ! Same as dgbtf2 test - should get same result (NB > KL so falls through)
  AB4 = 0.0d0
  AB4(2,1) = 0.0d0;  AB4(3,1) = 4.0d0;  AB4(4,1) = -1.0d0
  AB4(2,2) = -1.0d0; AB4(3,2) = 4.0d0;  AB4(4,2) = -1.0d0
  AB4(2,3) = -1.0d0; AB4(3,3) = 4.0d0;  AB4(4,3) = -1.0d0
  AB4(2,4) = -1.0d0; AB4(3,4) = 4.0d0;  AB4(4,4) = 0.0d0
  ipiv = 0
  call DGBTRF(4, 4, 1, 1, AB4, 4, ipiv, info)
  call begin_test('tridiag_4x4')
  call print_matrix('AB', AB4, 4, 4, 4)
  call print_int_array('ipiv', ipiv, 4)
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 2: 5x5 pentadiagonal (KL=2, KU=2), LDAB=7
  AB7 = 0.0d0
  AB7(5,1) = 6.0d0; AB7(6,1) = -2.0d0; AB7(7,1) = 1.0d0
  AB7(4,2) = -2.0d0; AB7(5,2) = 6.0d0; AB7(6,2) = -2.0d0; AB7(7,2) = 1.0d0
  AB7(3,3) = 1.0d0; AB7(4,3) = -2.0d0; AB7(5,3) = 6.0d0; AB7(6,3) = -2.0d0; AB7(7,3) = 1.0d0
  AB7(3,4) = 1.0d0; AB7(4,4) = -2.0d0; AB7(5,4) = 6.0d0; AB7(6,4) = -2.0d0
  AB7(3,5) = 1.0d0; AB7(4,5) = -2.0d0; AB7(5,5) = 6.0d0
  ipiv = 0
  call DGBTRF(5, 5, 2, 2, AB7, 7, ipiv, info)
  call begin_test('pentadiag_5x5')
  call print_matrix('AB', AB7, 7, 7, 5)
  call print_int_array('ipiv', ipiv, 5)
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 3: N=0 quick return
  call DGBTRF(3, 0, 1, 1, AB4, 4, ipiv, info)
  call begin_test('n_zero')
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 4: M=0 quick return
  call DGBTRF(0, 3, 1, 1, AB4, 4, ipiv, info)
  call begin_test('m_zero')
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 5: 1x1
  AB1 = 0.0d0
  AB1(1,1) = 7.0d0
  ipiv = 0
  call DGBTRF(1, 1, 0, 0, AB1, 1, ipiv, info)
  call begin_test('one_by_one')
  call print_matrix('AB', AB1, 1, 1, 1)
  call print_int_array('ipiv', ipiv, 1)
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 6: Pivot test 2x2
  AB4 = 0.0d0
  AB4(3,1) = 1.0d0; AB4(4,1) = 3.0d0
  AB4(2,2) = 2.0d0; AB4(3,2) = 4.0d0
  ipiv = 0
  call DGBTRF(2, 2, 1, 1, AB4, 4, ipiv, info)
  call begin_test('pivot_2x2')
  call print_matrix('AB', AB4, 4, 4, 2)
  call print_int_array('ipiv', ipiv, 2)
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 7: 3x3 with KL=1, KU=2 (non-square bandwidth), LDAB=5
  AB5 = 0.0d0
  AB5(4,1) = 5.0d0; AB5(5,1) = 2.0d0
  AB5(3,2) = 3.0d0; AB5(4,2) = 6.0d0; AB5(5,2) = 1.0d0
  AB5(2,3) = 1.0d0; AB5(3,3) = 4.0d0; AB5(4,3) = 7.0d0
  ipiv = 0
  call DGBTRF(3, 3, 1, 2, AB5, 5, ipiv, info)
  call begin_test('kl1_ku2_3x3')
  call print_matrix('AB', AB5, 5, 5, 3)
  call print_int_array('ipiv', ipiv, 3)
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 8: Blocked path - large banded matrix with KL=33, KU=33, N=100
  ! This exercises the blocked code path since NB <= KL
  kv_big = KU_BIG + KL_BIG
  AB_big = 0.0d0
  do j = 1, N_BIG
    ! Diagonal at row KL+KU+1 = kv_big+1
    AB_big(kv_big + 1, j) = 10.0d0 * N_BIG + dble(j)
    ! Subdiagonals
    do i = 1, min(KL_BIG, N_BIG - j)
      AB_big(kv_big + 1 + i, j) = -1.0d0 + 0.01d0 * dble(i)
    end do
    ! Superdiagonals
    do i = 1, min(KU_BIG, j - 1)
      AB_big(kv_big + 1 - i, j) = -1.0d0 + 0.02d0 * dble(i)
    end do
  end do
  ipiv_big = 0
  call DGBTRF(N_BIG, N_BIG, KL_BIG, KU_BIG, AB_big, LDAB_BIG, ipiv_big, info)

  ! Pack AB_big column by column into AB_packed
  do j = 1, N_BIG
    do i = 1, LDAB_BIG
      AB_packed((j-1)*LDAB_BIG + i) = AB_big(i, j)
    end do
  end do

  call begin_test('blocked_100x100_kl33')
  call print_array('AB', AB_packed, LDAB_BIG * N_BIG)
  call print_int_array('ipiv', ipiv_big, N_BIG)
  call print_int('info', info)
  call end_test()

  ! ============================================================
  ! Test 9: Blocked path - N=100, KL=33, KU=65 (NB = 32 <= KL), with
  ! entries that force row interchanges within the band:
  ! A(i,j) = ( MOD( 7*i*i + 13*j + 3*i*j, 23 ) - 11 ) / 4
  AB_blk = 0.0d0
  do j = 1, N_BLK
    do i = max(1, j - KU_BLK), min(N_BLK, j + KL_BLK)
      AB_blk(KL_BLK + KU_BLK + 1 + i - j, j) = &
        dble(mod(7*i*i + 13*j + 3*i*j, 23) - 11) / 4.0d0
    end do
  end do
  ipiv_blk = 0
  call DGBTRF(N_BLK, N_BLK, KL_BLK, KU_BLK, AB_blk, LDAB_BLK, ipiv_blk, info)
  call begin_test('blocked_100x100_kl33_ku65')
  call print_matrix('AB', AB_blk, LDAB_BLK, LDAB_BLK, N_BLK)
  call print_int_array('ipiv', ipiv_blk, N_BLK)
  call print_int('info', info)
  call end_test()

end program
