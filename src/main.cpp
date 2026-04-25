#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "driver/i2c.h"

#include "esp_timer.h"

#include "network/wifi_manager.hpp"
#include "network/telemetry.hpp"
#include "network/command_listener.hpp"

#include "senzori/mpu6050.hpp"
#include "senzori/dht22.hpp"
#include "senzori/servo.hpp"
#include "senzori/hcsr04.hpp"
#include "senzori/buzzer.hpp"

#define SDA GPIO_NUM_21
#define SCL GPIO_NUM_22

#define DHT_PIN GPIO_NUM_5

#define SERVO_PIN GPIO_NUM_18

#define TRIG_PIN GPIO_NUM_20
#define ECHO_PIN GPIO_NUM_15

#define BUZZER_PIN GPIO_NUM_4

extern bool buzzerMuted;

extern "C" void app_main()
{
    i2c_config_t conf{};

    conf.mode = I2C_MODE_MASTER;

    conf.sda_io_num = SDA;
    conf.scl_io_num = SCL;

    conf.sda_pullup_en = GPIO_PULLUP_ENABLE;
    conf.scl_pullup_en = GPIO_PULLUP_ENABLE;

    conf.master.clk_speed = 100000;

    i2c_param_config(
        I2C_NUM_0,
        &conf
    );

    i2c_driver_install(
        I2C_NUM_0,
        conf.mode,
        0,
        0,
        0
    );

    Mpu6050 mpu(I2C_NUM_0);
    mpu.Init();

    Dht22 dht(DHT_PIN);

    HCSR04 sonar(
        TRIG_PIN,
        ECHO_PIN
    );

    sonar.init();

    Servo servo(SERVO_PIN);
    servo.init();

    Buzzer buzzer(BUZZER_PIN);
    buzzer.init();

    wifi_init();

    int servo_angle = 0;

    static float lastValidTemp = 24;

    static bool servoActive = false;

    static int64_t servoStartTime = 0;

    static bool temperatureWasHigh = false;

    while (true)
    {
        int16_t gx, gy, gz;

        mpu.ReadGyro(
            gx,
            gy,
            gz
        );

        printf(
            "GX:%d GY:%d GZ:%d | ",
            gx,
            gy,
            gz
        );

        float temp = 0;

dht.read(temp);

static float filteredTemp = 24;

if (
    temp > 0 &&
    abs(temp - filteredTemp) < 5
)
{
    filteredTemp =
        filteredTemp * 0.8 +
        temp * 0.2;

    temp = filteredTemp;

    lastValidTemp = temp;
}
else
{
    temp = lastValidTemp;
}
        static float lastValidDist = 100;

float dist = sonar.read();

if (dist > 0)
{
    lastValidDist = dist;
}
else
{
    dist = lastValidDist;
}
        checkCommand();

        if (
            temp >= 30 &&
            !buzzerMuted
        )
        {
            buzzer.on();

            temperatureWasHigh = true;

            printf(
                "WARNING: TEMPERATURA RIDICATA | "
            );
        }
        else
        {
            buzzer.off();
        }

        if (
            temp < 30 &&
            temperatureWasHigh
        )
        {
            buzzerMuted = false;

            temperatureWasHigh = false;

            printf(
                "TEMPERATURA NORMALA | RESET ALARMA | "
            );
        }

        if (
            dist > 0 &&
            dist < 15 &&
            !servoActive
        )
        {
            servoActive = true;

            servoStartTime =
                esp_timer_get_time() / 1000;

            servo_angle = 60;

            servo.setAngle(60);

            printf(
                "OBIECT APROAPE -> SERVO 60 GRADE | "
            );
        }

        if (servoActive)
        {
            int64_t now =
                esp_timer_get_time() / 1000;

            if (
                now - servoStartTime >= 5000
            )
            {
                servo_angle = 0;

                servo.setAngle(0);

                servoActive = false;

                printf(
                    "SERVO REVINE LA 0 | "
                );
            }
        }

        sendTelemetry(
            temp,
            dist,
            gx,
            gy,
            gz,
            servo_angle
        );

        printf("\n");

        vTaskDelay(
            pdMS_TO_TICKS(300)
        );
    }
}