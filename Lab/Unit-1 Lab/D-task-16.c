#include <stdio.h>

int main()
{

    int Dosa = 2;
    float price_dosa = 60;

    int idli = 4;
    float price_idli = 20;

    printf("======================================\n");
    printf("     RGUKT RKVALLEY - RECEIPT\n");
    printf("======================================\n");

    printf("Item        Qty   Rate   Amount\n");
    printf("\n");

    printf("Dosa        %d     %.2f   %.2f\n", Dosa, price_dosa, (Dosa * price_dosa));
    printf("Idli        %d     %.2f   %.2f\n", idli, price_idli, (idli * price_idli));

    printf("======================================\n");
    printf("TOTAL                     %.2f\n", ((Dosa * price_dosa) + (idli * price_idli)));
    printf("======================================\n");

    return 0;
}