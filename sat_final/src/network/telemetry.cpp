#include "network/telemetry.hpp"

#include "esp_http_client.h"

#include <stdio.h>
#include <string.h>

#define SERVER_URL "http://172.20.10.13:5000/update"

/**
 * @brief Trimite datele senzorilor către Raspberry Pi.
 *
 * Datele sunt convertite în format JSON și
 * trimise prin HTTP POST către backend-ul Flask.
 */

void sendTelemetry(
    float temp,
    float distance,
    int gx,
    int gy,
    int gz,
    int servo_angle
)
{
    char json[512];

    sprintf(
        json,

        "{"
        "\"temperature\": %.2f,"
        "\"distance\": %.2f,"
        "\"gx\": %d,"
        "\"gy\": %d,"
        "\"gz\": %d,"
        "\"servo_angle\": %d"
        "}",

        temp,
        distance,
        gx,
        gy,
        gz,
        servo_angle
    );

    printf("JSON SENT:\n%s\n", json);

    esp_http_client_config_t config = {};

    config.url = SERVER_URL;

    esp_http_client_handle_t client =
        esp_http_client_init(&config);

    esp_http_client_set_method(
        client,
        HTTP_METHOD_POST
    );

    esp_http_client_set_header(
        client,
        "Content-Type",
        "application/json"
    );

    esp_http_client_set_post_field(
        client,
        json,
        strlen(json)
    );

    esp_http_client_perform(client);

    esp_http_client_cleanup(client);
}