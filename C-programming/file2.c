#include <stdio.h>
#include <string.h>
#include <math.h>
// #define PI 3.14 

int main()
{
    /*
    printf("start....\n");

    char name[30] = "";

    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strlen(name) - 1] = '\0' ;
    // scanf("%d", &age);

    printf("%s\n", name);
    printf("yazra\n") ;

    */
 
/*
    int x = -90;

    // x = sqrt(x);
    // x = pow(x, 2) ;
    // x = round(x) ;
    // x = ceil(x) ;
    // x = floor(x) ;
    // x = sin(90);
    // x = cos(x) ;
    // x = tan(x) ;
    // x = log(x) ; 
    // x = abs(x) ; 

    printf("%f\n", PI);

    */

    double radius = 0.0 ;
    const double PI = 3.14 ;
    double area = 0.0 ;
    double volume = 0.0 ;
    double suraface_area = 0.0 ;

    printf("Enter the radius: ") ;
    scanf("%lf", &radius) ;

    area = PI * pow(radius, 2) ;
    
    
    suraface_area = 4 * PI * pow(radius, 2 ) ;
    printf("Surface area of sphere: %.2lf\n", suraface_area) ;

    volume = (4.0/3.0) * PI * pow(radius, 3) ;
    printf("Volume of the sphere: %.2lf\n", volume) ;


    return 0;
}