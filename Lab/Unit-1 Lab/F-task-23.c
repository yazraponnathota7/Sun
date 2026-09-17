#include <stdio.h>

int main()
{

    int balance;
    int amount;

    printf("Balance: ");
    scanf("%d", &balance);

    printf("Withdraw: ");
    scanf("%d", &amount);

    balance = balance - amount;

    if (amount % 100 != 0)
    {
        printf("Amount must be multiple of 100.");
    }
    else if (amount < 100 || amount > 20000)
    {
        printf("Amount must be between 100 and 20000");
    }
    else if (amount > balance)
    {
        printf("amount must be more than balance");
    }
    else if (balance - amount < 500)
    {

        printf("the balance must not fall below 500 (minimum balance)");
    }
    else
    {
        printf("Success and Remaining balance %d ", balance);
    }
}