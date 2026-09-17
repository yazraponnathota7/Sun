#include <stdio.h>

int main(){

    int N;

    printf("Enter N: ");
    scanf("%d", &N);

    int nums[N];
    
    printf("Enter the values: ");
    for(int i = 0; i < N; i++){

        scanf("%d", &nums[i]);

    }

    int smallest = nums[0];
    int second = nums[1];

    if(second < smallest ){
       
        smallest = nums[1];
        second = nums[0];

    }

    for(int i = 2; i < N - 1; i++){

        if(nums[i] < smallest){
            second = smallest;
            smallest = nums[i];
        }
        else if(nums[i] < second){
            second = nums[i];
        }

    }

    printf("Second smallest: %d\n", second);



    return 0;
}