//go:build darwin

#ifndef SMC_DARWIN_H
#define SMC_DARWIN_H

int smc_open(void);
void smc_close(void);
int smc_read_temp(const char* key, double* out_temp);

#endif
