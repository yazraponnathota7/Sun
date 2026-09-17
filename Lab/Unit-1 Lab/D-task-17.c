#include <stdio.h>

int main()
{

    char date[] = "30-08-2026";
    float tem = 28.4;
    float humidity = 90.00;
    char wind = 'N';
    char condition = 'S';

    printf("====== WEATHER REPORT ======\n");
    printf("Data         : %s\n", date);
    printf("Temperature  : %.2f\n", tem);
    printf("Humidity     : %.2f\n", humidity);
    printf("Wind         : %c\n", wind);
    printf("Condition    : %c\n", condition);
    printf("===========================\n");

    return 0;
}