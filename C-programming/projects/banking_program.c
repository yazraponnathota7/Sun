#include <stdio.h>

void checkBalance(float balance);
float deposit();
float withdraw(float balance);

int main()
{

    int choice = 0;
    float balance = 0.0f;

    do
    {
        printf("--- Welcome to the bank of RGUKT ATM ---\n");
        printf("\nSelect the service are available...\n");
        printf("\n1. Balance\n");
        printf("2. Withdraw\n");
        printf("3. Deposit\n");
        printf("4. Exit\n");
        printf("Enter your choice: ");
        scanf("%d", &choice);

        switch (choice)
        {

        case 1:

            checkBalance(balance);
            break;
        case 2:
            balance -= withdraw(balance);
            break;

        case 3:
            balance += deposit(balance);
            break;

        case 4:
            printf("Thank you for visiting..\n");
            break;

        default:
            printf("\nInvalid choice!!\n");
            break;
        }

    } while (choice != 4);

    return 0;
}

void checkBalance(float balance)
{

    printf("\nCurrent balance: %.2f\n", balance);
}

float deposit()
{

    float amount = 0.0f;

    printf("\nEnter amount to deposit: ");
    scanf("%f", &amount);

    if (amount < 0)
    {
        printf("Invalid money\n");
        return 0.0f;
    }
    else
    {

        printf("Successfully deposited.\n");
    }

    return amount;
}

float withdraw(float balance)
{

    float amount = 0.0f;

    printf("Enter amount to withdraw: \n");
    scanf("%f", &amount);

    if (amount < 0)
    {
        printf("Invalid Money.\n");
        return 0.0f;
    }
    else if (amount > balance)
    {
        printf("Insuffcient funds! you balance is %.2f\n", balance);
        return 0.0f;
    }
    else
    {
        printf("Successfully withdrew %.2f\n", amount);
        return amount;
    }
    
}