// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { VideoTileState } from 'amazon-chime-sdk-js';

import { useMeetingManager } from '../MeetingProvider';
import { useAudioVideo } from '../AudioVideoProvider';

import { videoInputSelectionToDevice } from '../../utils/device-utils';
import { LocalVideoContextType, LocalVideoState } from '../../types';

const Context = createContext<LocalVideoContextType | null>(null);

const LocalVideoProvider: React.FC = ({ children }) => {
  const meetingManager = useMeetingManager();
  const audioVideo = useAudioVideo();
  const [isLocalVideoEnabled, setIsLocalVideoEnabled] = useState<
    LocalVideoState
  >('disabled');
  const [tileId, setTileId] = useState<number | null>(null);
  const [canSendLocalVideo, setCanSendLocalVideo] = useState(false);
  const videoEl = useRef<HTMLVideoElement>(null);

  const selfAttendeeId = meetingManager?.configuration?.credentials
    ?.attendeeId!;
  const meetingId = meetingManager?.meetingId!;

  // useEffect(() => {
  //   if (!audioVideo) {
  //     return;
  //   }

  //   if (audioVideo.hasStartedLocalVideoTile()) {
  //     setIsVideoEnabled(true);
  //   }

  //   return () => {
  //     setIsVideoEnabled(false);
  //   };
  // }, [audioVideo]);

  const toggleVideo = useCallback(async (): Promise<void> => {
    if (
      isLocalVideoEnabled === 'enabled' ||
      !meetingManager.selectedVideoInputDevice
    ) {
      audioVideo?.stopLocalVideoTile();
      videoEl.current &&
        audioVideo?.stopVideoPreviewForVideoInput(videoEl.current);
      setIsLocalVideoEnabled('disabled');
      await audioVideo?.chooseVideoInputDevice(null);
      const payload = { meetingId: meetingId, attendeeId: selfAttendeeId };
      // videoSendingService?.sendMessage({
      //   type: SendVideoMessageType.STOP_VIDEO,
      //   payload: payload,
      // });
    } else if (isLocalVideoEnabled === 'disabled') {
      await audioVideo?.chooseVideoInputDevice(
        videoInputSelectionToDevice(meetingManager.selectedVideoInputDevice)
      );
      if (videoEl.current) {
        console.log('Start preview before getting remote command');
        audioVideo?.startVideoPreviewForVideoInput(videoEl.current);

        setIsLocalVideoEnabled('pending');

        const payload = { meetingId: meetingId, attendeeId: selfAttendeeId };
        // videoSendingService?.sendMessage({
        //   type: SendVideoMessageType.START_VIDEO,
        //   payload: payload,
        // });
      } else {
        throw new Error('No video preview element');
      }
    }
  }, [
    audioVideo,
    isLocalVideoEnabled,
    meetingManager.selectedVideoInputDevice,
  ]);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }

    const videoTileDidUpdate = (tileState: VideoTileState) => {
      if (
        !tileState.localTile ||
        !tileState.tileId ||
        tileId === tileState.tileId
      ) {
        return;
      }

      setTileId(tileState.tileId);
    };

    audioVideo.addObserver({
      videoTileDidUpdate,
    });
  }, [audioVideo, tileId]);

  const value = useMemo(
    () => ({
      isLocalVideoEnabled,
      setIsLocalVideoEnabled,
      toggleVideo,
      tileId,
      videoEl,
      canSendLocalVideo,
      setCanSendLocalVideo,
    }),
    [
      isLocalVideoEnabled,
      setIsLocalVideoEnabled,
      canSendLocalVideo,
      setCanSendLocalVideo,
      toggleVideo,
      tileId,
      videoEl,
    ]
  );

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

const useLocalVideo = (): LocalVideoContextType => {
  const context = useContext(Context);

  if (!context) {
    throw new Error('useLocalVideo must be used within LocalVideoProvider');
  }

  return context;
};

export { LocalVideoProvider, useLocalVideo };
