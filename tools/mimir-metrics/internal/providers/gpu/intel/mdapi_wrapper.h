//go:build windows && intelmd

#ifndef MDAPI_WRAPPER_H
#define MDAPI_WRAPPER_H

#ifdef __cplusplus
extern "C" {
#endif

int mdapi_init(void);
void mdapi_shutdown(void);
int mdapi_device_count(void);
int mdapi_device_metrics(int index, double* temp, double* power, double* vram_used, double* vram_total, double* usage);

#ifdef __cplusplus
}
#endif

#endif
