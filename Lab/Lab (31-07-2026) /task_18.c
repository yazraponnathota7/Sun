#include <stdio.h>

int main(){

    int N, high = 0, medium = 0, low = 0;

    printf("Enter N: ");
    scanf("%d", &N);

    int ratings[N];

    printf("Enter the ratings: ");
    for(int i = 0; i < N; i++){

        scanf("%d", &ratings[i]);

        if(ratings[i] <= 2){
            low ++;
        }
        else if(ratings[i] == 3){
            medium ++;
        }
        else{
            high ++;
        }

       
 
    }

     printf("High: %d\n Medium: %d\n Low: %d\n", high, medium, low);



    return 0;
}