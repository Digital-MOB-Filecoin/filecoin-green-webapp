import filesize from 'filesize';

export const convertBytesToIEC = (bytes, options = {}) => {
  return isFinite(Number(bytes) || null)
    ? filesize(Number(bytes), {
        standard: 'iec',
        ...options,
      })
    : 'N/A';
};
