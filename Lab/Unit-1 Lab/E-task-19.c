#include <stdio.h>

int main(){


int n = 42;
printf("[%5d]\n", n);
printf("[%-5d]\n", n);
printf("[%05d]\n", n);



float pi = 3.14159265;
printf("%.2f\n", pi);
printf("%.4f\n", pi);
printf("%8.3f\n", pi);

printf("[%10s]\n", "hi");
printf("[%-10s]\n", "hi");
    

    return 0;
}