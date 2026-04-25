#include "network/command_listener.hpp"

#include "esp_http_client.h"

#include <stdio.h>
#include <string.h>

#define COMMAND_URL "http://172.20.10.13:5000/command"

/**
 * @brief Verifică dacă există comenzi noi trimise din dashboard.
 *
 * Trimite o cerere HTTP GET către backend-ul Flask
 * și verifică răspunsul primit.
 *
 * Dacă este detectată comanda "STOP_BUZZER",
 * buzzer-ul este dezactivat prin variabila
 * globală `buzzerMuted`.
 */

bool buzzerMuted = false;

void checkCommand()
{
    esp_http_client_config_t config = {};

    config.url = COMMAND_URL;

    esp_http_client_handle_t client =
        esp_http_client_init(&config);

    esp_http_client_set_method(
        client,
        HTTP_METHOD_GET
    );

    esp_err_t err =
        esp_http_client_open(client, 0);

    if (err == ESP_OK)
    {
        esp_http_client_fetch_headers(client);

        char buffer[256] = {0};

        int len =
            esp_http_client_read(
                client,
                buffer,
                sizeof(buffer) - 1
            );

        if (len > 0)
        {
            buffer[len] = '\0';

            printf(
                "COMMAND RESPONSE: %s\n",
                buffer
            );

            if (
                strstr(
                    buffer,
                    "STOP_BUZZER"
                )
            )
            {
                buzzerMuted = true;

                printf(
                    "BUZZER OPRIT DIN DASHBOARD\n"
                );
            }
            else
            {
                printf(
                    "NU EXISTA COMANDA\n"
                );
            }
        }
    }
    else
    {
        printf(
            "EROARE GET COMMAND\n"
        );
    }

    esp_http_client_close(client);

    esp_http_client_cleanup(client);
}