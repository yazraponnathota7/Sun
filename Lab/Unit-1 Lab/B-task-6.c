#include <stdio.h>

int main(){
    
    
    int age = 9;
    float gpa = 9.87;
    double salary = 9999.6453735;
    char martial = 'N' ;


    printf("Size of interger (age): %zu bytes\n", sizeof(age));
    printf("Size of float (gpa)   : %zu bytes\n", sizeof(gpa));
    printf("Size of double (name) : %zu bytes\n", sizeof(salary));
    printf("Size of char (martial): %zu bytes\n", sizeof(martial));


    return 0;
}