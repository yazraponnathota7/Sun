#include <stdio.h>
#include <string.h>
#include <ctype.h>

#include <stdbool.h>

typedef char string[8];

typedef int number;
int main()
{

    char name[] = "yazra T";
    printf("%c\n", name[5]);

    char states[][6] = {"AP", "TG", "jammu", "tamil"};

    states[0][1] = 'T';
    states[1][0] = 'G';

    int size = sizeof(states) / sizeof(states[0]);

    for (int i = 0; i < size; i++)
    {

        printf("%s\n", states[i]);
    }

    // Exercise

    char names[3][25] = {0};

    int rows = sizeof(names) / sizeof(names[0]);

    // for(int i = 0; i < rows; i++){

    //     printf("Enter a name: ");
    //     fgets(names[i], sizeof(names[i]), stdin);
    //     // names[i][strlen(names[i]) - 1] = '\0';

    // }

    // for(int i = 0; i<rows; i++){
    //     printf("%s\n", names[i]);

    // }

    // Quiz

    char Questions[][100] = {"who is our present PM of India?.",
                             "Who is our state current CM?.",
                             "How many states does India have currently?."};

    char Options[][100] = {
        "A. Rahul Gandhi \nB. Modi \nC. Amit \nD. Karge",
        "A. Jagan \nB. LOkesh \nC. chandra babu \nD. Roja",
        "A. 22 \nB. 29 \nC. 28 \nD. 23",
    };

    char Key[] = {'B', 'C', 'B'};

    int score = 0;

    char guess = '\0';

    int questionCount = sizeof(Questions) / sizeof(Questions[0]);

    for (int i = 0; i < questionCount; i++)
    {

        printf("\n%s\n", Questions[i]);
        printf("\n%s\n", Options[i]);

        printf("Enter option: ");
        scanf(" %c", &guess);

        guess = toupper(guess);

        if (guess == Key[i])
        {
            printf("Correct!!\n");
            score++;
        }
        else
        {
            printf("Wrong!\n");
        }
    }

    printf("\nYour score is %d out of %d\n", score, questionCount);

    // ternary operator

    bool isOnline = true;

    printf("%s\n", (isOnline) ? "online" : "offline");

    int num = 6;
    printf("%d is %s\n", num, (num % 2 == 0) ? "Even" : "Odd");

    int hours = 10;
    int minutes = 30;
    char *meridian = (hours < 12) ? "AM" : "PM";

    printf("%02d:%02d %s\n", hours, minutes, meridian);

    // typedef

    string std= "yazraT";

    number y = 0;
    number x = 8;
    printf("%d", x + y);

    return 0;
}