#include <stdio.h>

void function1(char n[], char n2[])
{

    printf("first name: %s\n", n);
    printf("second name: %s\n", n2);
}

int main()
{
    char name1[] = "yazra";
    char name2[] = "sai";

    function1(name1, name2);

    /*
        int choice = 0;
        double kilogram = 0.0;
        double pounds = 0.0;

        printf("Weight conversion.....\n");
        printf("1) Kilogram to Pounds\n");
        printf("2) Pounds to kilogram\n");

        printf("choose 1 or 2: ");
        scanf("%d", &choice);

        if (choice == 1)
        {

            // kilogram to pounds

            printf("Enter weight in kilogram: ");
            scanf("%lf", &kilogram);
            pounds = kilogram * 2.205;
            printf("%.2lf Kg is equal to %.2lf p\n ", kilogram, pounds);
        }
        else if (choice == 2)
        {
            // Pounds to Kilogram
            printf("Enter weight in pounds: ");
            scanf("%lf", &pounds);
            kilogram = pounds * (1 / 2.205);
            printf("%.2lf P is equal to  %.2lf Kg\n", pounds, kilogram);
        }
        else
        {
            printf("!!Enter a valid number either 1 or 2...\n");
        }

    */

    int week_no = 2;

    switch (week_no)
    {

    case 1:
        printf("Monday\n");
        break;

    case 2:
        printf("Tuesday\n");
        break;

    case 3:
        printf("Wednesday\n");
        break;

    default:
        break;
    }

    return 0;

    double x = 1.0;
    double y = 0.0;
    double r = (x / y);
    printf("%lf\n", r);

    // functions
}