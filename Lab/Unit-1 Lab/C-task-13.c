#include <stdio.h>

int main()
{

    int a = 5, b = 5;

    int p, q;

    p = a++ + 2;
    q = ++b + 2;

    printf("a = %d, p = %d\n", a, p);
    printf("b = %d, q = %d\n", b, q);

    return 0;
}