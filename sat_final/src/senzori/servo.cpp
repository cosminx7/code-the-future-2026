#include "senzori/servo.hpp"
#include "driver/ledc.h"

#define SERVO_CHANNEL LEDC_CHANNEL_0
#define SERVO_TIMER   LEDC_TIMER_0

Servo::Servo(gpio_num_t pin) : pin_(pin) {}

void Servo::init()
{
    ledc_timer_config_t timer = {};
    timer.speed_mode = LEDC_LOW_SPEED_MODE;
    timer.timer_num = SERVO_TIMER;
    timer.duty_resolution = LEDC_TIMER_16_BIT;
    timer.freq_hz = 50;

    ledc_timer_config(&timer);

    ledc_channel_config_t ch = {};
    ch.gpio_num = pin_;
    ch.speed_mode = LEDC_LOW_SPEED_MODE;
    ch.channel = SERVO_CHANNEL;
    ch.timer_sel = SERVO_TIMER;
    ch.duty = 0;

    ledc_channel_config(&ch);
}

void Servo::setAngle(int angle)
{
    if (angle < 0) angle = 0;
    if (angle > 180) angle = 180;

    int duty = (angle * 2000 / 180 + 500) * 65535 / 20000;

    ledc_set_duty(LEDC_LOW_SPEED_MODE, SERVO_CHANNEL, duty);
    ledc_update_duty(LEDC_LOW_SPEED_MODE, SERVO_CHANNEL);
}