#include <stdio.h>

int main()
{

    int nums[10] = {5, 4, 3, 9};
    int des = 1;

    for (int i = 1; i < 4; i++)
    {

        if (nums[0] > nums[i])
        {

            des = 1;
        }
        else
        {
            des = 0;
        }
    }

    if (des)
    {
        printf("DESCEDING.");
    }
    else
    {
        printf("NOT DESCENDING.");
    }

    return 0;
}