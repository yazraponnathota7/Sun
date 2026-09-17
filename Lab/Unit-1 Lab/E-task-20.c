#include <stdio.h>

int main()
{

    float weight;

    int height;

    char code;

    printf("Enter your weight, height, and category on one line: ");
    scanf("%f %d %c", &weight, &height, &code);

    printf("Weight: %.2f\nHeight: %d\nCategory: %c\n", weight, height, code);

    return 0;
}