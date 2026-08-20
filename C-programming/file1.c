#include <stdio.h>
#include <stdbool.h>

int main()
{
    // this is my first c program after skipping class

    /* this
    is
    my
    first
    program in C*/
    printf("my name is yazra\n");
    printf("we are in the future\n");

    // varibles

    int t = 1;
    int weight = 100.0;
    printf("the number is %d\n", t);
    printf("my weight is %d\n", weight);

    float cgpa = 9.8121437;
    double cgpa2 = 9.81214394688121;
    printf("average cgpa %.7f\n", cgpa);
    printf("average cgpa %.15lf\n", cgpa2);

    char name = 'y';
    printf("my name is %c\n", name);

    char name2[] = "yazra";
    printf("my name is %s\n", name2);

    // bools

    bool IsOnline = true;
    printf("%d\n", IsOnline);

    // format spectifies with their modifications

    int num = 8;
    printf("%4d\n", num);
    printf("%04d\n", num);

    // floats
    float num2 = 8.9;
    printf("%3.2f\n", num2);

    // arthematic operations (+ - * / % -- ++)

    int n = 5;
    int n2 = 1;
    // int n3 = n + n2 ;
    float n3 = n / n2;
    printf("%f\n", n3);

    char school[30] = "yazrajfjj fjfjfj";
    printf("%s\n", school);

    int height;
    float gpa = 0.0;
    char grade = '\0';
    char name4[] = "";
    printf("%s\n", name4);

    // to get input from user
    printf("enter your height: ");
    scanf("%d", &height);

    printf("enter your letter: ");
    scanf("%c", &grade);

    // printf("enter your name: ");
    // scanf(" %s", &grade);

    printf("%s\n", name4);
    printf("%d\n", height);
    printf("%c\n", grade);

    return 0;
}