#include <stdio.h>

int main()
{
    // write a file

    FILE *pfile = fopen("questions.txt", "w");

    char text[] = {"where you are studing now?\n what is your full name?"};

    if (pfile == NULL)
    {
        printf("Could not write file\n");
        return 1;
    }

    fprintf(pfile, "%s", text);

    fclose(pfile); 

    // read a file

    FILE *pfile2 = fopen("/home/yazra5577/C-programming/output.txt", "r");
    char buffer[1024] = {0};

    if (pfile2 == NULL)
    {
        printf("Could not open file\n");
        return 1;
    }

    while (fgets(buffer, sizeof(buffer), pfile2) != NULL)
    {
        printf("%s", buffer);
    }

    fclose(pfile2);
    return 0;
}