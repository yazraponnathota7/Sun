#include <stdio.h>

void ageIncrement(int *age);

int main()
{

    int age = 17;
    int Age = 17;

    printf("%p\n", &age);
    printf("%p\n", &Age);

    int age1 = 18;
    int *pAge1 = &age1;

    ageIncrement(pAge1);

    printf("%d\n", age1);

    // printf("%p\n", &age1);
    // printf("%p\n", pAge1);

    return 0;
}

void ageIncrement(int *age)
{
    // pass by reference
    (*age)++;
}