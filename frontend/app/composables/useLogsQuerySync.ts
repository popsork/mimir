import { useRouteQuery } from '@vueuse/router';
import { useLogsFiltersStore } from '../stores/logs/filters';
import { useLogsStore } from '../stores/logs/list';

const parseList = (value: string) => {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

const toQueryValue = (value: string[], all: string[]) => {
  if (value.length === 0) return null;
  if (all.length > 0 && value.length >= all.length) return null;
  return value.join(',');
};

export const useLogsQuerySync = () => {
  const logsStore = useLogsStore();
  const filtersStore = useLogsFiltersStore();
  const { query, from: fromRef, to: toRef } = storeToRefs(logsStore);
  const {
    levels: allLevels,
    streams: allStreams,
    workloads: allWorkloads,
    hosts: allHosts,
    containers: allContainers,
    images: allImages,
    identifiers: allIdentifiers,
    loggers: allLoggers,
    selectedLevels,
    selectedStreams,
    selectedWorkloads,
    selectedHosts,
    selectedContainers,
    selectedImages,
    selectedIdentifiers,
    selectedLoggers,
  } = storeToRefs(filtersStore);

  const q = useRouteQuery<string | null>('q');
  const from = useRouteQuery<string | null>('from');
  const to = useRouteQuery<string | null>('to');
  const levels = useRouteQuery<string | null>('levels');
  const streams = useRouteQuery<string | null>('streams');
  const workloads = useRouteQuery<string | null>('workloads');
  const hosts = useRouteQuery<string | null>('hosts');
  const containers = useRouteQuery<string | null>('containers');
  const images = useRouteQuery<string | null>('images');
  const identifiers = useRouteQuery<string | null>('identifiers');
  const loggers = useRouteQuery<string | null>('loggers');

  watch(q, (value) => {
    if (typeof value === 'string') query.value = value;
  }, { immediate: true });

  watch(from, (value) => {
    if (typeof value === 'string') fromRef.value = value;
  }, { immediate: true });

  watch(to, (value) => {
    if (typeof value === 'string') toRef.value = value;
  }, { immediate: true });

  watch(levels, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedLevels.value = parseList(value);
    }
  }, { immediate: true });

  watch(streams, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedStreams.value = parseList(value);
    }
  }, { immediate: true });

  watch(workloads, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedWorkloads.value = parseList(value);
    }
  }, { immediate: true });

  watch(hosts, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedHosts.value = parseList(value);
    }
  }, { immediate: true });

  watch(containers, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedContainers.value = parseList(value);
    }
  }, { immediate: true });

  watch(images, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedImages.value = parseList(value);
    }
  }, { immediate: true });

  watch(identifiers, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedIdentifiers.value = parseList(value);
    }
  }, { immediate: true });

  watch(loggers, (value) => {
    if (typeof value === 'string' && value.length) {
      selectedLoggers.value = parseList(value);
    }
  }, { immediate: true });

  watch(query, (value) => { q.value = value || null; });
  watch(fromRef, (value) => { from.value = value || null; });
  watch(toRef, (value) => { to.value = value || null; });
  watch(selectedLevels, (value) => { levels.value = toQueryValue(value, allLevels.value); });
  watch(selectedStreams, (value) => { streams.value = toQueryValue(value, allStreams.value); });
  watch(selectedWorkloads, (value) => { workloads.value = toQueryValue(value, allWorkloads.value); });
  watch(selectedHosts, (value) => { hosts.value = toQueryValue(value, allHosts.value); });
  watch(selectedContainers, (value) => { containers.value = toQueryValue(value, allContainers.value); });
  watch(selectedImages, (value) => { images.value = toQueryValue(value, allImages.value); });
  watch(selectedIdentifiers, (value) => { identifiers.value = toQueryValue(value, allIdentifiers.value); });
  watch(selectedLoggers, (value) => { loggers.value = toQueryValue(value, allLoggers.value); });
};
