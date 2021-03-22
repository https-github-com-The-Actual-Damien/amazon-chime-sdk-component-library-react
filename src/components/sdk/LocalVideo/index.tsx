// Copyright 2020-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

import { useAudioVideo } from '../../../providers/AudioVideoProvider';
import { useLocalVideo } from '../../../providers/LocalVideoProvider';
import { useMeetingManager } from '../../../providers/MeetingProvider';
import VideoTile from '../../ui/VideoTile';
import { BaseSdkProps } from '../Base';
import { useApplyVideoObjectFit } from '../../../hooks/useApplyVideoObjectFit';
import useVideoSendingCommand from '../../../hooks/useVideoSendingCommand/useVideoSendingCommand';

interface Props extends BaseSdkProps {
  id?: string;
  nameplate?: string;
}

const StyledLocalVideo = styled<any>(VideoTile)`
  ${(props) => (!props.active ? 'display: none' : '')};
`;

export const LocalVideo: React.FC<Props> = ({ nameplate, ...rest }) => {
  const { tileId, isLocalVideoEnabled, videoEl } = useLocalVideo();
  const audioVideo = useAudioVideo();
  const meetingManager = useMeetingManager();
  const canSendLocalVideo = useVideoSendingCommand();

  useApplyVideoObjectFit(videoEl);

  useEffect(() => {
    if (!audioVideo) {
      return;
    }
    const sendLocalVideo = async () => {
      await audioVideo.chooseVideoInputDevice(
        meetingManager.selectedVideoInputDevice
      );
      audioVideo.startLocalVideoTile();
    };

    const sendLocalVideoPreview = async () => {
      await audioVideo.chooseVideoInputDevice(
        meetingManager.selectedVideoInputDevice
      );
      if (videoEl.current) {
        audioVideo.startVideoPreviewForVideoInput(videoEl.current);
      } else {
        throw new Error('No video preview element to show preview!');
      }
    };

    if (canSendLocalVideo && isLocalVideoEnabled !== 'disabled') {
      if (videoEl.current) {
        audioVideo.stopVideoPreviewForVideoInput(videoEl.current);
      }
      sendLocalVideo();
    }
    if (!canSendLocalVideo && isLocalVideoEnabled === 'enabled') {
      audioVideo.stopLocalVideoTile();
      sendLocalVideoPreview();
    }
  }, [audioVideo, canSendLocalVideo]);

  useEffect(() => {
    if (!audioVideo || !tileId || !videoEl.current || !canSendLocalVideo) {
      return;
    }

    audioVideo.bindVideoElement(tileId, videoEl.current);

    return () => {
      const tile = audioVideo.getVideoTile(tileId);
      if (tile) {
        audioVideo.unbindVideoElement(tileId);
      }
    };
  }, [audioVideo, tileId, canSendLocalVideo]);

  return (
    <StyledLocalVideo
      active={canSendLocalVideo}
      nameplate={nameplate}
      ref={videoEl}
      {...rest}
    />
  );
};

export default LocalVideo;
