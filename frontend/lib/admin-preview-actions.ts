import { writeAdminPreviewStorage } from '@/lib/constants/admin-preview';
import type { AppDispatch } from '@/store';
import { updateUser } from '@/store/slices/authSlice';
import { addToast, setAdminPreview } from '@/store/slices/uiSlice';

export function enableAdminPreview(dispatch: AppDispatch) {
  dispatch(setAdminPreview(true));
  writeAdminPreviewStorage(true);
  dispatch(updateUser({ role: 'ADMIN' }));
  dispatch(
    addToast({
      type: 'success',
      title: 'Admin preview on',
      message: 'Platform menu and admin pages are unlocked for this browser session.',
    }),
  );
}

export function disableAdminPreview(dispatch: AppDispatch) {
  dispatch(setAdminPreview(false));
  writeAdminPreviewStorage(false);
  dispatch(updateUser({ role: 'USER' }));
  dispatch(
    addToast({
      type: 'info',
      title: 'Admin preview off',
      message: 'Returned to the standard user dashboard.',
    }),
  );
}
