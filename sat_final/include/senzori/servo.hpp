#pragma once

#include "driver/gpio.h"

class Servo
{
public:
    explicit Servo(gpio_num_t pin);

    void init();
    void setAngle(int angle);

private:
    gpio_num_t pin_;
};