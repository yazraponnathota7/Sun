#include <stdio.h>

int main()
{

    int nums[100] = {2, 8, 9, 9, 7};

    int N = 5;

    int mid = N / 2;

    int tem = nums[0];
    nums[0] = nums[mid];
    nums[mid] = tem;

    for (int i = 0; i < 5; i++)
    {
        printf("%d ", nums[i]);
    }

    return 0;
}