#include <stdio.h>
#include <stdlib.h>

int main()
{

    int number = 0;
    printf("Enter the numbet of players: ");
    scanf("%d", &number);

    int *scores = calloc(number , sizeof(int)); // intially values set to zeroes instead grabage

    if (scores == NULL)
    {
        printf("Memory allocation is failed\n");
        return 1;
    }

    for(int i = 0; i < number; i++){
        printf("Enter score #%d: ", i+1);
        scanf("%d", &scores[i]);
    }

    for (int i = 0; i < number; i++)
    {
        printf("%d\n", scores[i]);
    }

    return 0;
}