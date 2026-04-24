#pragma once

#include "driver/gpio.h"
#include <stdint.h>

enum class DhtStatus : int8_t
{
    OK = 0,
    TIMEOUT = -1,
    CHECKSUM_ERROR = -2
};

class Dht22
{
public:
    explicit Dht22(gpio_num_t pin);

    DhtStatus read(float& temp);

private:
    gpio_num_t pin;

    bool waitLevel(int level, int timeout_us);
    int measureHigh();
};