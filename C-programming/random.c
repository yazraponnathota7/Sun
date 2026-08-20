#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main()
{

    // printf("%d\n", rand());
    // printf("%d\n", rand());
    // printf("%d\n", rand());

    srand(time(NULL));
    // printf("%d\n", rand());
    // printf("%d\n", RAND_MAX );

    int RandomNum;

    int min  = 1;
    int max = 6;

    // RandomNum = rand() % 2 ; // get value between (0 to 1)
    // divide with 2 get only

    RandomNum = (rand() % max) + min;
    printf("%d\n", RandomNum);

    return 0;
}