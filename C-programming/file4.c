#include <stdio.h>
#include <stdbool.h>
#include <string.h>

// enum Day
// {
//     SUNDAY = 1,
//     MONDAY,
//     TUESDAY
// };

// no need to type everytime

typedef enum
{

    SUNDAY = 1,
    MONDAY,
    TUESDAY

} Day;

struct Cricketer
{
    char name[50];
    int Num;
    float strikeRate;
    bool isRetire;
};

typedef struct 
{
    char name[15];
    int roll_no;
    char section;
}student;


void CricketerInfo(struct Cricketer c);

int main()
{

    Day day = SUNDAY;
    printf("%d\n", day);

    struct Cricketer criketer = {"Dhoni", 7, 300.0, true};
    struct Cricketer cricketer2 = {"Virat", 280.98, false};

    struct Cricketer cricketer3 = {0}; // declare

    strcpy(cricketer3.name, "sachin"); // after initilazation
    cricketer3.Num = 10;
    cricketer3.strikeRate = 150.87;
    cricketer3.isRetire = false;

    CricketerInfo(criketer);
    CricketerInfo(cricketer2);
    CricketerInfo(cricketer3);

    // student std1 = {"yazraT", 58, 'B' };
    // student std2 = {"Guru", 8, 'A' };
    // student std3 = {"sai", 5, 'C' };

    student students[3] = {{"yazraT", 58, 'B' }, 
                        {"Guru", 8, 'A' },   //array of structs
                        {"sai", 5, 'C' }};
    
    for(int i = 0; i < 3; i++){
        printf("Name   : %s\n", students[i].name);
        printf("Roll_no: %d\n", students[i].roll_no);
        printf("Section: %c\n", students[i].section);
    }

    return 0;
}

void CricketerInfo(struct Cricketer c)
{
    printf("Name: %s\n", c.name);
    printf("Number: %d\n", c.Num);
    printf("Strike Rate: %.2f\n", c.strikeRate);
    printf("Is retire: %s\n", (c.isRetire) ? "Yes\n" : "No\n");
}