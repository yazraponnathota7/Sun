#include <stdio.h>

int main()
{

    int N = 47;

    int chairs_per_row = 12;

    printf("Rows: %d\n", (N / chairs_per_row));
    printf("Guests: %d\n", (N % chairs_per_row));

    return 0;
}