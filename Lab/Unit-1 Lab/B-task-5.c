#include <stdio.h>

int main(){
    

    float temperature = 33.8;
    double Rainfall = 238.99847;
    char Wind_direction = 'N';
    int Sunny_hours = 7;
    char Did_it_rain = 'Y';

    printf("Temperature(C): %f\n", temperature);
    printf("Rainfall      : %lfmm \n", Rainfall);
    printf("wind Direction: %c\n", Wind_direction);
    printf("Sunny hours   : %d\n", Sunny_hours);
    printf("Rained Today? : %c\n", Did_it_rain);


    return 0;
}