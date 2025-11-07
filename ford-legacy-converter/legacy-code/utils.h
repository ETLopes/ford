/**
 * Utility functions header file
 * Common helper functions for the legacy C application
 */

#ifndef UTILS_H
#define UTILS_H

#include <stdio.h>

// Function to validate if a number is positive
int is_positive(double number);

// Function to get maximum of two numbers
double get_max(double a, double b);

// Function to format output message
void format_message(char *buffer, const char *format, double value);

#endif // UTILS_H

