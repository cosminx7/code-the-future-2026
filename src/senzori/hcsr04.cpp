#include "senzori/hcsr04.hpp"
#include "esp_timer.h"
#include "rom/ets_sys.h"

HCSR04::HCSR04(gpio_num_t t, gpio_num_t e) : trig_(t), echo_(e) {}

void HCSR04::init()
{
    gpio_set_direction(trig_, GPIO_MODE_OUTPUT);
    gpio_set_direction(echo_, GPIO_MODE_INPUT);
}

float HCSR04::read()
{
    // trigger 10us
    gpio_set_level(trig_, 0);
    ets_delay_us(2);
    gpio_set_level(trig_, 1);
    ets_delay_us(10);
    gpio_set_level(trig_, 0);

    // wait HIGH
    int64_t start = esp_timer_get_time();
    while (!gpio_get_level(echo_))
    {
        if (esp_timer_get_time() - start > 30000)
            return -1;
    }

    int64_t echo_start = esp_timer_get_time();

    while (gpio_get_level(echo_))
    {
        if (esp_timer_get_time() - echo_start > 30000)
            return -1;
    }

    int64_t echo_end = esp_timer_get_time();

    float duration = echo_end - echo_start;

    return duration * 0.0343f / 2.0f;
}