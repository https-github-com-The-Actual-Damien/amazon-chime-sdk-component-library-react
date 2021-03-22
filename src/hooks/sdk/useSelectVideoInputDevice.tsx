// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useCallback } from 'react';

import { useMeetingManager } from '../../providers/MeetingProvider';
import { useLocalVideo } from '../../providers/LocalVideoProvider';

export const useSelectVideoInputDevice = () => {
  const { isLocalVideoEnabled, toggleVideo } = useLocalVideo();
  const meetingManager = useMeetingManager();

  const selectVideo = useCallback(
    async (deviceId: string) => {
      if (deviceId === 'none' && isLocalVideoEnabled === 'enabled') {
        await toggleVideo(null);
      }
      await meetingManager.selectVideoInputDevice(deviceId);
    },
    [isLocalVideoEnabled]
  );

  return selectVideo;
};

export default useSelectVideoInputDevice;
