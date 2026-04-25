#include "senzori/buzzer.hpp"

Buzzer::Buzzer(gpio_num_t pin) : pin_(pin) {}

void Buzzer::init()
{
    gpio_set_direction(pin_, GPIO_MODE_OUTPUT);
    gpio_set_level(pin_, 0);
}

void Buzzer::on()
{
    gpio_set_level(pin_, 1);
}

void Buzzer::off()
{
    gpio_set_level(pin_, 0);
}