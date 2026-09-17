#include <stdio.h>

int main()
{



    int nums[] = {3, 8, 7, 8, 7};

    for (int i = 0; i < 4; i++)
    {

        nums[i] = nums[i + 1];
    }

    for (int i = 0; i < 4; i++)
    {
        printf("%d", nums[i]);
    }

    return 0;
}