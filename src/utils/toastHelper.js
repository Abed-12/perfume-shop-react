import { toast } from 'react-toastify';

const toastOptions = {
  autoClose: 2000,
  closeOnClick: true,
  theme: "colored", 
  style: {
    borderRadius: "12px",
  }
};

export const handleSuccess = (msg) => {
  toast.success(msg, {
    ...toastOptions,
    style: {
      ...toastOptions.style,
      background: "linear-gradient(90deg, #00b09b, #96c93d)"
    },
  });
};

export const handleError = (msg) => {
  toast.error(msg, {
    ...toastOptions,
    style: {
      ...toastOptions.style,
      background: "linear-gradient(90deg, #e52d27, #b31217)",
      whiteSpace: 'pre-line' 
    },
  });
};
