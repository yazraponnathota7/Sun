#include <stdio.h>

int main()
{
    printf("Day    P1     P2     P3     P4     P5\n");

    for (int d = 0; d <= 5; d++)
    {

        if (d == 0)
        {
            printf("MON    free   free   free   free   free\n");
        }
        else if (d == 1)
        {

            printf("TUE    free   free   free   free   free\n");
        }
        else if (d == 2)
        {

            printf("WED    free   free   free   free   free\n");
        }
        else if (d == 3)
        {

            printf("THU    free   free   free   free   free\n");
        }
        else if (d == 4)
        {

            printf("FRI    free   free   free   free   free\n");
        }
        else if (d == 5)
        {

            printf("SAT    free   free   free   free   free\n");
        }
    }
}