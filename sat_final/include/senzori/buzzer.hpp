#pragma once

#include "driver/gpio.h"

class Buzzer
{
public:
    explicit Buzzer(gpio_num_t pin);

    void init();
    void on();
    void off();

private:
    gpio_num_t pin_;
};