#include <stdio.h>

int main()
{

    int nums[10] = {4, 7, -1, -2};
    int pos[10], neg[10];

    for (int i = 0; i < 4; i++)
    {

        if (nums[i] > 0)
        {
            pos[i] = nums[i];
        }
        else if (nums[i] < 0)
        {
            neg[i] = nums[i];
        }
    }

    for (int i = 0; i < 4; i++)
    {
        if (pos[i] != 0)
        {
            printf("%d ", pos[i]);
        }

        

        if (neg[i] != 0)
        {
            printf("%d ", neg[i]);
        }
    }

    return 0;
}