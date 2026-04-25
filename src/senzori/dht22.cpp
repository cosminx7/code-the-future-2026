#include "senzori/dht22.hpp"
#include "esp_timer.h"
#include "rom/ets_sys.h"

Dht22::Dht22(gpio_num_t p) : pin(p) {}

bool Dht22::waitLevel(int level, int timeout_us)
{
    int64_t start = esp_timer_get_time();

    while (gpio_get_level(pin) != level)
    {
        if (esp_timer_get_time() - start > timeout_us)
            return false;
    }
    return true;
}

int Dht22::measureHigh()
{
    int64_t start = esp_timer_get_time();

    while (gpio_get_level(pin) == 1)
    {
        if (esp_timer_get_time() - start > 100)
            break;
    }

    return (int)(esp_timer_get_time() - start);
}

DhtStatus Dht22::read(float& temp)
{
    uint8_t data[5] = {0};

    // START
    gpio_set_direction(pin, GPIO_MODE_OUTPUT);
    gpio_set_level(pin, 0);
    ets_delay_us(2000);

    gpio_set_level(pin, 1);
    ets_delay_us(30);

    gpio_set_direction(pin, GPIO_MODE_INPUT);

    // RESPONSE
    if (!waitLevel(0, 100)) return DhtStatus::TIMEOUT;
    if (!waitLevel(1, 100)) return DhtStatus::TIMEOUT;
    if (!waitLevel(0, 100)) return DhtStatus::TIMEOUT;

    // READ
    for (int i = 0; i < 40; i++)
    {
        if (!waitLevel(1, 100)) return DhtStatus::TIMEOUT;

        int t = measureHigh();

        data[i / 8] <<= 1;
        if (t > 40) data[i / 8] |= 1;
    }

    // CHECKSUM
    if ((uint8_t)(data[0] + data[1] + data[2] + data[3]) != data[4])
        return DhtStatus::CHECKSUM_ERROR;

    uint16_t raw = (data[2] << 8) | data[3];
    temp = raw * 0.1f;

    return DhtStatus::OK;
}