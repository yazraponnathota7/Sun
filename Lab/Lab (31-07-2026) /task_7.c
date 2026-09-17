#include <stdio.h>

int main(){

    for(int i = 1; i <= 5; i++){

        int k = 1;

        for(int j = 0; j < i; j++){

            printf("%d ", (k + j));
        }

        printf("\n");
    }


    for(int i = 0; i < 5; i += 3){

        printf("yazraT");
    }

    return 0;
}