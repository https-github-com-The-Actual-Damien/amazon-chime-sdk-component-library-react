// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useState, useEffect } from 'react';

import { useAudioVideo } from '../../providers/AudioVideoProvider';

export function useAttendeeAudioStatus(attendeeId: string) {
  const audioVideo = useAudioVideo();
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [signalStrength, setSignalStrength] = useState(1);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    const callback = (
      _: string,
      volume: number | null,
      muted: boolean | null,
      signalStrength: number | null
    ): void => {
      if (muted !== null) {
        setMuted(muted);
      }
      if (signalStrength !== null) {
        setSignalStrength(signalStrength);
      }
      if (volume !== null) {
        setVolume(volume);
      }
    };

    audioVideo.realtimeSubscribeToVolumeIndicator(attendeeId, callback);

    return () => audioVideo.realtimeUnsubscribeFromVolumeIndicator(attendeeId);
  }, [audioVideo, attendeeId]);

  return {
    muted,
    signalStrength,
    volume,
  };
}

export default useAttendeeAudioStatus;
