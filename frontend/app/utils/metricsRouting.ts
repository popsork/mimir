import type { RouteLocationNormalizedLoaded } from 'vue-router';

export const treeValueFromRoute = (route: RouteLocationNormalizedLoaded) => {
  const segments = route.path.split('/').filter(Boolean);
  if (!segments.length || segments[0] !== 'metrics') {
    return 'overview';
  }

  if (segments.length === 1) {
    return 'overview';
  }

  const host = typeof route.params.host === 'string' ? route.params.host : null;
  const device = typeof route.params.device === 'string' ? route.params.device : null;
  const container = typeof route.params.container === 'string' ? route.params.container : null;

  if (segments[2] === 'docker') {
    if (host && container) {
      return `docker-container:${host}:${container}`;
    }
    if (host) {
      return `docker:${host}`;
    }
  }

  if (segments[2] === 'proxmox') {
    if (host && container) {
      return `proxmox-container:${host}:${container}`;
    }
    if (host) {
      return `proxmox:${host}`;
    }
  }

  if (host && device) {
    return `device:${host}:${device}`;
  }

  if (host) {
    return `host:${host}`;
  }

  return 'overview';
};

export const routeFromTreeValue = (value: string) => {
  if (value === 'overview') {
    return '/metrics';
  }

  if (value.startsWith('host:')) {
    const [, host] = value.split(':');
    if (!host) {
      return null;
    }
    return `/metrics/${host}`;
  }

  if (value.startsWith('device:')) {
    const [, host, device] = value.split(':');
    if (!host || !device) {
      return null;
    }
    return `/metrics/${host}/${device}`;
  }

  if (value.startsWith('docker-container:')) {
    const [, host, container] = value.split(':');
    if (!host || !container) {
      return null;
    }
    return `/metrics/${host}/docker/${container}`;
  }

  if (value.startsWith('proxmox-container:')) {
    const [, host, container] = value.split(':');
    if (!host || !container) {
      return null;
    }
    return `/metrics/${host}/proxmox/${container}`;
  }

  if (value.startsWith('docker:')) {
    const [, host] = value.split(':');
    if (!host) {
      return null;
    }
    return `/metrics/${host}/docker`;
  }

  if (value.startsWith('proxmox:')) {
    const [, host] = value.split(':');
    if (!host) {
      return null;
    }
    return `/metrics/${host}/proxmox`;
  }

  return null;
};
