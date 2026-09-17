#include <stdio.h>

int main(){
    
    char name[50] = "yazra";
    int roll_no = 58;
    char branch[50] = "ECE";
    int Year = 2026;
    char Email[50] = "yazra@gmail.com";
    long Phone = 8487633456;

    printf(" =========================\n");
    printf("|      STUDENT CARD       |\n");
    printf(" =========================\n");

    printf("| Name    :%s          |\n", name);
    printf("| Roll no :%d             |\n", roll_no);
    printf("| Branch  :%s            |\n", branch);
    printf("| Year    :%d           |\n", Year);
    printf("| Email   :%s|\n", Email);
    printf("| Phone   :%ld     |\n", Phone);

    printf(" =========================\n");

    return 0;
}