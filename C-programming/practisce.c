#include <stdio.h>

int main()
{
 /*
    char item[50] = "";
    float price = 0.0f;
    int quantity;
    float total = 0.0f;

   

    printf("what item would you like to buy?: ");
    fgets(item, sizeof(item), stdin);

    printf("what is the price for each?: ");
    scanf("%f", &price);
    
    printf("how many would you like?: ");
    scanf("%d", &quantity);

    total = (price*quantity);
    

    printf("you bought %d %s", quantity, item) ;
    printf("The total is: %.2f\n", total) ;
    

  */

    
    char noun[40] = "" ;
    char verd[40] = "" ;
    char adjective[40] = "";
    char adjective2[40] = "";
    char adjective3[40] = "";

    printf("Enter a noun: ") ;
    fgets(noun, sizeof(noun), stdin) ;

    printf("Enter a verd: ") ;
    fgets(verd, sizeof(verd), stdin) ;

    printf("Enter an adjetive: ") ;
    fgets(adjective, sizeof(adjective), stdin) ;

    printf("Enter an adjective2: ") ;
    fgets(adjective2, sizeof(adjective2), stdin) ;

    printf("Enter an adjective: " ) ;
    fgets(adjective3, sizeof(adjective3), stdin) ;
  
    return 0;
}