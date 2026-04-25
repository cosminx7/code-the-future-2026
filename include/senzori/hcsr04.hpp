#pragma once
#include "driver/gpio.h"

class HCSR04
{
public:
    HCSR04(gpio_num_t trig, gpio_num_t echo);

    void init();
    float read(); // cm

private:
    gpio_num_t trig_;
    gpio_num_t echo_;
};