#include <stdio.h> 
#include <stdlib.h>

int main(){
    
    // int i ;
    // printf("how many  elements want to enter:   ");
    // scanf("%d", &i);

    // int names[] = 0;

    int  number =0 ;
    printf("Enter the number of grades: ");
    scanf("%d", &number);

    char *grades = malloc(number * sizeof(char));

    if(grades == NULL){
        printf("Memory allocation failed\n");
        return 1;
    }


    for(int i = 0 ; i < number; i++){
        printf("Enter grade %d: ", i + 1);
        scanf(" %c", &grades[i]);
    }

    for(int i = 0; i < number; i++){
        printf("%c\n", grades[i]);
    }

    free(grades); //returning "rented" space back to OS
    grades = NULL; //avoids dangling pointers 
    return 0 ;
}