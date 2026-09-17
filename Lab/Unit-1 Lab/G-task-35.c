#include <stdio.h>

int main(){
    
    

    int R, S;

    printf("R: ");
    scanf("%d", &R);

    printf("S: ");
    scanf("%d", &S);

    for (int r = 1; r <= R; r++)
    {

        for (int s = 1; s <= S; s++)
        {

            printf("R%dS%d ", r, s);
        }

        printf("\n") ;
    }


    return 0;
}