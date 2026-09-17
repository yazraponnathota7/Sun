#include <stdio.h>

int main()
{

    int days;
    int fee;

    printf("Numbers of days late: ");
    scanf("%d", &days);

    if (days == 0)
    {
        fee = 0;
    }
    else if (days <= 5)
    {
        fee = days * 2;
    }
    else if (days <= 15)
    {
        fee = days * 5;
    }
    else if (days <= 30)
    {
        fee = days * 10;
    }
    else
    {
        fee = 500;
    }

    printf("Days late : %d\n", days);
    printf("Fee       : %d\n", fee);

    return 0;
}