#pragma once

#include "driver/i2c.h"
#include "esp_err.h"
#include <stdint.h>

enum class MpuStatus : int8_t
{
    OK = 0,
    NOT_FOUND = -1,
    I2C_ERROR = -2
};

class Mpu6050
{
public:
    explicit Mpu6050(i2c_port_t port);

    esp_err_t Init();
    MpuStatus ReadGyro(int16_t& gx, int16_t& gy, int16_t& gz);

private:
    i2c_port_t port_;

    esp_err_t WriteReg(uint8_t reg, uint8_t data);
    esp_err_t ReadRegs(uint8_t reg, uint8_t* data, size_t len);
};