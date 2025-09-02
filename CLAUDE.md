\#include <stdio.h>

\#include <stdlib.h>



// node structure. 

typedef struct LinkedListNode {

&nbsp;   int value;

&nbsp;   struct LinkedListNode \* next;

&nbsp;   struct LinkedListNode \* prev;

}LinkedListNode;











LinkedListNode\* createLinkedListNode (int val) {

&nbsp;   // first we malloc

&nbsp;   LinkedListNode \* newNode = (LinkedListNode \*) malloc(sizeof(LinkedListNode));

&nbsp;   newNode->value = val;

&nbsp;   newNode->next = NULL;

&nbsp;   newNode->prev= NULL;

&nbsp;   return newNode;

}



void add ( LinkedListNode\*\* head, int val ) {

&nbsp;   LinkedListNode \* nodeToAdd = createLinkedListNode(val);

&nbsp;   if (\*head == NULL) {

&nbsp;       \*head = nodeToAdd;

&nbsp;       return;

&nbsp;   }

&nbsp;   LinkedListNode \* temp = \*head;

&nbsp;   if (temp->value > val){

&nbsp;       nodeToAdd->next = temp;

&nbsp;       temp->prev = nodeToAdd;

&nbsp;       \*head = nodeToAdd;

&nbsp;       return;

&nbsp;   }

&nbsp;   while (temp->next \&\& temp->next->value < val) {

&nbsp;       temp = temp->next;

&nbsp;   }

&nbsp;   nodeToAdd->next = temp->next;

&nbsp;   nodeToAdd->prev = temp;

&nbsp;      



&nbsp;   if (temp->next) {

&nbsp;       temp->next->prev = nodeToAdd;

&nbsp;   }

&nbsp;    temp->next = nodeToAdd;

&nbsp;   return;

}



void printLinkedListBackwards(LinkedListNode \*head) {

&nbsp;   LinkedListNode \* temp = head;

&nbsp;   if (temp == NULL) {

&nbsp;       return;

&nbsp;   }

&nbsp;   while (temp->next) {

&nbsp;       temp=  temp->next;

&nbsp;   }

&nbsp;   while (temp != NULL) {

&nbsp;       printf("%d",temp->value );

&nbsp;       if (temp->prev) 

&nbsp;           printf("<-->");

&nbsp;       temp = temp->prev;

&nbsp;   }

&nbsp;   printf(". \\n");

}   



// ask if this naming is okay?

void removeNode(LinkedListNode\*\* head, int val) {



&nbsp;   if (\*head == NULL ) {

&nbsp;       return;

&nbsp;   }

&nbsp;   LinkedListNode \* temp = \*head;

&nbsp;   if ((\*head)->value == val) {

&nbsp;       

&nbsp;       \*head = temp->next;

&nbsp;       if (temp->next) {

&nbsp;        (\*head)->prev = NULL   ;

&nbsp;       }

&nbsp;       free(temp);

&nbsp;       return;

&nbsp;   }

&nbsp;   while (temp->next \&\& temp->next->value != val) {

&nbsp;       temp = temp->next;

&nbsp;   }

&nbsp;       LinkedListNode \* toRemove = temp->next;



&nbsp;   if (toRemove == NULL) {

&nbsp;       return;

&nbsp;   }

&nbsp;   // have to delete temp->next

&nbsp;   temp->next = toRemove->next;

&nbsp;   if (temp->next) {

&nbsp;   temp->next->prev = temp;

&nbsp;   }

&nbsp;   free(toRemove);

}





LinkedListNode\* generateLinkedList () {

&nbsp;   LinkedListNode \* head = NULL;

&nbsp;   for(int i = 1; i<= 5; i++) {

&nbsp;       add(\&head, i);

&nbsp;   }

}



// tests

int main() {

&nbsp;   LinkedListNode \* head = generateLinkedList(); // generates with 1 through 5

&nbsp;   printLinkedListBackwards(head);

&nbsp;   // testing.

&nbsp;   add(\&head, 7);

&nbsp;   add(\&head,8);

&nbsp;   add(\&head,3);

&nbsp;   add(\&head,11);

&nbsp;   add(\&head,9);



&nbsp;   printLinkedListBackwards(head);

&nbsp;        removeNode(\&head, 3);

printLinkedListBackwards(head);



removeNode(\&head,7);



printLinkedListBackwards(head);



removeNode(\&head,11);

printLinkedListBackwards(head);



removeNode(\&head,9);

printLinkedListBackwards(head);



removeNode(\&head,8);

printLinkedListBackwards(head); 



















}









