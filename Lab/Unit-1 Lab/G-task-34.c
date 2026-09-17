#include <stdio.h>

int main(){
    
    int Strength;

    printf("Total students: ");
    scanf("%d", &Strength);

    for (int i = 1; i <= Strength; i++)
    {

        printf("Roll %03d :_________\n", i);
    }


    return 0;
}