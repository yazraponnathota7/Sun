#include <stdio.h>

int main()
{

    int scores[2][3][2] = {
        {
            {72, 68},
            {80, 76},
            {90, 94},
        },
        {
            {66, 70},
            {84, 82},
            {88, 92},
        }};

    int moduleTotal[3] = {0};

    for (int i = 0; i < 2; i++)
    {

        for (int j = 0; j < 3; j++)
        {

            for (int k = 0; k < 2; k++)
            {

                moduleTotal[j] += scores[i][j][k];
            }
        }
    }

    for (int u = 0; u < 3; u++)
    {
        printf("Module Average %d: %.2f\n", u + 1, (moduleTotal[u] / 4.0));
    }

    // task 6 (the farm produce yield cube)

    return 0;
}