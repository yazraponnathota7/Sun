#include <stdio.h>
#include <stdbool.h>

float Even_Checking(int);  //functin prototype

int a_num = 7; // GLOBAL VARIABLE



bool AgeChecker(int age)
{

    if (age > 18)
    {
        return true;
    }
    else
    {
        return false;
    }
}

// main function

int main()
{

    int num; // LOCAL VARIABLE
    bool result;

    printf("Enter and Check weather a number is even or not: ");
    scanf("%d", &num);

    result = Even_Checking(num);

    if (result == 1)
    {
        printf("True\n");
    }
    else
    {
        printf("False\n");
    }

    // age eligilbility

    int age = 2;

    if (AgeChecker(age))
    {
        printf("you may sign up\n");
    }
    else
    {
        printf("you don't have age to sign up\n");
    }

    if (1456789)
    {
        printf("yazra\n");
    }

    printf("%d\n", AgeChecker(age));

    a_num = 5;

    printf("%d", a_num);
}


float Even_Checking(int num)
{

    int result;

    if (num >= 0)
    {
        result = (num % 2 == 0);
        return true;
    }
    else
    {
        return false;
    }
}