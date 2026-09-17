#include <stdio.h>

int main(){
    

    for (int f = 1; f <= 10; f++)
    {

        for (char c = 'A'; c <= 'D'; c++)
        {

            if (f == 1 && c == 'C')
            {
                continue;
            }
            else
            {
                printf("%d%c ", f, c);
            }
        }
        printf("\n");
    }


    return 0;
}