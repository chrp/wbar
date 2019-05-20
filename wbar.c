#include <stdlib.h>
#include <stdio.h>
#include <stdint.h>
#include <zbar.h>
#include "emscripten.h"

extern void on_detected_callback(const char *detected_code);

zbar_image_scanner_t *scanner = NULL;

EMSCRIPTEN_KEEPALIVE
int scan_image(uint8_t *raw, int width, int height)
{
    //Grayscale
    uint8_t* gray_img = (uint8_t*)malloc(width * height * sizeof(uint8_t));
    for (int i = 0; i < width; ++i) {
        for (int j = 0; j < height; ++j) {
            uint8_t* pixels = raw + i * height * 4 + j * 4;
            int sum = (int)pixels[0] + (int)pixels[1] + (int)pixels[2];
            gray_img[i * height + j] = (uint8_t)(sum / 3);
        }
    }

    zbar_image_t *image = zbar_image_create();

    zbar_image_set_format(image, zbar_fourcc('Y', '8', '0', '0'));
    zbar_image_set_size(image, width, height);
    zbar_image_set_data(image, gray_img, width * height, zbar_image_free_data);

    int return_code = zbar_scan_image(scanner, image);
    if(return_code < 0) {
        return(-1);
    }

    const zbar_symbol_t *symbol = zbar_image_first_symbol(image);
    for (; symbol; symbol = zbar_symbol_next(symbol))
    {
        const char *detected_code = zbar_symbol_get_data(symbol);
        on_detected_callback(detected_code);
    }

    free(gray_img);
    zbar_image_destroy(image);
    return (return_code);
}

EMSCRIPTEN_KEEPALIVE
void init() {
    scanner = zbar_image_scanner_create();
    zbar_image_scanner_set_config(scanner, 0, ZBAR_CFG_X_DENSITY, 1);
    zbar_image_scanner_set_config(scanner, 0, ZBAR_CFG_Y_DENSITY, 0);

    zbar_image_scanner_set_config(scanner, 0, ZBAR_CFG_ENABLE, 0);
    zbar_image_scanner_set_config(scanner, ZBAR_EAN8, ZBAR_CFG_ENABLE, 1);
    zbar_image_scanner_set_config(scanner, ZBAR_EAN13, ZBAR_CFG_ENABLE, 1);
    zbar_image_scanner_set_config(scanner, ZBAR_UPCA, ZBAR_CFG_ENABLE, 1);
    zbar_image_scanner_set_config(scanner, ZBAR_UPCE, ZBAR_CFG_ENABLE, 1);
}

EMSCRIPTEN_KEEPALIVE
void clean_up(uint8_t *p)
{
    zbar_image_scanner_destroy(scanner);
}

EMSCRIPTEN_KEEPALIVE
uint8_t *create_buffer(int width, int height)
{
    return malloc(width * height * 4 * sizeof(uint8_t));
}

EMSCRIPTEN_KEEPALIVE
void destroy_buffer(uint8_t *p)
{
    free(p);
}
