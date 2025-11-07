/**
 * Utility functions implementation
 */

#include "utils.h"
#include <stdio.h>
#include <string.h>

int is_positive(double number) {
    return number > 0.0;
}

double get_max(double a, double b) {
    if (a > b) {
        return a;
    }
    return b;
}

void format_message(char *buffer, const char *format, double value) {
    if (buffer == NULL || format == NULL) {
        return;
    }
    snprintf(buffer, 256, format, value);
}

