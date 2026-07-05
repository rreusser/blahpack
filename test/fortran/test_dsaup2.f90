program test_dsaup2
  use test_utils
  implicit none
  integer, parameter :: MAXN = 12, MAXNCV = 12
  double precision :: v(MAXN, MAXNCV), h(MAXNCV, 2), q(MAXNCV, MAXNCV)
  double precision :: resid(MAXN), ritz(MAXNCV), bounds(MAXNCV)
  double precision :: workl(3*MAXNCV), workd(3*MAXN), a(MAXN, MAXN)
  integer :: ipntr(3), ido, info, n, nev, np, mode, iupd, ishift, mxiter, i
  double precision :: tol

  ! ------------------------------------------------------------------
  ! Case 1: LM, 1-D Laplacian [2,-1], n=10, nev=3, np=3 (ncv=6).
  n = 10
  nev = 3
  np = 3
  call laplacian(a, MAXN, n)
  call run(n, 'LM', nev, np, a, MAXN, v, h, q, resid, ritz, bounds, workl, workd, ipntr, mxiter, info, ido)
  call begin_test('LM_n10_nev3_np3')
  call print_int('nev', nev + 0)
  call report(ritz, bounds, h, resid, n, nev, np, mxiter, info, ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: SA (smallest algebraic), same matrix, nev=4, np=4 (ncv=8).
  n = 10
  nev = 4
  np = 4
  call laplacian(a, MAXN, n)
  call run(n, 'SA', nev, np, a, MAXN, v, h, q, resid, ritz, bounds, workl, workd, ipntr, mxiter, info, ido)
  call begin_test('SA_n10_nev4_np4')
  call report(ritz, bounds, h, resid, n, nev, np, mxiter, info, ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: LA, dense diagonally dominant, n=8, nev=2, np=4 (ncv=6).
  n = 8
  nev = 2
  np = 4
  a = 0.0d0
  do i = 1, n
    a(i, i) = dble(i)
    if (i < n) then
      a(i, i+1) = 0.5d0
      a(i+1, i) = 0.5d0
    end if
  end do
  call run(n, 'LA', nev, np, a, MAXN, v, h, q, resid, ritz, bounds, workl, workd, ipntr, mxiter, info, ido)
  call begin_test('LA_n8_nev2_np4')
  call report(ritz, bounds, h, resid, n, nev, np, mxiter, info, ido)
  call end_test()

contains

  subroutine laplacian(a, lda, n)
    integer, intent(in) :: lda, n
    double precision, intent(out) :: a(lda, *)
    integer :: i
    a(1:n, 1:n) = 0.0d0
    do i = 1, n
      a(i, i) = 2.0d0
      if (i < n) then
        a(i, i+1) = -1.0d0
        a(i+1, i) = -1.0d0
      end if
    end do
  end subroutine laplacian

  subroutine report(ritz, bounds, h, resid, n, nev, np, mxiter, info, ido)
    double precision, intent(in) :: ritz(*), bounds(*), h(MAXNCV, 2), resid(*)
    integer, intent(in) :: n, nev, np, mxiter, info, ido
    call print_array('ritz', ritz, nev)
    call print_array('bounds', bounds, nev)
    call print_int('nconv', nev)
    call print_int('mxiter', mxiter)
    call print_int('info', info)
    call print_int('ido', ido)
  end subroutine report

  ! Drive the dsaup2 reverse-communication loop (OP = A, B = I, exact shifts).
  subroutine run(n, which, nev, np, a, lda, v, h, q, resid, ritz, bounds, workl, workd, ipntr, mxiter, info, ido)
    integer, intent(in) :: n, lda
    integer, intent(inout) :: nev, np, mxiter, info, ido
    character(*), intent(in) :: which
    double precision, intent(in) :: a(lda, *)
    double precision, intent(inout) :: v(lda, *), h(MAXNCV, 2), q(MAXNCV, *)
    double precision, intent(inout) :: resid(*), ritz(*), bounds(*), workl(*), workd(*)
    integer, intent(inout) :: ipntr(3)
    integer :: mode, iupd, ishift, p, qq, r, c

    mode = 1
    iupd = 1
    ishift = 1
    mxiter = 100
    tol = 0.0d0
    ! Fixed initial residual (info != 0 => use provided resid; deterministic).
    do r = 1, n
      resid(r) = 1.0d0 + 0.1d0 * dble(r)
    end do
    ido = 0
    info = 1
    do
      call dsaup2(ido, 'I', n, which, nev, np, tol, resid, mode, iupd, &
                  ishift, mxiter, v, lda, h, MAXNCV, ritz, bounds, &
                  q, MAXNCV, workl, ipntr, workd, info)
      if (ido == 99) exit
      p = ipntr(1)
      qq = ipntr(2)
      if (ido == -1 .or. ido == 1) then
        do r = 1, n
          workd(qq + r - 1) = 0.0d0
          do c = 1, n
            workd(qq + r - 1) = workd(qq + r - 1) + a(r, c) * workd(p + c - 1)
          end do
        end do
      else if (ido == 2) then
        do r = 1, n
          workd(qq + r - 1) = workd(p + r - 1)
        end do
      else
        exit
      end if
    end do
  end subroutine run

end program test_dsaup2
