/**
 * Legacy C Program Example
 * Simple calculator program demonstrating common C patterns
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_SIZE 100

// Structure to hold calculation result
typedef struct {
    double result;
    int error_code;
    char error_message[256];
} CalculationResult;

// Function to add two numbers
double add(double a, double b) {
    return a + b;
}

// Function to subtract two numbers
double subtract(double a, double b) {
    return a - b;
}

// Function to multiply two numbers
double multiply(double a, double b) {
    return a * b;
}

// Function to divide two numbers
CalculationResult divide(double a, double b) {
    CalculationResult calc_result;
    calc_result.error_code = 0;
    
    if (b == 0.0) {
        calc_result.error_code = 1;
        strcpy(calc_result.error_message, "Division by zero error");
        calc_result.result = 0.0;
        return calc_result;
    }
    
    calc_result.result = a / b;
    strcpy(calc_result.error_message, "");
    return calc_result;
}

// Main function
int main(int argc, char *argv[]) {
    double num1, num2;
    char operation;
    CalculationResult result;
    
    printf("=== Legacy C Calculator ===\n");
    printf("Enter first number: ");
    scanf("%lf", &num1);
    
    printf("Enter operation (+, -, *, /): ");
    scanf(" %c", &operation);
    
    printf("Enter second number: ");
    scanf("%lf", &num2);
    
    switch(operation) {
        case '+':
            result.result = add(num1, num2);
            result.error_code = 0;
            printf("Result: %.2f\n", result.result);
            break;
            
        case '-':
            result.result = subtract(num1, num2);
            result.error_code = 0;
            printf("Result: %.2f\n", result.result);
            break;
            
        case '*':
            result.result = multiply(num1, num2);
            result.error_code = 0;
            printf("Result: %.2f\n", result.result);
            break;
            
        case '/':
            result = divide(num1, num2);
            if (result.error_code == 0) {
                printf("Result: %.2f\n", result.result);
            } else {
                printf("Error: %s\n", result.error_message);
                return 1;
            }
            break;
            
        default:
            printf("Invalid operation!\n");
            return 1;
    }
    
    return 0;
}

