#include "senzori/mpu6050.hpp"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include <stdio.h>

#define MPU_ADDR 0x68

#define REG_PWR_MGMT_1 0x6B
#define REG_WHO_AM_I   0x75
#define REG_GYRO_XOUT_H 0x43

Mpu6050::Mpu6050(i2c_port_t port) : port_(port) {}

esp_err_t Mpu6050::WriteReg(uint8_t reg, uint8_t data)
{
    uint8_t buf[2] = {reg, data};
    return i2c_master_write_to_device(port_, MPU_ADDR, buf, 2, 100 / portTICK_PERIOD_MS);
}

esp_err_t Mpu6050::ReadRegs(uint8_t reg, uint8_t* data, size_t len)
{
    return i2c_master_write_read_device(port_, MPU_ADDR, &reg, 1, data, len, 100 / portTICK_PERIOD_MS);
}

esp_err_t Mpu6050::Init()
{
    // Wake up
    if (WriteReg(REG_PWR_MGMT_1, 0x00) != ESP_OK)
        return ESP_FAIL;

    vTaskDelay(pdMS_TO_TICKS(100));

    uint8_t id = 0;
    if (ReadRegs(REG_WHO_AM_I, &id, 1) != ESP_OK)
        return ESP_FAIL;

    printf("MPU ID: 0x%X\n", id);

    if (id != 0x68)
        return ESP_FAIL;

    return ESP_OK;
}

MpuStatus Mpu6050::ReadGyro(int16_t& gx, int16_t& gy, int16_t& gz)
{
    uint8_t data[6];

    if (ReadRegs(REG_GYRO_XOUT_H, data, 6) != ESP_OK)
        return MpuStatus::I2C_ERROR;

    gx = (data[0] << 8) | data[1];
    gy = (data[2] << 8) | data[3];
    gz = (data[4] << 8) | data[5];

    return MpuStatus::OK;
}