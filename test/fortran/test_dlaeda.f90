program test_dlaeda
  use test_utils
  implicit none

  ! Workspace sized for the largest test case below.
  integer :: PRMPTR(16), PERM(32), GIVPTR(16), GIVCOL(2, 32)
  integer :: QPTR(16)
  double precision :: GIVNUM(2, 32)
  double precision :: Q(128), Z(32), ZTEMP(32)
  integer :: INFO
  integer :: N, TLVLS, CURLVL, CURPBM

  ! -------------------------------------------------------------------
  ! Test 1: basic single-level merge, CURLVL=1, CURPBM=0, N=4.
  ! CURR = 1; QPTR(1..3) = [1, 5, 9] so BSIZ1 = BSIZ2 = 2.
  ! Q(1..4) = column-major 2x2 first leaf block, Q(5..8) = second block.
  ! MID = N/2 + 1 = 3.
  ! Z(1..MID-BSIZ1-1) = Z(1..0) is empty; Z(1..2) gets last row of block 1
  ! (positions Q(2), Q(4)); Z(3..4) gets first row of block 2 (Q(5), Q(7)).
  ! No K loop (CURLVL-1 = 0), so PRMPTR/PERM/GIVPTR/GIVCOL/GIVNUM unused.
  ! -------------------------------------------------------------------
  N = 4
  TLVLS = 1
  CURLVL = 1
  CURPBM = 0
  QPTR(1) = 1
  QPTR(2) = 5
  QPTR(3) = 9
  ! Block 1 (2x2 column-major):  [ 1  3 ; 2  4 ]
  Q(1) = 1.0D0; Q(2) = 2.0D0; Q(3) = 3.0D0; Q(4) = 4.0D0
  ! Block 2 (2x2 column-major):  [ 5  7 ; 6  8 ]
  Q(5) = 5.0D0; Q(6) = 6.0D0; Q(7) = 7.0D0; Q(8) = 8.0D0
  call zero_int(PRMPTR, 16); call zero_int(PERM, 32)
  call zero_int(GIVPTR, 16); call zero_int_2d(GIVCOL, 2, 32)
  call zero_dbl_2d(GIVNUM, 2, 32)
  call zero_dbl(Z, 32); call zero_dbl(ZTEMP, 32)
  call DLAEDA(N, TLVLS, CURLVL, CURPBM, PRMPTR, PERM, GIVPTR, GIVCOL, &
              GIVNUM, Q, QPTR, Z, ZTEMP, INFO)
  call begin_test('basic_curlvl1_n4')
  call print_int('INFO', INFO)
  call print_array('Z', Z, N)
  call end_test()

  ! -------------------------------------------------------------------
  ! Test 2: single-level with leading/trailing zero padding, N=6.
  ! CURR = 1, BSIZ1 = BSIZ2 = 2, MID = 4.
  ! Z(1) = 0; Z(2..3) = block-1 last row; Z(4..5) = block-2 first row; Z(6) = 0.
  ! -------------------------------------------------------------------
  N = 6
  TLVLS = 1
  CURLVL = 1
  CURPBM = 0
  QPTR(1) = 1
  QPTR(2) = 5
  QPTR(3) = 9
  Q(1) = 10.0D0; Q(2) = 20.0D0; Q(3) = 30.0D0; Q(4) = 40.0D0
  Q(5) = 50.0D0; Q(6) = 60.0D0; Q(7) = 70.0D0; Q(8) = 80.0D0
  call zero_int(PRMPTR, 16); call zero_int(PERM, 32)
  call zero_int(GIVPTR, 16); call zero_int_2d(GIVCOL, 2, 32)
  call zero_dbl_2d(GIVNUM, 2, 32)
  call zero_dbl(Z, 32); call zero_dbl(ZTEMP, 32)
  call DLAEDA(N, TLVLS, CURLVL, CURPBM, PRMPTR, PERM, GIVPTR, GIVCOL, &
              GIVNUM, Q, QPTR, Z, ZTEMP, INFO)
  call begin_test('single_level_n6_padded')
  call print_int('INFO', INFO)
  call print_array('Z', Z, N)
  call end_test()

  ! -------------------------------------------------------------------
  ! Test 3: single-level with CURPBM = 1 (second deepest-level problem).
  ! TLVLS=2 so PTR_new = 5 but K loop doesn't execute (CURLVL-1 = 0).
  ! CURR = 1 + 1*2 + 1 - 1 = 3, accesses QPTR(3..5). BSIZ1 = BSIZ2 = 3,
  ! so 3x3 blocks (9 elements each).  N = 8, MID = 5.
  ! Z(1..1) = 0; Z(2..4) = block-1 last row; Z(5..7) = block-2 first row;
  ! Z(8) = 0.
  ! -------------------------------------------------------------------
  N = 8
  TLVLS = 2
  CURLVL = 1
  CURPBM = 1
  QPTR(3) = 1
  QPTR(4) = 10
  QPTR(5) = 19
  ! Block 1: 3x3 column-major starting at Q(1).
  Q(1)  = 1.0D0;  Q(2)  = 2.0D0;  Q(3)  = 3.0D0
  Q(4)  = 4.0D0;  Q(5)  = 5.0D0;  Q(6)  = 6.0D0
  Q(7)  = 7.0D0;  Q(8)  = 8.0D0;  Q(9)  = 9.0D0
  ! Block 2: 3x3 column-major starting at Q(10).
  Q(10) = 11.0D0; Q(11) = 12.0D0; Q(12) = 13.0D0
  Q(13) = 14.0D0; Q(14) = 15.0D0; Q(15) = 16.0D0
  Q(16) = 17.0D0; Q(17) = 18.0D0; Q(18) = 19.0D0
  call zero_int(PRMPTR, 16); call zero_int(PERM, 32)
  call zero_int(GIVPTR, 16); call zero_int_2d(GIVCOL, 2, 32)
  call zero_dbl_2d(GIVNUM, 2, 32)
  call zero_dbl(Z, 32); call zero_dbl(ZTEMP, 32)
  call DLAEDA(N, TLVLS, CURLVL, CURPBM, PRMPTR, PERM, GIVPTR, GIVCOL, &
              GIVNUM, Q, QPTR, Z, ZTEMP, INFO)
  call begin_test('single_level_curpbm1_n8')
  call print_int('INFO', INFO)
  call print_array('Z', Z, N)
  call end_test()

  ! -------------------------------------------------------------------
  ! Test 4: two-level (CURLVL=2, CURPBM=0, TLVLS=2), N=8 with identity
  ! permutation and no Givens. Exercises the K=1 iteration of the main
  ! loop end-to-end (permute + dgemv).
  !
  ! Outer-level access: CURR = 1 + 0*4 + 2 - 1 = 2, QPTR(2..4).
  !   BSIZ1_outer = sqrt(QPTR(3)-QPTR(2)) = sqrt(16) = 4
  !   BSIZ2_outer = sqrt(QPTR(4)-QPTR(3)) = sqrt(16) = 4
  ! K=1 iteration: PTR = 2^TLVLS + 1 = 5;
  !   CURR = 5 + 0*2 + 1 - 1 = 5; PRMPTR(5..7), GIVPTR(5..7), QPTR(5..7).
  !   PSIZ1 = PRMPTR(6) - PRMPTR(5) = 4
  !   PSIZ2 = PRMPTR(7) - PRMPTR(6) = 4
  !   ZPTR1 = MID - PSIZ1 = 5 - 4 = 1
  !   No Givens (GIVPTR(5) = GIVPTR(6) = GIVPTR(7) = 1).
  !   Identity perm: PERM(1..4) = [1,2,3,4], PERM(5..8) = [1,2,3,4].
  !   BSIZ1_inner = sqrt(QPTR(6)-QPTR(5)) = sqrt(4) = 2
  !   BSIZ2_inner = sqrt(QPTR(7)-QPTR(6)) = sqrt(4) = 2
  !   dgemv applies Q_inner1^T to ZTEMP(1..2) -> Z(1..2).
  !   dcopy ZTEMP(3..4) -> Z(3..4).
  !   dgemv applies Q_inner2^T to ZTEMP(5..6) -> Z(5..6).
  !   dcopy ZTEMP(7..8) -> Z(7..8).
  ! -------------------------------------------------------------------
  N = 8
  TLVLS = 2
  CURLVL = 2
  CURPBM = 0
  ! Outer-level blocks (4x4 each), starting at Q(1) and Q(17).
  QPTR(2) = 1
  QPTR(3) = 17
  QPTR(4) = 33
  ! Inner-level blocks (2x2 each), starting at Q(33) and Q(37).
  QPTR(5) = 33
  QPTR(6) = 37
  QPTR(7) = 41
  ! Outer block 1: Q(i,j) = 10*i + j (column-major fill).
  call fill_block(Q, 1, 4, 4)
  ! Outer block 2: similar pattern offset by 100.
  call fill_block_offset(Q, 17, 4, 4, 100.0D0)
  ! Inner block 1 (2x2 column-major): identity-ish for clarity.
  Q(33) = 1.0D0; Q(34) = 0.0D0
  Q(35) = 0.0D0; Q(36) = 1.0D0
  ! Inner block 2 (2x2 column-major): a 45-degree rotation.
  Q(37) = 0.6D0; Q(38) = 0.8D0
  Q(39) = -0.8D0; Q(40) = 0.6D0
  PRMPTR(5) = 1
  PRMPTR(6) = 5
  PRMPTR(7) = 9
  PERM(1) = 1; PERM(2) = 2; PERM(3) = 3; PERM(4) = 4
  PERM(5) = 1; PERM(6) = 2; PERM(7) = 3; PERM(8) = 4
  GIVPTR(5) = 1
  GIVPTR(6) = 1
  GIVPTR(7) = 1
  call zero_dbl(Z, 32); call zero_dbl(ZTEMP, 32)
  call DLAEDA(N, TLVLS, CURLVL, CURPBM, PRMPTR, PERM, GIVPTR, GIVCOL, &
              GIVNUM, Q, QPTR, Z, ZTEMP, INFO)
  call begin_test('two_level_n8_identity')
  call print_int('INFO', INFO)
  call print_array('Z', Z, N)
  call end_test()

  ! -------------------------------------------------------------------
  ! Test 5: two-level with non-trivial permutation. Same dimensions as
  ! test 4 but PERM reverses each half.
  ! -------------------------------------------------------------------
  N = 8
  TLVLS = 2
  CURLVL = 2
  CURPBM = 0
  QPTR(2) = 1; QPTR(3) = 17; QPTR(4) = 33
  QPTR(5) = 33; QPTR(6) = 37; QPTR(7) = 41
  call fill_block(Q, 1, 4, 4)
  call fill_block_offset(Q, 17, 4, 4, 100.0D0)
  Q(33) = 1.0D0; Q(34) = 0.0D0
  Q(35) = 0.0D0; Q(36) = 1.0D0
  Q(37) = 0.6D0; Q(38) = 0.8D0
  Q(39) = -0.8D0; Q(40) = 0.6D0
  PRMPTR(5) = 1; PRMPTR(6) = 5; PRMPTR(7) = 9
  PERM(1) = 4; PERM(2) = 3; PERM(3) = 2; PERM(4) = 1
  PERM(5) = 4; PERM(6) = 3; PERM(7) = 2; PERM(8) = 1
  GIVPTR(5) = 1; GIVPTR(6) = 1; GIVPTR(7) = 1
  call zero_dbl(Z, 32); call zero_dbl(ZTEMP, 32)
  call DLAEDA(N, TLVLS, CURLVL, CURPBM, PRMPTR, PERM, GIVPTR, GIVCOL, &
              GIVNUM, Q, QPTR, Z, ZTEMP, INFO)
  call begin_test('two_level_n8_perm')
  call print_int('INFO', INFO)
  call print_array('Z', Z, N)
  call end_test()

  ! -------------------------------------------------------------------
  ! Test 6: two-level with Givens rotations applied on both halves.
  ! One rotation per half: rotate positions 1 and 2 in the left half
  ! (Z(ZPTR1+0), Z(ZPTR1+1)) and positions 1 and 2 in the right half
  ! (Z(MID), Z(MID+1)). cos = 0.6, sin = 0.8.
  ! -------------------------------------------------------------------
  N = 8
  TLVLS = 2
  CURLVL = 2
  CURPBM = 0
  QPTR(2) = 1; QPTR(3) = 17; QPTR(4) = 33
  QPTR(5) = 33; QPTR(6) = 37; QPTR(7) = 41
  call fill_block(Q, 1, 4, 4)
  call fill_block_offset(Q, 17, 4, 4, 100.0D0)
  Q(33) = 1.0D0; Q(34) = 0.0D0
  Q(35) = 0.0D0; Q(36) = 1.0D0
  Q(37) = 0.6D0; Q(38) = 0.8D0
  Q(39) = -0.8D0; Q(40) = 0.6D0
  PRMPTR(5) = 1; PRMPTR(6) = 5; PRMPTR(7) = 9
  PERM(1) = 1; PERM(2) = 2; PERM(3) = 3; PERM(4) = 4
  PERM(5) = 1; PERM(6) = 2; PERM(7) = 3; PERM(8) = 4
  GIVPTR(5) = 1; GIVPTR(6) = 2; GIVPTR(7) = 3
  GIVCOL(1, 1) = 1; GIVCOL(2, 1) = 2
  GIVCOL(1, 2) = 1; GIVCOL(2, 2) = 2
  GIVNUM(1, 1) = 0.6D0; GIVNUM(2, 1) = 0.8D0
  GIVNUM(1, 2) = 0.6D0; GIVNUM(2, 2) = 0.8D0
  call zero_dbl(Z, 32); call zero_dbl(ZTEMP, 32)
  call DLAEDA(N, TLVLS, CURLVL, CURPBM, PRMPTR, PERM, GIVPTR, GIVCOL, &
              GIVNUM, Q, QPTR, Z, ZTEMP, INFO)
  call begin_test('two_level_n8_givens')
  call print_int('INFO', INFO)
  call print_array('Z', Z, N)
  call end_test()

contains

  subroutine zero_int(a, n)
    integer, intent(in) :: n
    integer, intent(inout) :: a(n)
    a = 0
  end subroutine

  subroutine zero_int_2d(a, m, n)
    integer, intent(in) :: m, n
    integer, intent(inout) :: a(m, n)
    a = 0
  end subroutine

  subroutine zero_dbl(a, n)
    integer, intent(in) :: n
    double precision, intent(inout) :: a(n)
    a = 0.0D0
  end subroutine

  subroutine zero_dbl_2d(a, m, n)
    integer, intent(in) :: m, n
    double precision, intent(inout) :: a(m, n)
    a = 0.0D0
  end subroutine

  ! Fill an m-by-n column-major block starting at Q(start) with values
  ! 10*i + j (1-based i, j).  Block index k -> Q(start + k - 1).
  subroutine fill_block(Qbuf, start, m, n)
    integer, intent(in) :: start, m, n
    double precision, intent(inout) :: Qbuf(*)
    integer :: i, j, k
    k = 0
    do j = 1, n
      do i = 1, m
        Qbuf(start + k) = real(10*i + j, kind=8)
        k = k + 1
      end do
    end do
  end subroutine

  subroutine fill_block_offset(Qbuf, start, m, n, off)
    integer, intent(in) :: start, m, n
    double precision, intent(in) :: off
    double precision, intent(inout) :: Qbuf(*)
    integer :: i, j, k
    k = 0
    do j = 1, n
      do i = 1, m
        Qbuf(start + k) = real(10*i + j, kind=8) + off
        k = k + 1
      end do
    end do
  end subroutine

end program
