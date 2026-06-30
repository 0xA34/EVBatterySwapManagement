import { useState, useEffect } from 'react';

interface GeolocationState {
  location: { lat: number; lng: number } | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let watchId: number;

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        },
        error: null,
        isLoading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      let errorMessage = 'Không thể lấy thông tin vị trí.';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Quyền truy cập vị trí bị từ chối. Vui lòng cho phép ứng dụng truy cập GPS.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Không có thông tin vị trí. Vui lòng bật GPS trên thiết bị của bạn.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Yêu cầu vị trí bị quá thời gian.';
          break;
      }
      setState((prev) => ({ ...prev, error: errorMessage, isLoading: false }));
    };

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: 'Trình duyệt của bạn không hỗ trợ định vị GPS.',
        isLoading: false,
      }));
      return;
    }

    // Attempt to get location and watch it
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
    watchId = navigator.geolocation.watchPosition(onSuccess, onError);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return state;
};
