#include <stdio.h>
#include <string.h>

int main()
{

    char name[50] = "";
    int age;
    float height;
    char code;

    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
   

    printf("Enter your age: ");
    scanf("%d", &age);

    printf("Enter your height: ");
    scanf("%f", &height);

    printf("Enter your code: ");
    scanf(" %c", &code);

    printf("%s\n", name);
    printf("%d\n", age);
    printf("%f\n", height);
    printf("%c\n", code);

    return 0;
}