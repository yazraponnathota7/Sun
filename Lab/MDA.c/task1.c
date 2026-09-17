#include <stdio.h>

int main()
{
    // the cafeteria sales grid

    int sales[4][5] = {{1, 2, 3, 4, 5}, {25, 87, 89, 33, 2}, {8, 9, 2, 3, 2}, {9, 9, 23, 12, 3}};

    int dayTotal[5] = {0};

    for (int t = 0; t < 4; t++)
    {

        for (int y = 0; y < 5; y++)
        {

            dayTotal[t] += sales[t][y];
        }
    }

    for (int j = 0; j < 4; j++)
    {
        printf("%d\n", dayTotal[j]);
    }

    // task 2 (the gradebook tranpose)

    int scores[3][2] = {
        {88, 92},
        {75, 81},
        {95, 89},
    };

    int transpose[2][3] = {0};

    for (int i = 0; i < 3; i++)
    {

        for (int j = 0; j < 2; j++)
        {
            transpose[j][i] = scores[i][j];
        }
    }

    for (int i = 0; i < 2; i++)
    {
        for (int j = 0; j < 3; j++)
        {
            printf("%d ", transpose[i][j]);
        }

        printf("\n");
    }

    // task 3 (the puzzle grid diagonal)

    int grid[4][4] = {
        {6, 1, 4, 7},
        {2, 9, 3, 8},
        {5, 6, 1, 4},
        {3, 3, 7, 9},
    };

    int sum = 0 ;

    for (int i = 0; i < 4; i++)
    {

        sum = sum + grid[i][i];
    }

    printf("%d\n", sum);


    //task 4 (the inventory restock combiner)

    int morining[2][2] = {{12, 18}, 
                          {9, 14},};

    int delivery[2][2] = {{2, 4}, 
                         {11, 6},};

    int arraySum[2][2] = {0};
  
    for(int l = 0; l < 2; l++){

    for(int i = 0; i < 2; i++){

       arraySum[l][i] += morining[l][i] + delivery[l][i];
        }
    }
    
    printf("Combined stock:\n");
    
    for(int j = 0; j < 2; j++){
        for(int k = 0; k < 2; k++){

            printf("%d ", arraySum[j][k]);
        }

        printf("\n");
    }


    return 0;
}
