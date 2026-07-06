program test_dsaupd
  use test_utils
  implicit none
  integer, parameter :: MAXN = 12, MAXNCV = 12
  integer, parameter :: LDV = MAXN
  double precision :: v(LDV, MAXNCV), resid(MAXN), workd(3*MAXN)
  double precision :: workl(MAXNCV*MAXNCV + 8*MAXNCV), a(MAXN, MAXN)
  integer :: iparam(11), ipntr(11)
  integer :: ido, info, n, nev, ncv, i
  double precision :: tol

  ! ------------------------------------------------------------------
  ! Case 1: LM, 1-D Laplacian [2,-1], n=10, nev=3, ncv=6.
  n = 10
  nev = 3
  ncv = 6
  call laplacian(a, MAXN, n)
  call run(n, 'LM', nev, ncv, a, LDV, v, resid, workd, workl, iparam, ipntr, info, ido)
  call begin_test('LM_n10_nev3_ncv6')
  call report(workl, ipntr, resid, n, ncv, iparam, info, ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 2: SA (smallest algebraic), same matrix, nev=4, ncv=8.
  n = 10
  nev = 4
  ncv = 8
  call laplacian(a, MAXN, n)
  call run(n, 'SA', nev, ncv, a, LDV, v, resid, workd, workl, iparam, ipntr, info, ido)
  call begin_test('SA_n10_nev4_ncv8')
  call report(workl, ipntr, resid, n, ncv, iparam, info, ido)
  call end_test()

  ! ------------------------------------------------------------------
  ! Case 3: LA, dense diagonally dominant, n=8, nev=2, ncv=6.
  n = 8
  nev = 2
  ncv = 6
  a = 0.0d0
  do i = 1, n
    a(i, i) = dble(i)
    if (i < n) then
      a(i, i+1) = 0.5d0
      a(i+1, i) = 0.5d0
    end if
  end do
  call run(n, 'LA', nev, ncv, a, LDV, v, resid, workd, workl, iparam, ipntr, info, ido)
  call begin_test('LA_n8_nev2_ncv6')
  call report(workl, ipntr, resid, n, ncv, iparam, info, ido)
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

  subroutine report(workl, ipntr, resid, n, ncv, iparam, info, ido)
    double precision, intent(in) :: workl(*), resid(*)
    integer, intent(in) :: ipntr(11), n, ncv, iparam(11), info, ido
    call print_array('ritz', workl(ipntr(6)), ncv)
    call print_array('bounds', workl(ipntr(7)), ncv)
    call print_array('resid', resid, n)
    call print_int('nconv', iparam(5))
    call print_int('mxiter', iparam(3))
    call print_int('info', info)
    call print_int('ido', ido)
  end subroutine report

  ! Drive the dsaupd reverse-communication loop (OP = A, B = I, mode 1, exact shifts).
  subroutine run(n, which, nev, ncv, a, ldv, v, resid, workd, workl, iparam, ipntr, info, ido)
    integer, intent(in) :: n, nev, ncv, ldv
    integer, intent(out) :: info, ido
    character(*), intent(in) :: which
    double precision, intent(in) :: a(ldv, *)
    double precision, intent(inout) :: v(ldv, *), resid(*), workd(*), workl(*)
    integer, intent(out) :: iparam(11), ipntr(11)
    integer :: lworkl, r, c, p, qq

    lworkl = ncv*ncv + 8*ncv
    tol = 0.0d0
    iparam = 0
    iparam(1) = 1
    iparam(3) = 100
    iparam(7) = 1
    ! Fixed initial residual (info != 0 => use provided resid; deterministic).
    do r = 1, n
      resid(r) = 1.0d0 + 0.1d0 * dble(r)
    end do
    ido = 0
    info = 1
    do
      call dsaupd(ido, 'I', n, which, nev, tol, resid, ncv, v, ldv, &
                  iparam, ipntr, workd, workl, lworkl, info)
      if (ido == -1 .or. ido == 1) then
        p = ipntr(1)
        qq = ipntr(2)
        do r = 1, n
          workd(qq + r - 1) = 0.0d0
          do c = 1, n
            workd(qq + r - 1) = workd(qq + r - 1) + a(r, c) * workd(p + c - 1)
          end do
        end do
      else
        exit
      end if
    end do
  end subroutine run

end program test_dsaupd
