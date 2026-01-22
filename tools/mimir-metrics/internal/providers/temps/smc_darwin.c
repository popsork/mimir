//go:build darwin

#include "smc_darwin.h"

#include <CoreFoundation/CoreFoundation.h>
#include <IOKit/IOKitLib.h>
#include <stdint.h>
#include <string.h>

#define KERNEL_INDEX_SMC 2
#define SMC_CMD_READ_BYTES 5
#define SMC_CMD_READ_KEYINFO 9

typedef struct {
    char major;
    char minor;
    char build;
    char reserved;
    uint16_t release;
} SMCKeyData_vers_t;

typedef struct {
    uint16_t version;
    uint16_t length;
    uint32_t cpuPLimit;
    uint32_t gpuPLimit;
    uint32_t memPLimit;
} SMCKeyData_pLimitData_t;

typedef struct {
    uint32_t dataSize;
    uint32_t dataType;
    char dataAttributes;
} SMCKeyData_keyInfo_t;

typedef struct {
    uint32_t key;
    SMCKeyData_vers_t vers;
    SMCKeyData_pLimitData_t pLimitData;
    SMCKeyData_keyInfo_t keyInfo;
    uint8_t result;
    uint8_t status;
    uint8_t data8;
    uint32_t data32;
    uint8_t bytes[32];
} SMCKeyData_t;

typedef struct {
    uint32_t key;
    uint32_t dataSize;
    uint32_t dataType;
    uint8_t bytes[32];
} SMCVal_t;

static io_connect_t smc_connection = 0;

static uint32_t smc_key_from_str(const char* key) {
    if (key == NULL || strlen(key) < 4) {
        return 0;
    }
    return ((uint32_t)key[0] << 24) | ((uint32_t)key[1] << 16) | ((uint32_t)key[2] << 8) | (uint32_t)key[3];
}

static kern_return_t smc_read_key(uint32_t key, SMCVal_t* val) {
    SMCKeyData_t input;
    SMCKeyData_t output;
    size_t outputSize = sizeof(SMCKeyData_t);
    kern_return_t result;

    memset(&input, 0, sizeof(input));
    memset(&output, 0, sizeof(output));
    memset(val, 0, sizeof(SMCVal_t));

    input.key = key;
    input.data8 = SMC_CMD_READ_KEYINFO;

    result = IOConnectCallStructMethod(
        smc_connection,
        KERNEL_INDEX_SMC,
        &input,
        sizeof(input),
        &output,
        &outputSize);
    if (result != kIOReturnSuccess) {
        return result;
    }

    val->dataSize = output.keyInfo.dataSize;
    val->dataType = output.keyInfo.dataType;

    memset(&input, 0, sizeof(input));
    input.key = key;
    input.data8 = SMC_CMD_READ_BYTES;
    input.keyInfo.dataSize = val->dataSize;

    outputSize = sizeof(SMCKeyData_t);
    result = IOConnectCallStructMethod(
        smc_connection,
        KERNEL_INDEX_SMC,
        &input,
        sizeof(input),
        &output,
        &outputSize);
    if (result != kIOReturnSuccess) {
        return result;
    }

    memcpy(val->bytes, output.bytes, sizeof(output.bytes));
    return kIOReturnSuccess;
}

int smc_open(void) {
    if (smc_connection != 0) {
        return 0;
    }

    io_service_t service = IOServiceGetMatchingService(kIOMainPortDefault, IOServiceMatching("AppleSMC"));
    if (service == 0) {
        return -1;
    }

    kern_return_t result = IOServiceOpen(service, mach_task_self(), 0, &smc_connection);
    IOObjectRelease(service);

    if (result != kIOReturnSuccess) {
        smc_connection = 0;
        return (int)result;
    }

    return 0;
}

void smc_close(void) {
    if (smc_connection != 0) {
        IOServiceClose(smc_connection);
        smc_connection = 0;
    }
}

int smc_read_temp(const char* key, double* out_temp) {
    if (smc_connection == 0 || key == NULL || out_temp == NULL) {
        return -1;
    }

    uint32_t keyCode = smc_key_from_str(key);
    if (keyCode == 0) {
        return -2;
    }

    SMCVal_t val;
    kern_return_t result = smc_read_key(keyCode, &val);
    if (result != kIOReturnSuccess) {
        return (int)result;
    }

    if (val.dataSize < 2) {
        return -3;
    }

    if (val.dataType != smc_key_from_str("sp78")) {
        return -4;
    }

    int16_t raw = (int16_t)((val.bytes[0] << 8) + val.bytes[1]);
    *out_temp = ((double)raw) / 256.0;
    return 0;
}
