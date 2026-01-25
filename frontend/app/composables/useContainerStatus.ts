export const useContainerStatus = () => {
  const formatStatus = (value: boolean | null) => {
    if (value === null) {
      return 'Unknown';
    }
    return value ? 'Running' : 'Stopped';
  };

  const statusClass = (value: boolean | null) => {
    if (value === null) {
      return 'text-gray-500';
    }
    return value ? 'text-green-500' : 'text-red-500';
  };

  const statusBadgeColor = (value: boolean | null): 'neutral' | 'success' | 'error' => {
    if (value === null) {
      return 'neutral';
    }
    return value ? 'success' : 'error';
  };

  const deriveMemoryUsage = (used: number | null, limit: number | null) => {
    if (used === null || limit === null || limit === 0) {
      return null;
    }
    return (used / limit) * 100;
  };

  return {
    formatStatus,
    statusClass,
    statusBadgeColor,
    deriveMemoryUsage,
  };
};
