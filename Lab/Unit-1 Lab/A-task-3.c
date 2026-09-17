#include <stdio.h>

int main()
{

    char Full_name[50] = "ponn yazra";
    int Employ_ID = 455;
    int Age = 18;
    double Basic_salary = 1008378.78;
    char Gender = 'M';
    char Martial_status = 'N';

    printf("Employ Record......\n");
    printf("Full name   : %s\n", Full_name);
    printf("Employ_ID   : %d\n", Employ_ID);
    printf("Age         : %d\n", Age);
    printf("Basic salary: %.2lf\n", Basic_salary);
    printf("Gender      : %c\n", Gender);
    printf("Martial(Y/N): %c\n", Martial_status);

    return 0;
}