#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int getComputerChoice();
int getUserChoice();
void checkWinner(int userchoice, int computerChoice);

int main()
{

  srand(time(NULL));

  printf("--- Rock Paper Scissors ---\n");

  int UserChoice = getUserChoice();
  int ComputerChoice = getComputerChoice();

  switch (UserChoice)
  {
  case 1:
    printf("You choose ROCK!\n");
    break;

  case 2:
    printf("You choose PAPER!\n");
    break;

  case 3:
    printf("You choose SCISSORS\n");
    break;
  }

  switch (ComputerChoice)
  {
  case 1:
    printf("Computer choose ROCK!\n");
    break;

  case 2:
    printf("Computer choose PAPER!\n");
    break;

  case 3:
    printf("Computer choose SCISSORS!\n");
    break;
  }

  checkWinner(UserChoice, ComputerChoice);

  unsigned int i = -2147483647;
  printf("%zu", sizeof(i));
}

int getComputerChoice()
{

  return (rand() % 3) + 1;
};

int getUserChoice()
{

  int choice = 0;
  do
  {

    printf("1.Rock\n");
    printf("2.Paper\n");
    printf("3.Scissors\n");
    printf("Choose one..\n");
    scanf("%d", &choice);
  } while (choice < 1 || choice > 3);

  return choice;
};

void checkWinner(int userchoice, int computerChoice)
{

  if (userchoice == computerChoice)
  {
    printf("Tie\n");
  }
  else if ((userchoice == 1 && computerChoice == 3) ||
           (userchoice == 2 && computerChoice == 1) ||
           (userchoice == 3 && computerChoice == 2))
  {
    printf("You Win\n");
  }
  else
  { 
    printf("You Loss\n");
  }
}
