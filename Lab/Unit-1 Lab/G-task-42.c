#include <stdio.h>

int main(){


    float t, max, min, sum = 0, avg;
    int hot = 0;



    for(int d = 1; d <= 7; d++){

        printf("Day %d: ", d);
        scanf("%f", &t);

        min = t;
        max = t;

        if(t > max) max = t;

        if(t < max) min = t;

        t += sum ;


    }



    
    return 0;
}