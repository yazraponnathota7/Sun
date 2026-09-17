#include <stdio.h>

int main(){
    

        int x = 10;
        int y = 20;
        x = y;
        y = 5;
        x = x + y;
        printf("x = %d, y = %d\n", x, y);


    return 0;
}