#include <stdio.h>

int main()
{

    float bill;
    char member;

    printf("Total bill: ");
    scanf("%f", &bill);

    printf("Are you a member(Y or N): ");
    scanf(" %c", &member);

    float discount_percent = 0;

    if (bill >= 5000 && member == 'Y')
    {

        discount_percent = 20;
    }
    else if (bill >= 5000 ) //no need to N
    {

        discount_percent = 10;
    }
    else if (bill >= 2000 && bill <= 4999)
    {

        discount_percent = 5;
    }
    else
    {
        discount_percent = 0;
    }

    float discount_amount = bill * (discount_percent / 100);

    printf("%.2f\n", (bill - discount_amount));

    return 0;
}