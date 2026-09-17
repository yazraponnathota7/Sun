#include <stdio.h>

int main()
{

    int age = 19;
    float percentage = 98;
    double income = 25000;

    printf("[0] : not eligible\n");
    printf("[1] : eligible\n");
    printf("\n");

    printf("%d\n", ((age == 19) && (percentage == 98) && (income == 25000)));

    return 0;
}