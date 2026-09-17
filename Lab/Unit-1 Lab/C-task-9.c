#include <stdio.h>

int main(){


    int notebooks = 135;
    int pens = 24;
    int Box = 85;
    float discount = 15;
    float Discount;
    float final_payment;
    float sub_total = (notebooks + pens + Box);

    Discount = (sub_total) * (discount / 100.0);
    final_payment = sub_total - Discount;

    printf("sub-total: %.2f\n", sub_total);
    printf("Discount : %.2f\n", Discount);
    printf("Payable  : %.2f\n", final_payment);
    

    return 0;
}