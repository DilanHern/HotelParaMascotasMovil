import React from 'react';
import { BaseToast } from 'react-native-toast-message';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#6b4226' }}
      contentContainerStyle={{ paddingHorizontal: 12 }}
      text1Style={{ fontWeight: '700' }}
    />
  ),
};

export default toastConfig;
export { toastConfig };
