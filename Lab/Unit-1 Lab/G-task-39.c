#include <stdio.h>

int main(){
    
   
    int total = 0;
    int max = 0;
    int best_week = 0;
    int weekly;

    for (int w = 1; w < 5; w++)
    {

        printf("Week %d: ", w);
        scanf("%d", &weekly);

        total = total + weekly;

        if (weekly > max)
        {

            max = weekly;
            best_week = w;
        }
    }

    float avg = total / 15.0;

    printf("Total classes : %d\n", total);
    printf("Average/week  : %.2f\n", avg);
    printf("Best week     : week %d (with %d classes)\n", best_week, max);

    return 0;
}