#include <stdio.h>

int main(){

    int guess, tries = 0, won = 0;

    do{

        printf("Guess: ");
        scanf("%d", &guess);

        if(guess == 7){

            printf("you win!!\n");
        }else{
            printf("Bette luck next time...\n");
        }

        tries ++;

    }while(tries < 5);


    return 0;
}